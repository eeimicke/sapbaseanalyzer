
# Implementierung: Schritt 1 - SAP BTP Service-Auswahl

## Ziel

Der erste Schritt der Anwendung wird so umgebaut, dass er **echte Service-Daten** vom SAP GitHub Repository laedt, anstatt statische Mock-Daten zu verwenden. Der Benutzer kann dann einen Service auswaehlen und sieht detaillierte Informationen inkl. kategorisierter Links.

---

## Was passiert auf der Seite (Benutzer-Sicht)

### Beim Laden der Seite:
1. Ein **Lade-Indikator** erscheint mit der Nachricht "Services werden geladen..."
2. Im Hintergrund werden ueber **200 SAP BTP Services** vom GitHub Repository abgerufen
3. Nach dem Laden werden die Services in einer **Karten-Ansicht** angezeigt

### Bei der Service-Auswahl:
1. **Suchfeld** - Der Benutzer kann nach Service-Namen oder Kategorie suchen
2. **Kategorie-Filter** - Tabs fuer "Alle", "Integration", "AI", "Data", "Security", "Extension"
3. **Service-Karten** zeigen:
   - Service-Name und Beschreibung
   - Kategorie-Badge (z.B. "Integration", "AI")
   - Link zum SAP Discovery Center (externe Seite)
4. **Klick auf eine Karte** waehlt den Service aus (gruener Rahmen)
5. **Weiter-Button** erscheint und laedt beim Klick die Detail-Informationen des Services

### Nach Service-Auswahl:
1. Ein kurzer **Ladevorgang** holt die detaillierten Informationen (servicePlans, Links, etc.)
2. Der Benutzer gelangt zum naechsten Schritt (Map Discovery)

---

## Technische Umsetzung

### 1. Neue Dateien erstellen

**`src/lib/sap-services.ts`** - Service-API-Logik
- Funktion `fetchServiceInventory()`: Laedt die Service-Liste von GitHub
- Funktion `fetchServiceDetails(technicalId)`: Laedt Detail-JSON eines Services
- TypeScript-Typen fuer Service-Daten

**`src/hooks/use-sap-services.ts`** - React Hook
- Verwendet TanStack Query fuer Caching und Loading-States
- `useServiceInventory()`: Hook fuer Service-Liste
- `useServiceDetails(id)`: Hook fuer Detail-Daten

### 2. Bestehende Dateien anpassen

**`src/pages/Index.tsx`** - Hauptseite
- Mock-Daten entfernen und durch API-Hooks ersetzen
- Lade-Zustaende mit Skeleton-Komponenten anzeigen
- Fehlerbehandlung hinzufuegen falls API nicht erreichbar
- Service-Karten mit echten Daten befuellen

---

## Datenfluss

```text
+------------------+     +-------------------+     +------------------+
|  GitHub API      | --> |  use-sap-services | --> |  Index.tsx       |
|  inventory.json  |     |  (TanStack Query) |     |  Service Cards   |
+------------------+     +-------------------+     +------------------+
         |
         v
+-------------------+
| developer/{id}.json
| (bei Auswahl)     |
+-------------------+
```

---

## API-Endpunkte

| Endpunkt | Zweck |
|----------|-------|
| `https://raw.githubusercontent.com/SAP-samples/btp-service-metadata/main/v1/inventory.json` | Service-Katalog (200+ Services) |
| `https://raw.githubusercontent.com/SAP-samples/btp-service-metadata/main/v1/developer/{technicalId}.json` | Detail-Informationen pro Service |

---

## Neue Funktionen

### Service-Filter nach Kategorien
- Alle Services werden nach ihrer `category` gruppiert
- Verfuegbare Kategorien: AI, Integration, Data & Analytics, Security, Extension Suite, etc.
- Dynamische Tab-Generierung basierend auf vorhandenen Kategorien

### Verbesserte Suche
- Suche in Name, Beschreibung UND Kategorie
- Echtzeit-Filterung waehrend der Eingabe

### Fehlerbehandlung
- Fallback auf statische Mock-Daten falls GitHub nicht erreichbar
- Benutzerfreundliche Fehlermeldung mit Retry-Button

---

## Dateien die erstellt werden

| Datei | Beschreibung |
|-------|--------------|
| `src/lib/sap-services.ts` | API-Funktionen und TypeScript-Typen |
| `src/hooks/use-sap-services.ts` | React Hooks mit TanStack Query |

## Dateien die geaendert werden

| Datei | Aenderungen |
|-------|-------------|
| `src/pages/Index.tsx` | Mock-Daten ersetzen, Hooks einbinden, Lade-Zustaende |

---

## UI-Hinweise fuer den Benutzer

Die Seite wird folgende **Erklaerungen** direkt im UI anzeigen:

1. **Header-Bereich**: "WIREFRAME" Badge wird durch "LIVE DATA" ersetzt
2. **Unter der Ueberschrift**: Erklaerungstext "Daten werden direkt vom SAP GitHub Repository geladen"
3. **Bei Service-Karten**: Anzahl der gefundenen Services anzeigen (z.B. "215 Services gefunden")
4. **Beim Laden**: Skeleton-Karten zeigen visuell dass Daten geladen werden

---

## Vorteile dieser Implementierung

- **Immer aktuell**: Services werden direkt von SAP's offizieller Quelle geladen
- **Kein Backend noetig**: Rein clientseitige Loesung fuer diesen Schritt
- **Performant**: TanStack Query cached die Daten automatisch
- **Robust**: Fallback auf Mock-Daten bei Netzwerkproblemen
