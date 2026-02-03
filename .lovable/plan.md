
# Plan: Verbesserter Basis-Prompt mit Git-Links und Service-Dokumentation

## Analyse des aktuellen Zustands

### Aktueller Basis-Prompt (aus DB)
Der aktuelle Prompt fordert eine JSON-strukturierte Analyse mit Kategorien wie:
- `basisRelevance`, `basisResponsibilities`, `nonBasisResponsibilities`
- `interfacesAndConnectivity`, `securityAndIAMAspects`, `operationsAndMonitoring`

### Verfugbare Datenquellen
Die folgenden Informationen stehen pro Service zur Verfugung:

1. **GitHub Repository Link**
   - Format: `https://raw.githubusercontent.com/SAP-samples/btp-service-metadata/main/v1/developer/{fileName}.json`
   - Beispiel fur Cloud Foundry Runtime: `application_runtime.json`

2. **Links aus den JSON-Files** (nach Classification gruppiert):
   - Discovery Center (z.B. `https://discovery-center.cloud.sap/serviceCatalog/cloud-foundry-runtime`)
   - Documentation (z.B. SAP Help Portal Links)
   - API Hub, Support, Tutorial, Marketing, etc.

3. **Service-Metadaten**:
   - servicePlans mit Regionen/DataCenters
   - supportComponents (SAP Support-Komponenten)
   - apis (API-Definitionen)

## Vorgeschlagener verbesserter Basis-Prompt

Der neue Prompt soll:

1. **Explizit auf die Dokumentationsquellen verweisen** - Perplexity soll die bereitgestellten Links als primare Recherchequellen nutzen

2. **GitHub-Repository-Link integrieren** - Als Verweis auf die offizielle Metadaten-Quelle

3. **Strukturierte Markdown-Ausgabe anfordern** - Statt JSON, da die Ausgabe fur Wiki-Export (Confluence) gedacht ist

4. **SAP Basis-Perspektive beibehalten** - Fokus auf Operations, Security, Monitoring, Connectivity

### Neuer Prompt-Text

```text
Du bist ein erfahrener SAP Basis-Administrator mit tiefem Verstandnis fur SAP BTP.

## Deine Aufgabe
Analysiere den bereitgestellten SAP BTP Service aus Basis-Perspektive und erstelle eine strukturierte Zusammenfassung fur ein internes Wiki (Confluence).

## Recherche-Quellen
Nutze die bereitgestellten Dokumentationslinks als primare Quellen:
- Discovery Center: Offizielle Service-Ubersicht und Tutorials
- SAP Help Portal: Technische Dokumentation und Konfigurationsanleitungen
- API Hub: API-Referenzen und Integrationsdetails

Die Service-Metadaten stammen aus dem offiziellen SAP GitHub Repository:
https://github.com/SAP-samples/btp-service-metadata

## Analyse-Struktur
Erstelle die Analyse in folgendem Markdown-Format:

### 1. Service-Uberblick
- Kurzbeschreibung (2-3 Satze)
- Hauptanwendungsfalle
- Basis-Relevanz: [Hoch/Mittel/Niedrig]

### 2. Basis-Verantwortlichkeiten
Was liegt im Verantwortungsbereich von SAP Basis/Platform Operations?
- Provisionierung und Setup
- Subaccount-Konfiguration
- Instanz-Management
- Berechtigungen und Rollen

### 3. Security und IAM
- Erforderliche Rollen und Berechtigungskonzept
- Authentifizierung (Identity Provider, SSO)
- Zertifikatsverwaltung
- Compliance-Aspekte

### 4. Integration und Konnektivitat
- Destinations und Cloud Connector
- On-Premise-Anbindung
- Abhangigkeiten zu anderen BTP Services
- Netzwerk-Anforderungen

### 5. Monitoring und Operations
- Verfugbare Monitoring-Tools
- Logging und Alerting
- Health Checks
- Performance-Metriken

### 6. Lifecycle Management
- Update-/Upgrade-Prozesse
- Backup und Recovery
- Deprecation-Hinweise
- SLA-Informationen

### 7. Nicht-Basis-Themen (zur Abgrenzung)
Was gehort NICHT zu Basis, sondern zu Entwicklung/Fachbereich?

### 8. Referenzen
Liste der verwendeten Dokumentationslinks mit kurzer Beschreibung.

## Wichtige Hinweise
- Antworte auf Deutsch
- Nutze Bullet Points fur bessere Lesbarkeit
- Zitiere spezifische Dokumentationsseiten wo moglich
- Kennzeichne unklare/nicht-dokumentierte Aspekte
```

## Technische Umsetzung

### Schritt 1: Datenbank-Prompt aktualisieren
- SQL-Migration zum Aktualisieren des `prompt_text` in der `analysis_prompts` Tabelle
- Alternativ: UI-Anpassung zum Bearbeiten des Prompts direkt in der Anwendung

### Schritt 2: Service-Kontext erweitern
In `src/lib/api/perplexity.ts` den GitHub-Repository-Link zum Service-Kontext hinzufugen:

```typescript
// In analyzeWithFullContext()
const githubRepoUrl = `https://github.com/SAP-samples/btp-service-metadata/blob/main/v1/developer/${serviceDetails.fileName || serviceName.toLowerCase()}.json`;
```

### Schritt 3: Edge Function anpassen
In `supabase/functions/perplexity-analyze/index.ts` die `formatServiceContext()` Funktion erweitern:
- GitHub-Repository-Link als Quellenverweis hinzufugen
- Links nach Classification gruppiert und priorisiert darstellen

### Schritt 4: UI-Anpassung (optional)
- Im Prompt-Editor (Step 2) einen "Reset to Default" Button hinzufugen
- Vorschau des generierten Service-Kontexts anzeigen

## Erwartete Verbesserungen

| Aspekt | Vorher | Nachher |
|--------|--------|---------|
| Ausgabe-Format | JSON (schwer lesbar) | Markdown (Wiki-ready) |
| Quellen-Referenz | Nicht explizit | GitHub + Doku-Links |
| Wiki-Export | Erfordert Transformation | Direkt nutzbar |
| Struktur | Technisch fur Entwickler | Optimiert fur Confluence |
