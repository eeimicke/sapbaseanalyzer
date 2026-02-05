
# Plan: Landing Page mit eingeschränkter Analyse-Funktion für Besucher

## Übersicht
Die Landing Page soll die vollständige Analyse-Funktionalität erhalten (wie nach dem Login), jedoch mit einer Einschränkung: Nicht angemeldete Besucher dürfen **maximal 2 Analysen** durchführen. Nach Erreichen dieses Limits wird eine Aufforderung zur Anmeldung angezeigt.

## Architektur-Analyse

### Aktuelle Struktur
- **Landing Page (`/`)**: Zeigt nur eine Vorschau von 10 hoch-relevanten Services, leitet bei "Analyse starten" zur Auth-Seite weiter
- **Dashboard (`/app`)**: Vollständige Funktionalität mit Service-Auswahl, AI-Analyse, Export

### Zu übertragende Komponenten
1. Service-Auswahl mit Suche, Kategorien und Relevanz-Filter
2. ServiceCard mit Quick-Summary (Perplexity)
3. AI-Analyse (Step 2) mit Perplexity Full-Basis-Analyse
4. Export-Funktion (Step 3)

## Implementierungs-Plan

### 1. Usage-Tracking für anonyme Besucher
**Neuer Hook: `src/hooks/use-guest-usage.ts`**

Speichert die Anzahl durchgeführter Analysen im localStorage:
```text
Funktionen:
- getGuestAnalysisCount(): number
- incrementGuestAnalysisCount(): void
- hasReachedGuestLimit(): boolean (Limit = 2)
- resetGuestUsage(): void (für Tests)
```

### 2. Landing Page erweitern
**Datei: `src/pages/Landing.tsx`**

Änderungen:
- Import der notwendigen Komponenten und Hooks aus Index.tsx
- Hinzufügen des 3-Schritt-Workflows (Service-Auswahl → Analyse → Export)
- Integration von Suche, Kategorien und Relevanz-Filter
- Anzeige des Guest-Usage-Status (z.B. "1 von 2 kostenlosen Analysen verwendet")

### 3. Analyse-Limit-Dialog
**Neue Komponente: `src/components/GuestLimitDialog.tsx`**

Wird angezeigt, wenn ein Besucher das 2-Analyse-Limit erreicht:
```text
Inhalt:
- Icon + Überschrift: "Kostenlose Analysen aufgebraucht"
- Text: Erklärung der Vorteile eines Accounts
- Buttons: "Jetzt registrieren" (primary), "Später" (outline)
```

### 4. Analyse-Prompt für Gäste
Da der `useAnalysisPrompt` Hook einen authentifizierten User erwartet (RLS), wird für Gäste ein **Default-Prompt** verwendet:
- Laden eines öffentlichen/Standard-Prompts
- Keine Prompt-Bearbeitungsfunktion für Gäste

### 5. Übersetzungen ergänzen
**Datei: `src/hooks/useLanguage.tsx`**

Neue Keys:
```text
"guest.usageCounter": "{{count}} of 2 free analyses used"
"guest.limitReached": "Free analyses used up"
"guest.limitDescription": "Register for free to continue..."
"guest.registerNow": "Register now"
"guest.maybeLater": "Maybe later"
```

## Workflow-Diagramm

```text
Besucher auf Landing Page (/)
        │
        ▼
┌─────────────────────────────┐
│  Step 1: Service-Auswahl    │
│  (Suche, Filter, 589+ SVCs) │
└─────────────────────────────┘
        │
        ▼ [Service auswählen + "Analyse starten"]
        │
┌───────┴───────┐
│ Limit-Check   │
└───────┬───────┘
        │
   ┌────┴────┐
   │< 2 ?    │
   └────┬────┘
    Ja  │  Nein
   ┌────┘  └────┐
   │            │
   ▼            ▼
┌──────────┐  ┌───────────────┐
│ Step 2:  │  │ Limit-Dialog  │
│ Analyse  │  │ → Auth-Page   │
└──────────┘  └───────────────┘
   │
   ▼
┌──────────┐
│ Step 3:  │
│ Export   │
└──────────┘
   │
   ▼
[Zähler +1 im localStorage]
```

## Technische Details

### localStorage Key
```text
Key: "sap-basis-analyzer-guest-analyses"
Value: { count: number, lastReset: timestamp }
```

### Komponenten-Struktur
```text
Landing.tsx (erweitert)
├── GuestUsageBanner (zeigt Zähler)
├── GuestLimitDialog (Modal bei Limit)
├── ServiceCard (unverändert)
└── Analyse-Workflow (adaptiert von Index.tsx)
    ├── Step 1: Service-Auswahl
    ├── Step 2: AI-Analyse (ohne Prompt-Editor)
    └── Step 3: Export/Summary
```

## Dateien die erstellt/geändert werden

| Aktion | Datei | Beschreibung |
|--------|-------|--------------|
| NEU | `src/hooks/use-guest-usage.ts` | Hook für localStorage Usage-Tracking |
| NEU | `src/components/GuestLimitDialog.tsx` | Modal-Dialog bei Limit |
| NEU | `src/components/GuestUsageBanner.tsx` | Anzeige "X von 2 Analysen" |
| ÄNDERN | `src/pages/Landing.tsx` | Vollständiger Workflow hinzufügen |
| ÄNDERN | `src/hooks/useLanguage.tsx` | Neue Übersetzungen |

## Sicherheitsaspekte

- **Keine sensiblen Daten**: Der Zähler im localStorage kann manipuliert werden, was akzeptabel ist (kein echtes Billing)
- **Perplexity API**: Wird auch für Gäste über Edge Function aufgerufen (keine API-Key-Exposition)
- **Prompt**: Gäste sehen einen Standard-Prompt, können ihn aber nicht bearbeiten

## Vorteile für Benutzer

1. **Sofortiger Wert**: Besucher können die App direkt testen
2. **Niedrige Einstiegshürde**: Kein Account nötig für ersten Eindruck
3. **Klare Conversion**: Nach 2 Analysen sanfte Aufforderung zur Registrierung
