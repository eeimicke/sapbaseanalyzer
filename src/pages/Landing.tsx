import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useServiceInventory, useServiceDetails } from "@/hooks/use-sap-services";
import { useBatchRelevance, type RelevanceLevel, relevanceColors } from "@/hooks/use-service-relevance";
import { ServiceCard } from "@/components/ServiceCard";
import { GuestLimitDialog } from "@/components/GuestLimitDialog";
import { GuestUsageBanner } from "@/components/GuestUsageBanner";
import { useGuestUsage } from "@/hooks/use-guest-usage";
import { useToast } from "@/hooks/use-toast";
import { perplexityApi, type AnalysisResponse } from "@/lib/api/perplexity";
import { exportToMarkdown, copyToClipboard } from "@/lib/confluence-export";
import { 
  filterServices, 
  extractCategories,
  type ServiceInventoryItem,
  type ServiceDetails
} from "@/lib/sap-services";
import {
  Sparkles,
  Database,
  Bot,
  FileText,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Github,
  Linkedin,
  Zap,
  Shield,
  Globe,
  Moon,
  Sun,
  CircleCheck,
  Search,
  ChevronRight,
  ChevronDown,
  Check,
  Loader2,
  AlertCircle,
  RefreshCw,
  Link2,
} from "lucide-react";

// Default prompt for guests (no DB access due to RLS)
const DEFAULT_GUEST_PROMPT = `Du bist ein erfahrener SAP Basis-Administrator und Cloud-Architekt mit tiefgreifender Expertise in SAP BTP (Business Technology Platform). Deine Aufgabe ist es, SAP BTP Services aus der Perspektive eines Basis-Administrators zu analysieren und strukturierte Dokumentation zu erstellen.

Analysiere den bereitgestellten Service und erstelle eine umfassende Basis-Dokumentation mit folgender Struktur:

## 1. Service-Überblick
- Kurze Beschreibung des Services und seiner Hauptfunktion
- Einordnung in das SAP BTP Ökosystem

## 2. Basis-Verantwortlichkeiten
- Welche Aufgaben fallen in den Verantwortungsbereich des Basis-Teams?
- Abgrenzung zu Entwickler- und Fachbereichsaufgaben

## 3. Security-Aspekte
- Authentifizierung und Autorisierung
- Datenschutz und Compliance-Anforderungen
- Netzwerk- und Firewall-Konfiguration

## 4. Integration & Konnektivität
- Verbindung zu On-Premise-Systemen
- Cloud Connector-Anforderungen
- API-Management

## 5. Monitoring & Operations
- Verfügbare Monitoring-Tools
- Wichtige KPIs und Metriken
- Alerting-Empfehlungen

## 6. Lifecycle Management
- Deployment-Strategien
- Update- und Patch-Management
- Backup und Recovery

## 7. Nicht-Basis-relevant
- Aspekte, die nicht in den Basis-Bereich fallen

## 8. Referenzen
- Links zur offiziellen Dokumentation`;

const Landing = () => {
  const { isDark, toggleTheme } = useTheme();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Guest usage tracking
  const { 
    getGuestAnalysisCount, 
    incrementGuestAnalysisCount, 
    hasReachedGuestLimit,
    getRemainingAnalyses,
    GUEST_LIMIT 
  } = useGuestUsage();
  
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<ServiceInventoryItem | null>(null);
  const [selectedServiceDetails, setSelectedServiceDetails] = useState<ServiceDetails | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRelevance, setSelectedRelevance] = useState<RelevanceLevel | "all">("all");

  // Analysis States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [fullBasisResult, setFullBasisResult] = useState<AnalysisResponse | null>(null);

  // SEO Meta Tags
  useSEO({
    title: "SAP BTP Basis Analyzer - AI Documentation Tool",
    description: "Analyze 589+ SAP BTP services with AI support. Generate structured base documentation in minutes. Free registration, GDPR compliant.",
    ogTitle: "SAP BTP Basis Analyzer",
    ogDescription: "Analyze 589+ SAP BTP services with AI. Create structured documentation instantly.",
    canonical: "https://sapbaseanalyzer.lovable.app/",
  });

  // Features with translations
  const features = [
    { icon: Database, titleKey: "features.services.title", descriptionKey: "features.services.description" },
    { icon: Bot, titleKey: "features.ai.title", descriptionKey: "features.ai.description" },
    { icon: FileText, titleKey: "features.export.title", descriptionKey: "features.export.description" },
  ];

  const workflowSteps = [
    { step: "01", titleKey: "workflow.step1.title", descriptionKey: "workflow.step1.description" },
    { step: "02", titleKey: "workflow.step2.title", descriptionKey: "workflow.step2.description" },
    { step: "03", titleKey: "workflow.step3.title", descriptionKey: "workflow.step3.description" },
  ];

  const steps = [
    { id: 1, titleKey: "app.step1.title", icon: Database, descriptionKey: "app.step1.description" },
    { id: 2, titleKey: "app.step2.title", icon: Bot, descriptionKey: "app.step2.description" },
    { id: 3, titleKey: "app.step3.title", icon: FileText, descriptionKey: "app.step3.description" },
  ];

  // Load services from GitHub
  const { 
    data: services, 
    isLoading: isLoadingServices, 
    isError: isServicesError,
    error: servicesError,
    refetch: refetchServices 
  } = useServiceInventory();

  // Load service details when selected
  const {
    data: fetchedServiceDetails,
    isLoading: isLoadingDetails,
  } = useServiceDetails(selectedService?.fileName ?? null);

  const activeServiceDetails = useMemo(() => {
    return selectedServiceDetails || fetchedServiceDetails || null;
  }, [selectedServiceDetails, fetchedServiceDetails]);

  // Category filtered services
  const categoryFilteredServices = useMemo(() => {
    if (!services) return [];
    return filterServices(services, searchQuery, selectedCategory);
  }, [services, searchQuery, selectedCategory]);

  // Batch relevance
  const { data: relevanceMap, isLoading: isLoadingRelevance, reloadAll: reloadRelevance, isFetching: isRefetchingRelevance } = useBatchRelevance(
    categoryFilteredServices,
    categoryFilteredServices.length > 0
  );

  // Filter by relevance
  const filteredServices = useMemo(() => {
    if (selectedRelevance === "all" || !relevanceMap) {
      return categoryFilteredServices;
    }
    return categoryFilteredServices.filter((service) => {
      const rel = relevanceMap.get(service.technicalId);
      return rel?.relevance === selectedRelevance;
    });
  }, [categoryFilteredServices, selectedRelevance, relevanceMap]);

  // Relevance counts
  const relevanceCounts = useMemo(() => {
    if (!relevanceMap) return { all: categoryFilteredServices.length, hoch: 0, mittel: 0, niedrig: 0 };
    const counts = { all: categoryFilteredServices.length, hoch: 0, mittel: 0, niedrig: 0 };
    categoryFilteredServices.forEach((service) => {
      const rel = relevanceMap.get(service.technicalId);
      if (rel?.relevance) {
        counts[rel.relevance]++;
      }
    });
    return counts;
  }, [categoryFilteredServices, relevanceMap]);

  // Available categories
  const availableCategories = useMemo(() => {
    if (!services) return [];
    return extractCategories(services);
  }, [services]);

  // Category counts
  const categoryCounts = useMemo(() => {
    if (!services) return {};
    const counts: Record<string, number> = { all: services.length };
    for (const service of services) {
      if (service.category) {
        counts[service.category] = (counts[service.category] || 0) + 1;
      }
    }
    return counts;
  }, [services]);

  // Handle service selection and proceed to analysis
  const handleProceedToAnalysis = (service: ServiceInventoryItem, details: ServiceDetails) => {
    // Check guest limit
    if (hasReachedGuestLimit()) {
      setShowLimitDialog(true);
      return;
    }

    setSelectedService(service);
    setSelectedServiceDetails(details);
    setCurrentStep(2);
  };

  // Start analysis for guests
  const startGuestAnalysis = async () => {
    if (!selectedService || !activeServiceDetails) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setFullBasisResult(null);
    setAnalysisComplete(false);

    try {
      setAnalysisProgress(25);
      
      const result = await perplexityApi.analyzeWithFullContext(
        selectedService.displayName,
        selectedService.description || '',
        activeServiceDetails,
        DEFAULT_GUEST_PROMPT,
        selectedService.fileName,
        language
      );

      setAnalysisProgress(100);
      setFullBasisResult(result);
      setAnalysisComplete(true);
      
      // Increment guest counter on successful analysis
      if (result.success) {
        incrementGuestAnalysisCount();
        toast({
          title: t("app.analysisComplete"),
          description: t("app.analysisCompleteDesc"),
        });
      } else {
        toast({
          title: t("app.analysisError"),
          description: result.error || t("app.unknownError"),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: t("app.analysisError"),
        description: error instanceof Error ? error.message : t("app.unknownError"),
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-start analysis when entering Step 2
  useEffect(() => {
    if (currentStep === 2 && !isAnalyzing && !analysisComplete && activeServiceDetails && !isLoadingDetails) {
      startGuestAnalysis();
    }
  }, [currentStep, activeServiceDetails, isLoadingDetails]);

  // Loading skeleton
  const ServiceCardSkeleton = () => (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-9 w-full" />
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Guest Limit Dialog */}
      <GuestLimitDialog open={showLimitDialog} onOpenChange={setShowLimitDialog} />

      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            {/* Left: Logo & Title */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl nagarro-gradient flex items-center justify-center nagarro-glow flex-shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-background" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-semibold tracking-tight truncate">{t("header.title")}</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">{t("header.subtitle")}</p>
              </div>
            </div>
            
            {/* Center: Guest Usage Banner */}
            <div className="hidden md:flex flex-1 justify-center">
              <GuestUsageBanner />
            </div>
            
            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0 flex-1 justify-end">
              <LanguageToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-lg h-8 w-8 sm:h-9 sm:w-9"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Badge variant="outline" className="text-xs px-2 sm:px-3 py-1 border-primary/30 text-primary hidden lg:flex">
                <Github className="w-3 h-3 mr-1" />
                {t("header.openSource")}
              </Badge>
              <Button 
                size="sm" 
                className="bg-[#0A66C2] hover:bg-[#004182] text-white h-8 text-xs sm:text-sm px-2 sm:px-4"
                onClick={() => setShowLimitDialog(true)}
              >
                <Linkedin className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">{language === "de" ? "Kontakt" : "Contact"}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Conditional based on currentStep */}
      {currentStep === 1 && (
        <>
          {/* Hero Section */}
          <section className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
            <div className="container mx-auto px-6 py-16 md:py-24 relative">
              <div className="max-w-4xl mx-auto text-center space-y-6">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                  {t("hero.title1")}
                  <span className="block text-primary">{t("hero.title2")}</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                  {t("hero.description")}
                </p>
                
                {/* Guest Usage Info */}
                <div className="flex items-center justify-center gap-3">
                  <Badge variant="outline" className="text-sm px-4 py-2 border-primary/30 bg-primary/5">
                    <Sparkles className="w-4 h-4 mr-2 text-primary" />
                    {t("guest.tryFree")}
                  </Badge>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap items-center justify-center gap-8 pt-6 border-t border-border/50 mt-8">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">589+</p>
                    <p className="text-sm text-muted-foreground">{t("hero.stat1")}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">AI</p>
                    <p className="text-sm text-muted-foreground">{t("hero.stat2")}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">100%</p>
                    <p className="text-sm text-muted-foreground">{t("hero.stat3")}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Service Selection Section */}
          <section className="py-12 border-t border-border/30">
            <div className="container mx-auto px-6">
              <div className="text-center mb-8">
                <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                  <Database className="w-3 h-3 mr-1.5" />
                  {t("app.step1.title")}
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold mb-3">
                  {t("app.selectServiceTitle")}
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto text-sm mb-4">
                  {t("app.selectServiceDescription")}
                </p>
                <div className="flex flex-col items-center gap-2">
                  <a
                    href="https://github.com/SAP-samples/btp-service-metadata/tree/main/v1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors cursor-pointer"
                  >
                    <Database className="w-4 h-4" />
                    <span>
                      {isLoadingServices 
                        ? t("app.loadingServices")
                        : isServicesError 
                        ? t("app.loadError")
                        : `${services?.length || 0} ${t("app.servicesFromGithub")}`
                      }
                    </span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <code className="text-[10px] text-muted-foreground/60 bg-muted/30 px-2 py-1 rounded font-mono select-all">
                    https://raw.githubusercontent.com/SAP-samples/btp-service-metadata/main/v1/inventory.json
                  </code>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="max-w-3xl mx-auto space-y-4 mb-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t("app.searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 h-12 bg-muted/50 border-border/50"
                  />
                </div>

                {/* Category Tabs */}
                {!isLoadingServices && !isServicesError && (
                  <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                    <TabsList className="w-full h-auto flex-wrap gap-1.5 bg-muted/30 p-1.5 rounded-xl">
                      <TabsTrigger 
                        value="all" 
                        className="text-xs px-4 py-2 rounded-lg transition-all data-[state=active]:nagarro-gradient data-[state=active]:text-white data-[state=active]:font-semibold data-[state=active]:shadow-lg data-[state=active]:nagarro-glow data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/50"
                      >
                        {t("app.all")} ({categoryCounts.all || 0})
                      </TabsTrigger>
                      {availableCategories.slice(0, 6).map((cat) => (
                        <TabsTrigger 
                          key={cat} 
                          value={cat}
                          className="text-xs px-4 py-2 rounded-lg transition-all data-[state=active]:nagarro-gradient data-[state=active]:text-white data-[state=active]:font-semibold data-[state=active]:shadow-lg data-[state=active]:nagarro-glow data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/50"
                        >
                          {cat} ({categoryCounts[cat] || 0})
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                )}

                {/* Relevance Filter */}
                {!isLoadingServices && !isServicesError && (
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs text-muted-foreground font-medium">{t("app.basisRelevance")}</span>
                    <div className="flex gap-1.5 flex-wrap">
                      <button
                        onClick={() => setSelectedRelevance("all")}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                          selectedRelevance === "all"
                            ? "bg-primary text-primary-foreground font-medium"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {t("app.all")} ({relevanceCounts.all})
                      </button>
                      <button
                        onClick={() => setSelectedRelevance("hoch")}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                          selectedRelevance === "hoch"
                            ? `${relevanceColors.hoch.bg} ${relevanceColors.hoch.text} font-medium`
                            : "bg-muted/50 text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${relevanceColors.hoch.dot}`} />
                        {t("app.high")} ({relevanceCounts.hoch})
                      </button>
                      <button
                        onClick={() => setSelectedRelevance("mittel")}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                          selectedRelevance === "mittel"
                            ? `${relevanceColors.mittel.bg} ${relevanceColors.mittel.text} font-medium`
                            : "bg-muted/50 text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${relevanceColors.mittel.dot}`} />
                        {t("app.medium")} ({relevanceCounts.mittel})
                      </button>
                      <button
                        onClick={() => setSelectedRelevance("niedrig")}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                          selectedRelevance === "niedrig"
                            ? `${relevanceColors.niedrig.bg} ${relevanceColors.niedrig.text} font-medium`
                            : "bg-muted/50 text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${relevanceColors.niedrig.dot}`} />
                        {t("app.low")} ({relevanceCounts.niedrig})
                      </button>
                    </div>
                    {(isLoadingRelevance || isRefetchingRelevance) && (
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => reloadRelevance()}
                      disabled={isLoadingRelevance || isRefetchingRelevance}
                      className="h-8 px-2 text-xs text-muted-foreground hover:text-primary"
                      title={language === "de" ? "Relevanz neu laden" : "Reload relevance"}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefetchingRelevance ? "animate-spin" : ""}`} />
                    </Button>
                  </div>
                )}
              </div>

              {/* Error State */}
              {isServicesError && (
                <div className="max-w-2xl mx-auto mb-8">
                  <Card className="border-destructive/50 bg-destructive/5">
                    <CardContent className="flex items-center gap-4 p-6">
                      <AlertCircle className="w-10 h-10 text-destructive flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-medium text-destructive mb-1">{t("app.errorLoadingServices")}</h3>
                        <p className="text-sm text-muted-foreground">{servicesError?.message || t("app.unknownError")}</p>
                      </div>
                      <Button onClick={() => refetchServices()} variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {t("app.retry")}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Services Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
                {isLoadingServices && (
                  <>
                    {[...Array(6)].map((_, i) => (
                      <ServiceCardSkeleton key={i} />
                    ))}
                  </>
                )}

                {!isLoadingServices && !isServicesError && filteredServices.map((service) => (
                  <ServiceCard
                    key={service.technicalId}
                    service={service}
                    isSelected={selectedService?.technicalId === service.technicalId}
                    onSelect={setSelectedService}
                    onProceedToAnalysis={handleProceedToAnalysis}
                  />
                ))}

                {!isLoadingServices && filteredServices.length === 0 && !isServicesError && (
                  <div className="col-span-full text-center py-12">
                    <Search className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium mb-2">{t("app.noServicesFound")}</h3>
                    <p className="text-muted-foreground text-sm">
                      {t("app.tryDifferentSearch")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                <Badge variant="outline" className="mb-4">{t("features.badge")}</Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("features.title")}</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">{t("features.description")}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <Card key={index} className="border-border/50 card-hover bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{t(feature.titleKey)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm leading-relaxed">
                        {t(feature.descriptionKey)}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-border/50 py-8">
            <div className="container mx-auto px-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">{t("footer.poweredBy")}</p>
                <p className="text-sm text-muted-foreground">{t("footer.createdBy")}</p>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* Step 2: AI Analysis */}
      {currentStep === 2 && (
        <main className="container mx-auto px-6 py-10">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 md:gap-4 mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => {
                    if (step.id === 1) {
                      setFullBasisResult(null);
                      setAnalysisProgress(0);
                      setAnalysisComplete(false);
                      setCurrentStep(1);
                    }
                  }}
                  className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 rounded-xl transition-all ${
                    currentStep === step.id
                      ? "nagarro-gradient text-background nagarro-glow"
                      : currentStep > step.id
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  } ${step.id === 1 ? 'cursor-pointer hover:opacity-90' : 'cursor-default'}`}
                >
                  <step.icon className="w-4 h-4" />
                  <span className="hidden md:inline text-sm font-medium">{t(step.titleKey)}</span>
                  <span className="md:hidden text-xs">{step.id}</span>
                </button>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 mx-1 md:mx-2 text-muted-foreground/50" />
                )}
              </div>
            ))}
          </div>

          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="text-center mb-4">
              <h2 className="text-3xl font-semibold mb-2">{t("app.basisAnalysis")}</h2>
              <p className="text-muted-foreground">
                {t("app.perplexityResearching")} {selectedService?.displayName || "the service"}
              </p>
            </div>

            {/* Progress indicator */}
            {isAnalyzing && (
              <div className="max-w-md mx-auto text-center">
                <Progress value={analysisProgress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {t("app.fullBasisAnalysisRunning")}
                </p>
              </div>
            )}
            
            {/* Service links info */}
            {activeServiceDetails?.links && (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 text-sm">
                  <Link2 className="w-4 h-4 text-primary" />
                  <span>
                    {activeServiceDetails.links.filter(l => l.value?.startsWith('http')).length} {t("app.documentationLinks")}
                  </span>
                </div>
              </div>
            )}

            {/* Full-Basis Analysis Result */}
            <Card className={`border-border/50 transition-all ${fullBasisResult?.success ? 'border-primary/30' : ''}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="w-10 h-10 rounded-lg nagarro-gradient flex items-center justify-center nagarro-glow">
                    <Bot className="w-5 h-5 text-background" />
                  </div>
                  <span className="flex-1">{t("app.fullBasisAnalysis")}</span>
                  {fullBasisResult?.success && <Check className="w-5 h-5 text-primary" />}
                  {fullBasisResult && !fullBasisResult.success && <AlertCircle className="w-5 h-5 text-destructive" />}
                </CardTitle>
                <CardDescription>
                  {t("app.aiAnalysisDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Loading State */}
                {isAnalyzing && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-muted-foreground">{t("app.perplexitySearching")}</span>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full animate-pulse" />
                      <Skeleton className="h-4 w-5/6 animate-pulse" />
                      <Skeleton className="h-4 w-4/6 animate-pulse" />
                      <Skeleton className="h-4 w-full animate-pulse" />
                      <Skeleton className="h-4 w-3/4 animate-pulse" />
                    </div>
                  </div>
                )}

                {/* Error State */}
                {fullBasisResult && !fullBasisResult.success && (
                  <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive">
                      {t("app.error")}: {fullBasisResult.error || t("app.unknownError")}
                    </p>
                  </div>
                )}

                {/* Success State */}
                {fullBasisResult?.success && fullBasisResult.data && (
                  <div className="space-y-4">
                    <ScrollArea className="h-[400px] rounded-md border border-border/30 p-4">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <div className="text-sm whitespace-pre-wrap">
                          {fullBasisResult.data.content}
                        </div>
                      </div>
                    </ScrollArea>
                    
                    {/* Citations */}
                    {fullBasisResult.data.citations && fullBasisResult.data.citations.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground font-medium">
                          {t("app.sources")} ({fullBasisResult.data.citations.length}):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {fullBasisResult.data.citations.slice(0, 5).map((citation, idx) => (
                            <Badge 
                              key={idx} 
                              variant="outline" 
                              className="text-xs cursor-pointer hover:bg-muted"
                              onClick={() => window.open(citation, '_blank')}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              {(() => {
                                try {
                                  return new URL(citation).hostname;
                                } catch {
                                  return citation.substring(0, 30);
                                }
                              })()}
                            </Badge>
                          ))}
                          {fullBasisResult.data.citations.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{fullBasisResult.data.citations.length - 5} {t("app.more")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {fullBasisResult.data.model && (
                      <p className="text-xs text-muted-foreground">
                        {t("app.model")}: {fullBasisResult.data.model}
                      </p>
                    )}
                  </div>
                )}

                {/* Initial waiting state */}
                {!fullBasisResult && !isAnalyzing && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    {t("app.analysisStarting")}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-between pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setFullBasisResult(null);
                  setAnalysisProgress(0);
                  setAnalysisComplete(false);
                  setCurrentStep(1);
                }}
                className="gap-2"
                disabled={isAnalyzing}
              >
                {t("app.back")}
              </Button>
              <Button
                onClick={() => setCurrentStep(3)}
                disabled={!analysisComplete}
                className="gap-2 nagarro-gradient text-background nagarro-glow"
              >
                {analysisComplete ? t("app.toSummary") : t("app.analysisRunning")}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </main>
      )}

      {/* Step 3: Summary */}
      {currentStep === 3 && (
        <main className="container mx-auto px-6 py-10">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 md:gap-4 mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => {
                    if (step.id === 1) {
                      setFullBasisResult(null);
                      setAnalysisProgress(0);
                      setAnalysisComplete(false);
                      setCurrentStep(1);
                    } else if (step.id === 2) {
                      setCurrentStep(2);
                    }
                  }}
                  className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 rounded-xl transition-all ${
                    currentStep === step.id
                      ? "nagarro-gradient text-background nagarro-glow"
                      : currentStep > step.id
                      ? "bg-primary/20 text-primary cursor-pointer hover:opacity-90"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <step.icon className="w-4 h-4" />
                  <span className="hidden md:inline text-sm font-medium">{t(step.titleKey)}</span>
                  <span className="md:hidden text-xs">{step.id}</span>
                </button>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 mx-1 md:mx-2 text-muted-foreground/50" />
                )}
              </div>
            ))}
          </div>

          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-semibold mb-2">{t("app.summary")}</h2>
              <p className="text-muted-foreground">
                {t("app.summaryForExport")}
              </p>
            </div>

            {/* Service Overview Card */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Database className="w-5 h-5 text-primary" />
                  </div>
                  {t("app.serviceOverview")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t("app.serviceName")}</p>
                    <p className="font-medium">{selectedService?.displayName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t("app.technicalId")}</p>
                    <code className="text-sm bg-muted px-2 py-1 rounded">{selectedService?.technicalId || "—"}</code>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">{t("app.description")}</p>
                    <p className="text-sm text-muted-foreground">{selectedService?.description || t("app.noDescription")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t("app.category")}</p>
                    <Badge variant="outline">{selectedService?.category || "Service"}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t("app.servicePlans")}</p>
                    <p className="text-sm">{activeServiceDetails?.servicePlans?.length || 0} {t("app.available")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Findings Card */}
            {analysisComplete && fullBasisResult?.success && fullBasisResult.data && (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg nagarro-gradient flex items-center justify-center nagarro-glow">
                      <Bot className="w-5 h-5 text-background" />
                    </div>
                    {t("app.basisAnalysisFindings")}
                  </CardTitle>
                  <CardDescription>
                    {t("app.aiAnalysisFrom")} {new Date().toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ScrollArea className="h-[350px] rounded-md border border-border/30 p-4">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <div className="text-sm whitespace-pre-wrap">
                        {fullBasisResult.data.content}
                      </div>
                    </div>
                  </ScrollArea>
                  
                  {fullBasisResult.data.citations && fullBasisResult.data.citations.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground font-medium">
                        {t("app.sourcesUsed")} ({fullBasisResult.data.citations.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {fullBasisResult.data.citations.map((citation, idx) => (
                          <Badge 
                            key={idx} 
                            variant="outline" 
                            className="text-xs cursor-pointer hover:bg-muted"
                            onClick={() => window.open(citation, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            {(() => {
                              try {
                                return new URL(citation).hostname;
                              } catch {
                                return citation.substring(0, 30);
                              }
                            })()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {fullBasisResult.data.model && (
                    <p className="text-xs text-muted-foreground">
                      {t("app.analyzedWith")}: {fullBasisResult.data.model}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Export Actions */}
            <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  {t("app.wikiExport")}
                </CardTitle>
                <CardDescription>
                  {language === "de" 
                    ? "Exportiere die Analyse als Markdown-Datei oder kopiere sie in die Zwischenablage."
                    : "Export the analysis as a Markdown file or copy it to the clipboard."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={() => {
                      if (fullBasisResult?.data?.content && selectedService) {
                        exportToMarkdown(
                          fullBasisResult.data.content,
                          selectedService.displayName,
                          selectedService.category,
                          fullBasisResult.data.citations,
                          fullBasisResult.data.model
                        );
                        toast({
                          title: language === "de" ? "Export erfolgreich" : "Export successful",
                          description: language === "de" ? "Die Markdown-Datei wurde heruntergeladen." : "The Markdown file has been downloaded.",
                        });
                      }
                    }}
                    disabled={!fullBasisResult?.data?.content}
                    className="flex-1 nagarro-gradient text-background nagarro-glow gap-2"
                  >
                    {language === "de" ? "Als Markdown exportieren" : "Export as Markdown"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      if (fullBasisResult?.data?.content) {
                        copyToClipboard(fullBasisResult.data.content);
                        toast({
                          title: t("app.copiedToClipboard"),
                          description: t("app.analysisTextCopied"),
                        });
                      }
                    }}
                    disabled={!fullBasisResult?.data?.content}
                    className="gap-2"
                  >
                    {t("app.copy")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between pt-4">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(2)}
                className="gap-2"
              >
                {t("app.back")}
              </Button>
              <Button
                onClick={() => {
                  setFullBasisResult(null);
                  setAnalysisProgress(0);
                  setAnalysisComplete(false);
                  setSelectedService(null);
                  setSelectedServiceDetails(null);
                  setCurrentStep(1);
                }}
                variant="outline"
                className="gap-2"
              >
                {t("app.startNewAnalysis")}
              </Button>
            </div>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="py-6 border-t border-border/30 bg-muted/20">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">
            Built proudly with{" "}
            <a 
              href="https://lovable.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              Lovable
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
