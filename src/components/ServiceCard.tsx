import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Github, ExternalLink, BookOpen, Database, FileCode, Shield, Globe, Link2, Loader2, Sparkles, ChevronRight } from "lucide-react";
import { type ServiceInventoryItem, type ServiceDetails } from "@/lib/sap-services";
import { useServiceDetails } from "@/hooks/use-sap-services";
import { useServiceRelevance } from "@/hooks/use-service-relevance";
import { RelevanceBadge } from "@/components/RelevanceBadge";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";

// Icon-Mapping für Link-Classifications
const classificationIcons: Record<string, typeof FileCode> = {
  "Discovery Center": Database,
  "Documentation": BookOpen,
  "SAP Help Portal": BookOpen,
  "Tutorial": BookOpen,
  "API Hub": FileCode,
  "Support": Shield,
  "Marketing": Globe,
  "Other": Link2,
};

interface ServiceCardProps {
  service: ServiceInventoryItem;
  isSelected: boolean;
  onSelect: (service: ServiceInventoryItem) => void;
  onProceedToAnalysis?: (service: ServiceInventoryItem, details: ServiceDetails) => void;
}

export function ServiceCard({ service, isSelected, onSelect, onProceedToAnalysis }: ServiceCardProps) {
  const { data: serviceDetails, isLoading: isLoadingDetails } = useServiceDetails(service.fileName);
  const { data: relevance, isLoading: isLoadingRelevance, reclassify } = useServiceRelevance(service);
  const { t, language } = useLanguage();
  const [quickSummary, setQuickSummary] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  
  // GitHub Repository URL für diesen Service (nutzt fileName statt technicalId)
  const githubUrl = `https://github.com/SAP-samples/btp-service-metadata/blob/main/v1/developer/${service.fileName}`;

  // Gruppiere Links nach Classification
  const groupedLinks = serviceDetails?.links?.reduce((acc, link) => {
    if (!link.value?.startsWith('http')) return acc;
    const classification = link.classification || 'Other';
    if (!acc[classification]) acc[classification] = [];
    acc[classification].push(link);
    return acc;
  }, {} as Record<string, typeof serviceDetails.links>) || {};

  const classifications = Object.keys(groupedLinks);

  // Perplexity Quick Summary wenn ausgewählt und Details geladen
  useEffect(() => {
    if (isSelected && serviceDetails && !quickSummary && !isLoadingSummary && !summaryError) {
      const fetchQuickSummary = async () => {
        setIsLoadingSummary(true);
        setSummaryError(null);

        // Prepare service links for Perplexity
        const serviceLinks = (serviceDetails.links || [])
          .filter(l => l.value?.startsWith('http'))
          .map(l => ({
            classification: l.classification || 'Other',
            text: l.text || l.classification || 'Link',
            value: l.value,
          }));

        try {
          const { data, error } = await supabase.functions.invoke('perplexity-analyze', {
            body: {
              serviceName: service.displayName,
              serviceDescription: service.description || '',
              serviceLinks,
              category: 'quick-summary',
              language,
            },
          });

          if (error) {
            setSummaryError(error.message);
          } else if (data?.success && data?.data?.content) {
            setQuickSummary(data.data.content);
          } else if (data?.error) {
            setSummaryError(data.error);
          }
        } catch (err) {
          setSummaryError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
          setIsLoadingSummary(false);
        }
      };

      fetchQuickSummary();
    }
  }, [isSelected, serviceDetails, service.displayName, service.description, quickSummary, isLoadingSummary, summaryError]);

  // Reset summary when deselected
  useEffect(() => {
    if (!isSelected) {
      setQuickSummary(null);
      setSummaryError(null);
    }
  }, [isSelected]);

  const noDescriptionText = language === 'de' ? 'Keine Beschreibung verfügbar' : 'No description available';
  const aiSummaryLabel = language === 'de' ? 'Perplexity KI-Zusammenfassung' : 'Perplexity AI Summary';
  const researchingText = language === 'de' ? 'Recherchiere mit' : 'Researching with';
  const urlsText = 'URLs...';
  const loadingLinksText = language === 'de' ? 'Lade Links...' : 'Loading links...';
  const noLinksText = language === 'de' ? 'Keine Links verfügbar' : 'No links available';

  return (
    <Card
      className={`cursor-pointer transition-all hover:border-primary/50 ${
        isSelected
          ? "border-primary ring-2 ring-primary/20"
          : "border-border/50"
      }`}
      onClick={() => onSelect(service)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-xs">
              {service.category || "Service"}
            </Badge>
                <RelevanceBadge 
                  relevance={relevance?.relevance} 
                  reason={relevance?.reason}
                  isLoading={isLoadingRelevance}
                  onReclassify={reclassify}
                />
          </div>
          <div className="flex items-center gap-2">
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-muted-foreground hover:text-primary transition-colors"
              title={t("serviceCard.viewOnGithub")}
            >
              <Github className="w-4 h-4" />
            </a>
            {isSelected && (
              <div className="w-5 h-5 rounded-full nagarro-gradient flex items-center justify-center">
                <Check className="w-3 h-3 text-background" />
              </div>
            )}
          </div>
        </div>
        <CardTitle className="text-base leading-tight">{service.displayName}</CardTitle>
        <CardDescription className="text-xs line-clamp-2">
          {service.description || noDescriptionText}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <code className="bg-muted px-2 py-1 rounded text-[10px]">{service.technicalId}</code>
        </div>

        {/* Links Preview (nicht ausgewählt) */}
        {!isSelected && (
          isLoadingDetails ? (
            <div className="flex gap-1 flex-wrap">
              <div className="h-5 w-20 bg-muted animate-pulse rounded" />
              <div className="h-5 w-16 bg-muted animate-pulse rounded" />
            </div>
          ) : classifications.length > 0 ? (
          <div className="flex gap-1 flex-wrap">
              {classifications.map((classification) => {
                const Icon = classificationIcons[classification] || Link2;
                const count = groupedLinks[classification]?.length || 0;
                return (
                  <Badge
                    key={classification}
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 gap-1"
                  >
                    <Icon className="w-3 h-3" />
                    {classification} ({count})
                  </Badge>
                );
              })}
            </div>
          ) : null
        )}

        {/* Vollständige Link-Liste + Perplexity Summary (ausgewählt) */}
        {isSelected && (
          <div className="space-y-3 pt-2 border-t border-border/50">
            {/* Quick AI Summary */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                <Sparkles className="w-3.5 h-3.5" />
                {aiSummaryLabel}
              </div>
              <div className="pl-5">
                {isLoadingSummary ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {researchingText} {classifications.length > 0 ? Object.values(groupedLinks).flat().length : 0} {urlsText}
                  </div>
                ) : summaryError ? (
                  <p className="text-xs text-destructive">{summaryError}</p>
                ) : quickSummary ? (
                  <p className="text-xs text-muted-foreground leading-relaxed">{quickSummary}</p>
                ) : null}
              </div>
            </div>

            {/* Links */}
            {isLoadingDetails ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                {loadingLinksText}
              </div>
            ) : classifications.length > 0 ? (
              classifications.map((classification) => {
                const Icon = classificationIcons[classification] || Link2;
                const links = groupedLinks[classification] || [];
                return (
                  <div key={classification} className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Icon className="w-3.5 h-3.5" />
                      {classification}
                    </div>
                    <div className="space-y-1 pl-5">
                      {links.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.value}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 text-xs text-primary hover:underline truncate"
                          title={link.value}
                        >
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{link.text || link.value}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground">{noLinksText}</p>
            )}

            {/* Proceed Button */}
            {serviceDetails && onProceedToAnalysis && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onProceedToAnalysis(service, serviceDetails);
                }}
                className="mt-3 gap-2 nagarro-gradient text-background nagarro-glow"
                size="sm"
              >
                <Sparkles className="w-4 h-4" />
                {t("serviceCard.proceedToAnalysis")}
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}