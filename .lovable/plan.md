# SAP BTP Service Basis-Analyzer

Ein intelligentes Tool, das SAP Basis-Administratoren hilft, relevante Einrichtungs- und Betreuungsthemen für SAP BTP Services zu identifizieren und **Integrationskosten abzuschätzen**.

---

## 🔍 Schritt 1: Service-Katalog & Auswahl

Eine übersichtliche Service-Auswahl mit allen SAP BTP Services:

- **Kategorisierte Ansicht** - Services nach Kategorien (AI, Integration, Data & Analytics, etc.)
- **Suchfunktion** - Schnelles Finden von Services
- **Service-Karten** - Kurzbeschreibung, Kategorie und Preismodell auf einen Blick
- **Direkte Links** - Verbindung zur offiziellen SAP Discovery Center Dokumentation

---

## 🕷️ Schritt 2: Dokumentations-Crawling

Nach Service-Auswahl wird die SAP-Dokumentation automatisch gecrawlt:

- **Automatisches Crawling** - Firecrawl durchsucht die SAP Discovery Center Seite
- **Tiefes Scanning** - Verfolgt Links zu weiterführender Dokumentation
- **Pricing-Extraktion** - Preismodelle und Lizenzinformationen erfassen
- **Strukturierte Extraktion** - Markdown-Format für KI-Analyse
- **Fortschrittsanzeige** - Visuelles Feedback während des Crawlings

---

## 🤖 Schritt 3: KI-gestützte Basis-Analyse

Perplexity AI analysiert die gecrawlte Dokumentation und identifiziert SAP Basis-relevante Themen:

### Basis-Kategorien:
- **Berechtigungen & Security** - Rollen, Trust-Konfiguration, Sicherheitskonzepte
- **Integration & Konnektivität** - Destinations, Cloud Connector, API-Konfiguration
- **Monitoring & Operations** - Überwachung, Logging, Performance, Alerts
- **Lifecycle Management** - Updates, Transport, Backup, Recovery

### Aufwandsschätzung pro Thema:
- **Komplexität** (Niedrig/Mittel/Hoch)
- **Geschätzter Zeitaufwand** in Personentagen
- **Benötigte Skills** (z.B. BTP Admin, Security Expert, Integration Specialist)

---

## 💰 Schritt 4: Kostenabschätzung

Die KI erstellt eine detaillierte Kostenschätzung für die Integration:

### Lizenz- & Nutzungskosten:
- **Preismodell** - Subscription, Pay-per-Use, oder Hybrid
- **Basis-Kosten** - Monatliche/jährliche Grundgebühren
- **Verbrauchsabhängige Kosten** - API-Calls, Speicher, Benutzer
- **Voraussetzungen** - Benötigte Basis-Services (z.B. Cloud Foundry Runtime)

### Implementierungskosten:
- **Einrichtungsaufwand** - Personentage für initiale Konfiguration
- **Schulungsaufwand** - Trainingstage für Basis-Team
- **Externe Beratung** - Empfehlung ob externe Hilfe sinnvoll ist

### Betriebskosten (laufend):
- **Wartungsaufwand** - Geschätzte monatliche Betreuungsstunden
- **Monitoring-Kosten** - Zusätzliche Tools oder Services
- **Update-Zyklen** - Erwarteter Aufwand für Updates

### Kostenzusammenfassung:
- **Einmalkosten** - Gesamtaufwand für Integration
- **Monatliche Kosten** - Lizenz + Betrieb
- **TCO (3 Jahre)** - Total Cost of Ownership Schätzung
- **ROI-Hinweise** - Potenzielle Einsparungen oder Mehrwerte

---

## 📊 Schritt 5: Strukturierte Übersicht & Report

Die Ergebnisse werden übersichtlich dargestellt:

- **Executive Summary** - Kurzzusammenfassung für Management
- **Kategorisierte Themen** - Nach Basis-Bereichen gruppiert
- **Relevanz-Bewertung** - Wichtigkeit für Einrichtung vs. laufenden Betrieb
- **Handlungsempfehlungen** - Konkrete Schritte für Basis-Admins
- **Kostenübersicht** - Visuelle Darstellung mit Charts
- **Quellen-Referenzen** - Links zur Original-Dokumentation

---

## 💾 Datenspeicherung

Alle Analysen werden dauerhaft gespeichert:

- **Service-History** - Bereits analysierte Services schnell abrufen
- **Kostenvergleich** - Mehrere Services vergleichen
- **Such- und Filterfunktion** - Gespeicherte Analysen durchsuchen
- **Export-Option** - Ergebnisse als PDF oder Markdown exportieren

---

## Technische Umsetzung

### Frontend
- React mit übersichtlichem Multi-Step-Wizard
- Recharts für Kostenvisualisierung
- Responsive Design für alle Geräte

### Backend
- Supabase Edge Functions für Crawling und KI-Analyse
- Separate Functions für Pricing-Extraktion

### Datenbank
- Supabase PostgreSQL für:
  - Service-Katalog
  - Analyse-Ergebnisse
  - Kostenschätzungen
  - User-History

### Integrationen
- **Firecrawl** - Dokumentations- und Pricing-Crawling
- **Perplexity AI** - Basis-Analyse und Kostenabschätzung

---

## Datenbank-Schema

```sql
-- Services Katalog
services (id, name, category, description, discovery_url, pricing_model, created_at)

-- Analyse-Ergebnisse
analyses (id, service_id, crawled_content, basis_topics, cost_estimation, created_at)

-- Basis-Themen
basis_topics (id, analysis_id, category, topic, complexity, effort_days, required_skills)

-- Kostenschätzungen
cost_estimates (id, analysis_id, license_type, monthly_cost, setup_effort, training_effort, tco_3years)
```
