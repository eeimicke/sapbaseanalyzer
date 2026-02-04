
# User Login Implementierung

## Übersicht
Implementierung einer einfachen E-Mail/Passwort-Authentifizierung für den SAP Basis Analyzer. Der Login ermöglicht es Benutzern, sich anzumelden und die Anwendung zu nutzen.

## Was wird erstellt

### 1. Login-Seite
- Neue Seite `/auth` mit Login- und Registrierungsformular
- Umschaltbar zwischen "Anmelden" und "Registrieren"
- E-Mail und Passwort Eingabefelder
- Passwort-Bestätigung bei Registrierung
- Fehleranzeige bei ungültigen Eingaben

### 2. Authentifizierungs-Hook
- Neuer Hook `useAuth` für Session-Management
- Automatische Session-Erkennung
- Login, Logout und Registrierungs-Funktionen
- Zentraler Auth-State für die gesamte Anwendung

### 3. Header-Integration
- Login/Logout Button im Header
- Anzeige der angemeldeten E-Mail-Adresse
- Nahtlose Integration in das bestehende Design

### 4. Geschützte Routen
- Weiterleitung zur Login-Seite für nicht angemeldete Benutzer
- Automatische Weiterleitung nach erfolgreichem Login

## Benutzerfluss

```text
+------------------+     +------------------+     +------------------+
|   Nicht          |     |   Auth-Seite     |     |   Angemeldet     |
|   angemeldet     | --> |   Login/Register | --> |   SAP Analyzer   |
+------------------+     +------------------+     +------------------+
                                                         |
                                                         v
                                                  +------------------+
                                                  |   Logout-Button  |
                                                  |   im Header      |
                                                  +------------------+
```

## Technische Details

### Neue Dateien
| Datei | Beschreibung |
|-------|--------------|
| `src/pages/Auth.tsx` | Login/Registrierungs-Seite mit Formular |
| `src/hooks/useAuth.ts` | Authentifizierungs-Hook mit Session-Management |
| `src/components/ProtectedRoute.tsx` | Wrapper für geschützte Routen |

### Geänderte Dateien
| Datei | Änderung |
|-------|----------|
| `src/App.tsx` | Neue Route `/auth` und Auth-Provider hinzufügen |
| `src/pages/Index.tsx` | Login-Status im Header anzeigen, Logout-Button |

### Authentifizierungs-Logik
- E-Mail-Verifizierung erforderlich (Standard-Sicherheit)
- Session wird automatisch beim App-Start geprüft
- Auth-State wird über React Context geteilt
- Sichere Passwort-Validierung (min. 6 Zeichen)

### UI-Design
- Passt zum bestehenden Nagarro-Gradient Design
- Dark/Light Mode Unterstützung
- Responsive für Mobile und Desktop
- Konsistente Fehlerbehandlung mit Toast-Benachrichtigungen
