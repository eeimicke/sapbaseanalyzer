
# LinkedIn-Link im Footer hinzufügen

## Änderung

Der Footer in `src/pages/Index.tsx` (Zeilen 982-988) wird erweitert, um einen LinkedIn-Link für Ernst Eimicke hinzuzufügen.

## Aktueller Footer
```text
Created by Ernst Eimicke
```

## Neuer Footer
```text
Created by Ernst Eimicke • [LinkedIn-Icon mit Link]
```

## Technische Details

| Datei | Änderung |
|-------|----------|
| `src/pages/Index.tsx` | LinkedIn-Icon importieren, Footer mit klickbarem Link erweitern |

### Änderungen im Detail

1. **Import hinzufügen**: Das `Linkedin`-Icon aus `lucide-react` importieren
2. **Footer anpassen**: Link zu `https://www.linkedin.com/in/eeimicke` mit LinkedIn-Icon hinzufügen
3. **Styling**: Konsistent mit dem bestehenden Design, Hover-Effekt für den Link
