import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { type RelevanceLevel, relevanceColors, relevanceLabels } from "@/hooks/use-service-relevance";

interface RelevanceBadgeProps {
  relevance: RelevanceLevel | null | undefined;
  reason?: string;
  isLoading?: boolean;
  compact?: boolean;
}

export function RelevanceBadge({ relevance, reason, isLoading, compact = false }: RelevanceBadgeProps) {
  if (isLoading) {
    return <Skeleton className={compact ? "h-5 w-12" : "h-5 w-16"} />;
  }

  if (!relevance) {
    return null;
  }

  const colors = relevanceColors[relevance];
  const label = relevanceLabels[relevance];

  const badge = (
    <Badge
      variant="outline"
      className={`${colors.bg} ${colors.text} ${colors.border} text-[10px] px-1.5 py-0.5 gap-1 font-medium`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {!compact && <span>{label}</span>}
    </Badge>
  );

  if (reason) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>{badge}</TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p className="text-xs">
              <span className="font-medium">Basis-Relevanz: {label}</span>
              <br />
              {reason}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
}
