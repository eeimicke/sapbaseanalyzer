import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Github, ExternalLink, BookOpen, Database, FileCode, Shield, Globe, Link2, Loader2 } from "lucide-react";
import { type ServiceInventoryItem } from "@/lib/sap-services";
import { useServiceDetails } from "@/hooks/use-sap-services";

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
}

export function ServiceCard({ service, isSelected, onSelect }: ServiceCardProps) {
  const { data: serviceDetails, isLoading: isLoadingDetails } = useServiceDetails(service.technicalId);
  
  // GitHub Repository URL für diesen Service
  const githubUrl = `https://github.com/SAP-samples/btp-service-metadata/blob/main/v1/developer/${service.technicalId}.json`;

  // Gruppiere Links nach Classification
  const groupedLinks = serviceDetails?.links?.reduce((acc, link) => {
    if (!link.value?.startsWith('http')) return acc;
    const classification = link.classification || 'Other';
    if (!acc[classification]) acc[classification] = [];
    acc[classification].push(link);
    return acc;
  }, {} as Record<string, typeof serviceDetails.links>) || {};

  const classifications = Object.keys(groupedLinks);

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
          <Badge variant="outline" className="text-xs">
            {service.category || "Service"}
          </Badge>
          <div className="flex items-center gap-2">
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-muted-foreground hover:text-primary transition-colors"
              title="Service-Metadaten auf GitHub"
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
          {service.description || "Keine Beschreibung verfügbar"}
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
              {classifications.slice(0, 4).map((classification) => {
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
              {classifications.length > 4 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  +{classifications.length - 4}
                </Badge>
              )}
            </div>
          ) : null
        )}

        {/* Vollständige Link-Liste (ausgewählt) */}
        {isSelected && (
          <div className="space-y-3 pt-2 border-t border-border/50">
            {isLoadingDetails ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                Lade Links...
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
              <p className="text-xs text-muted-foreground">Keine Links verfügbar</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}