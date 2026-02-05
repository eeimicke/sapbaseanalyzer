import { useLanguage } from "@/hooks/useLanguage";
import { useGuestUsage } from "@/hooks/use-guest-usage";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export function GuestUsageBanner() {
  const { t } = useLanguage();
  const { getGuestAnalysisCount, GUEST_LIMIT } = useGuestUsage();
  
  const count = getGuestAnalysisCount();

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
      <Sparkles className="w-4 h-4 text-primary" />
      <span className="text-sm text-muted-foreground">
        {t("guest.usageCounter").replace("{{count}}", String(count)).replace("{{limit}}", String(GUEST_LIMIT))}
      </span>
      <Badge variant="outline" className="text-xs border-primary/30 text-primary">
        {count}/{GUEST_LIMIT}
      </Badge>
    </div>
  );
}
