import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";

export const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === "en" ? "de" : "en")}
      className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 rounded-lg font-medium text-xs"
    >
      <span className="hidden sm:inline">{language === "en" ? "DE" : "EN"}</span>
      <span className="sm:hidden">{language === "en" ? "DE" : "EN"}</span>
    </Button>
  );
};
