

## Login-System hinzufügen

### Übersicht
E-Mail/Passwort-Authentifizierung hinzufügen. Eingeloggte Benutzer haben unbegrenzte Analysen, Gäste behalten das 5-Analyse-Limit.

### Änderungen

**1. Neue Auth-Seite: `src/pages/Auth.tsx`**
- Login- und Registrierungsformular (Toggle zwischen beiden)
- E-Mail + Passwort Felder
- Passwort-Reset-Link
- Redirect zurück zur Landing Page nach Login

**2. Neue Passwort-Reset-Seite: `src/pages/ResetPassword.tsx`**
- Formular zum Setzen eines neuen Passworts
- Prüft `type=recovery` im URL-Hash

**3. Neuer Auth-Hook: `src/hooks/useAuth.tsx`**
- Context Provider mit `onAuthStateChange` Listener
- Stellt `user`, `session`, `signOut`, `isAuthenticated` bereit
- Wraps um den Supabase Auth Client

**4. Route-Erweiterung: `src/App.tsx`**
- `AuthProvider` als Wrapper hinzufügen
- Route `/auth` für Login/Register
- Route `/reset-password` für Passwort-Reset

**5. Landing Page anpassen: `src/pages/Landing.tsx`**
- Header: Login/Logout Button basierend auf Auth-Status
- Analyse-Limit nur für Gäste prüfen (`!isAuthenticated`)
- GuestUsageBanner nur für nicht-eingeloggte User anzeigen
- GuestLimitDialog nur für nicht-eingeloggte User

**6. Übersetzungen: `src/hooks/useLanguage.tsx`**
- Keys für Auth-Formulare (Login, Register, E-Mail, Passwort, etc.)

### Keine DB-Änderungen nötig
- `auth.users` wird von der Authentifizierung automatisch verwaltet
- Keine Profiltabelle nötig (nur Login ohne Profildaten)
- Bestehende RLS-Policies und Tabellen bleiben unverändert

### Logik-Flow

```text
Besucher (nicht eingeloggt)
├─ Sieht GuestUsageBanner (X/5)
├─ Kann 5 Analysen durchführen
├─ Nach Limit: GuestLimitDialog + Login-Button
└─ Header zeigt "Sign In" Button

Eingeloggt
├─ Kein GuestUsageBanner
├─ Unbegrenzte Analysen
├─ Header zeigt "Logout" Button
└─ Kein Limit-Check
```

### Dateien

| Aktion | Datei |
|--------|-------|
| NEU | `src/pages/Auth.tsx` |
| NEU | `src/pages/ResetPassword.tsx` |
| NEU | `src/hooks/useAuth.tsx` |
| ÄNDERN | `src/App.tsx` |
| ÄNDERN | `src/pages/Landing.tsx` |
| ÄNDERN | `src/hooks/useLanguage.tsx` |
| ÄNDERN | `src/components/GuestLimitDialog.tsx` |

