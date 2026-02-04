import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";
import { type RelevanceLevel, relevanceColors } from "@/hooks/use-service-relevance";
import { useLanguage } from "@/hooks/useLanguage";

interface RelevanceBadgeProps {
  relevance: RelevanceLevel | null | undefined;
  reason?: string;
  isLoading?: boolean;
  compact?: boolean;
  onReclassify?: () => Promise<void>;
}

export function RelevanceBadge({ relevance, reason, isLoading, compact = false, onReclassify }: RelevanceBadgeProps) {
  const [isReclassifying, setIsReclassifying] = useState(false);
  const { t } = useLanguage();

  // Translated labels
  const getLabel = (rel: RelevanceLevel) => {
    switch (rel) {
      case "hoch": return t("relevanceBadge.high");
      case "mittel": return t("relevanceBadge.medium");
      case "niedrig": return t("relevanceBadge.low");
      default: return rel;
    }
  };

  const handleReclassify = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onReclassify) return;
    
    setIsReclassifying(true);
    try {
      await onReclassify();
    } finally {
      setIsReclassifying(false);
    }
  };

  if (isLoading || isReclassifying) {
    return <Skeleton className={compact ? "h-5 w-12" : "h-5 w-16"} />;
  }

  if (!relevance) {
    return null;
  }

  const colors = relevanceColors[relevance];
  const label = getLabel(relevance);

  const badge = (
    <Badge
      variant="outline"
      className={`${colors.bg} ${colors.text} ${colors.border} text-[10px] px-1.5 py-0.5 gap-1 font-medium`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {!compact && <span>{label}</span>}
    </Badge>
  );

  if (reason || onReclassify) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>{badge}</TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-2">
              <p className="text-xs">
                <span className="font-medium">{t("relevanceBadge.basisRelevance")}: {label}</span>
                {reason && (
                  <>
                    <br />
                    {reason}
                  </>
                )}
              </p>
              {onReclassify && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs w-full"
                  onClick={handleReclassify}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  {t("relevanceBadge.reclassify")}
                </Button>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
}
