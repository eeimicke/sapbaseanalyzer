
# Plan: Automatische Service-Kategorisierung nach Basis-Relevanz

## Übersicht

Die Anwendung soll SAP BTP Services automatisch nach ihrer Relevanz für SAP Basis-Administratoren klassifizieren. Eine KI-gestützte Kategorisierung bewertet jeden Service und zeigt die Relevanz visuell in der Service-Auswahl an.

## Konzept

```text
┌─────────────────────────────────────────────────────────────────┐
│                    Service-Karte (erweitert)                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐                                           │
│  │ 🟢 HOCH          │  ← Basis-Relevanz Badge (farbcodiert)     │
│  └──────────────────┘                                           │
│                                                                  │
│  SAP Connectivity Service                                        │
│  Verbindet Cloud mit On-Premise Systemen...                     │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ "Zentral für Basis: Destinations, Cloud Connector,      │    │
│  │  Zertifikate, Netzwerk-Konfiguration"                   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  [Filter: 🟢 Hoch] [🟡 Mittel] [🔴 Niedrig] [Alle]              │
└─────────────────────────────────────────────────────────────────┘
```

## Relevanz-Kategorien

| Stufe | Farbe | Beschreibung |
|-------|-------|--------------|
| **Hoch** | Grün | Kernaufgaben für SAP Basis (Connectivity, IAM, Monitoring) |
| **Mittel** | Gelb | Teilweise Basis-relevant (Setup, aber Entwickler-lastig) |
| **Niedrig** | Rot | Primär Entwicklung/Fachbereich (keine Basis-Aufgaben) |

## Implementierung

### 1. Backend: Neue Edge Function `classify-relevance`

**Datei:** `supabase/functions/classify-relevance/index.ts`

- Nutzt **Lovable AI** (google/gemini-3-flash-preview) für schnelle Klassifizierung
- Erhält: Service-Name, Beschreibung, Kategorie
- Liefert: Relevanz-Stufe (hoch/mittel/niedrig) + Begründung

**Prompt-Struktur:**
```
Du bist ein SAP Basis-Experte. Klassifiziere den Service nach Basis-Relevanz:

- HOCH: Provisionierung, Security/IAM, Connectivity, Monitoring, Lifecycle
- MITTEL: Setup durch Basis, aber primär Entwickler-Nutzung
- NIEDRIG: Reine Entwickler/Fachbereichs-Themen

Antworte NUR mit JSON: {"relevance": "hoch"|"mittel"|"niedrig", "reason": "..."}
```

### 2. Datenbank: Cache-Tabelle für Klassifizierungen

**Tabelle:** `service_relevance_cache`

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | uuid | Primary Key |
| service_technical_id | text | SAP Service technicalId |
| relevance | text | hoch/mittel/niedrig |
| reason | text | Kurzbegründung |
| created_at | timestamp | Erstellungsdatum |

- Caching verhindert wiederholte API-Aufrufe
- Services ändern sich selten, Cache ist langlebig

### 3. Frontend: UI-Erweiterungen

**Neue Komponenten:**

1. **Relevanz-Badge** in ServiceCard
   - Farbcodierter Badge (Grün/Gelb/Rot)
   - Tooltip mit Begründung
   - Lade-Skeleton während Klassifizierung

2. **Relevanz-Filter** in der Service-Auswahl
   - Zusätzliche Tabs: "Hoch | Mittel | Niedrig | Alle"
   - Kombinierbar mit Kategorie-Filter

3. **Batch-Klassifizierung** im Hintergrund
   - Beim Laden der Service-Liste: Parallel 5-10 Services klassifizieren
   - Progressive Anzeige während Laden

### 4. Hook: `useServiceRelevance`

**Datei:** `src/hooks/use-service-relevance.ts`

```typescript
// Lädt gecachte Relevanz oder triggert Klassifizierung
function useServiceRelevance(serviceId: string) {
  // 1. Prüfe Cache in DB
  // 2. Falls nicht vorhanden: rufe classify-relevance auf
  // 3. Speichere Ergebnis im Cache
  return { relevance, reason, isLoading };
}
```

## Technische Details

### Edge Function - API-Aufruf

```typescript
// Lovable AI Gateway für schnelle Klassifizierung
const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "google/gemini-3-flash-preview",
    messages: [
      { role: "system", content: CLASSIFICATION_PROMPT },
      { role: "user", content: `Service: ${serviceName}\n${description}` }
    ],
    max_tokens: 100,
  }),
});
```

### Datenbank-Migration

```sql
CREATE TABLE public.service_relevance_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_technical_id TEXT UNIQUE NOT NULL,
  relevance TEXT NOT NULL CHECK (relevance IN ('hoch', 'mittel', 'niedrig')),
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: Öffentlich lesbar
ALTER TABLE service_relevance_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read" ON service_relevance_cache FOR SELECT USING (true);
CREATE POLICY "Edge functions can insert" ON service_relevance_cache FOR INSERT WITH CHECK (true);
```

## Änderungen im Überblick

| Bereich | Änderung |
|---------|----------|
| `supabase/functions/classify-relevance/index.ts` | Neue Edge Function |
| `src/hooks/use-service-relevance.ts` | Neuer Hook für Relevanz-Daten |
| `src/components/ServiceCard.tsx` | Relevanz-Badge hinzufügen |
| `src/pages/Index.tsx` | Relevanz-Filter in Tabs |
| `src/lib/sap-services.ts` | Typ-Erweiterung für Relevanz |
| Datenbank | Neue Tabelle + RLS |

## Benutzer-Workflow

1. **Öffne Service-Auswahl** → Services werden geladen
2. **Klassifizierung läuft** → Batch-Verarbeitung im Hintergrund
3. **Badges erscheinen** → Grün/Gelb/Rot je nach Relevanz
4. **Filter nutzen** → "Zeige nur Basis-relevante Services (Hoch)"
5. **Service auswählen** → Begründung im Tooltip sichtbar
