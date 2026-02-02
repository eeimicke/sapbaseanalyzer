
# Analyse-Prompt Zusammensetzung: Basis-Prompt + Service-Daten

## Konzept

Der finale Analyse-Prompt wird aus zwei Teilen zusammengesetzt:

```text
┌─────────────────────────────────────────────────────────────────┐
│  FINALER ANALYSE-PROMPT                                         │
├─────────────────────────────────────────────────────────────────┤
│  1. BASIS-PROMPT (aus Datenbank)                                │
│     - Der editierbare SAP Basis-Administrator Prompt            │
│     - Definiert die Analyse-Perspektive und JSON-Ausgabeformat  │
│                                                                 │
│  2. SERVICE-DATEN (aus JSON-Metadaten)                          │
│     - Service-Name und Beschreibung                             │
│     - Alle Links (Discovery Center, Dokumentation, etc.)        │
│     - Service-Plans mit Regionen                                │
│     - Support-Komponenten                                       │
└─────────────────────────────────────────────────────────────────┘
```

## UI-Darstellung in Schritt 2

Die UI wird beide Prompt-Teile übersichtlich anzeigen:

1. **Basis-Prompt Card** (bereits vorhanden, editierbar)
2. **NEU: Service-Daten Card** (read-only, zeigt die übergebenen JSON-Infos)

## Technische Umsetzung

### 1. UI-Erweiterung in Index.tsx (Schritt 2)

Neue Card unterhalb der editierbaren Prompt-Card:

```tsx
{/* Service-Daten als Analyse-Kontext */}
<Card className="border-border/50">
  <CardHeader>
    <CardTitle className="flex items-center gap-2 text-base">
      <Database className="w-4 h-4 text-primary" />
      Service-Kontext (aus Metadaten)
    </CardTitle>
    <CardDescription>
      Diese Informationen werden automatisch an die KI übergeben.
    </CardDescription>
  </CardHeader>
  <CardContent>
    <ScrollArea className="h-[200px]">
      <pre className="text-xs font-mono bg-muted/30 p-4 rounded">
        {JSON.stringify(serviceMetadata, null, 2)}
      </pre>
    </ScrollArea>
  </CardContent>
</Card>
```

### 2. Perplexity Edge Function Anpassung

Die Edge Function wird erweitert, um:

1. Den **Basis-Prompt aus der Datenbank** zu laden (anstatt hartcodierte Prompts zu verwenden)
2. Die vollständigen **Service-Metadaten** als strukturierten Kontext zu formatieren
3. Beides zu einem finalen Prompt zusammenzuführen

**Neues Request-Format:**

```typescript
interface AnalysisRequest {
  serviceName: string;
  serviceDescription: string;
  serviceLinks: ServiceLink[];
  servicePlans?: ServicePlan[];           // NEU
  supportComponents?: SupportComponent[]; // NEU
  category: 'security' | 'integration' | 'monitoring' | 'lifecycle' | 'quick-summary' | 'full-basis';
  basePrompt?: string;                    // NEU - optionaler Override aus DB
}
```

**Prompt-Zusammensetzung in der Edge Function:**

```typescript
// 1. Basis-Prompt (aus DB oder Request)
const systemPrompt = basePrompt || await fetchActivePromptFromDB();

// 2. Service-Daten formatieren
const serviceContext = formatServiceMetadata({
  serviceName,
  serviceDescription,
  serviceLinks,
  servicePlans,
  supportComponents
});

// 3. An Perplexity senden
const messages = [
  { role: 'system', content: systemPrompt },
  { role: 'user', content: serviceContext }
];
```

### 3. Frontend - Prompt mitschicken

Das Frontend lädt den aktiven Prompt aus der DB und sendet ihn zusammen mit den Service-Daten:

```typescript
// In startAnalysis()
const result = await perplexityApi.analyze(
  selectedService.displayName,
  selectedService.description,
  serviceLinks,
  servicePlans,           // NEU
  supportComponents,      // NEU
  'full-basis',           // Neue Kategorie für kombinierte Analyse
  prompt?.prompt_text     // Basis-Prompt aus DB
);
```

### 4. API-Client Erweiterung

Neue Funktion im `perplexityApi`:

```typescript
async analyzeWithFullContext(
  serviceName: string,
  serviceDescription: string,
  serviceDetails: ServiceDetails,
  basePrompt: string
): Promise<AnalysisResponse>
```

## Dateien die geändert werden

| Datei | Änderung |
|-------|----------|
| `src/pages/Index.tsx` | Neue Card zur Anzeige der Service-Metadaten, Anpassung `startAnalysis()` |
| `src/lib/api/perplexity.ts` | Neue Funktion `analyzeWithFullContext()` mit erweiterten Parametern |
| `supabase/functions/perplexity-analyze/index.ts` | Neue Kategorie `full-basis`, Prompt-Zusammensetzung, erweiterte Metadaten-Verarbeitung |

## Vorteile dieser Lösung

1. **Transparenz**: Nutzer sehen genau welche Daten an die KI geschickt werden
2. **Flexibilität**: Basis-Prompt ist editierbar, Service-Daten kommen automatisch
3. **Vollständige Metadaten**: Nicht nur Links, sondern auch Plans und Support-Komponenten
4. **Wartbarkeit**: Prompt-Änderungen erfordern kein Code-Deployment
