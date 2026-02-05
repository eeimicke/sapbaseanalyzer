
## Entfernung des Stern-Icons aus dem Button

### Problem
Der "Proceed to Basis Analysis" Button in den Service-Cards enthält ein Sparkles-Icon (Sterne), das entfernt werden soll.

### Lösung
Entfernung der `<Sparkles>` Komponente aus dem Button in der `ServiceCard.tsx`.

### Änderung

**Datei:** `src/components/ServiceCard.tsx`

Aktuelle Zeile:
```tsx
<Sparkles className="w-4 h-4" />
{t("serviceCard.proceedToAnalysis")}
<ChevronRight className="w-4 h-4" />
```

Wird geändert zu:
```tsx
{t("serviceCard.proceedToAnalysis")}
<ChevronRight className="w-4 h-4" />
```

Der Pfeil rechts (`ChevronRight`) bleibt erhalten, nur das Stern-Icon wird entfernt.
