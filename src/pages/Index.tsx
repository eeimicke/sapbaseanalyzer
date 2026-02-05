import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { useAnalysisPrompt } from "@/hooks/use-analysis-prompt";
import { 
  Search, 
  Database, 
  Bot, 
  FileText,
  ChevronRight,
  ChevronDown,
  Check,
  Loader2,
  Shield,
  Network,
  Activity,
  RefreshCw,
  ExternalLink,
  Moon,
  Sun,
  Sparkles,
  Link2,
  FileCode,
  BookOpen,
  AlertCircle,
  Globe,
  Github,
  Settings,
  Save,
  LogOut,
  User,
  Linkedin
} from "lucide-react";
import { useServiceInventory, useServiceDetails } from "@/hooks/use-sap-services";
import { useBatchRelevance, type RelevanceLevel, relevanceColors } from "@/hooks/use-service-relevance";
import { 
  filterServices, 
  extractCategories, 
  linkClassifications,
  type ServiceInventoryItem,
  type ServiceDetails
} from "@/lib/sap-services";
import { perplexityApi, type AnalysisResponse } from "@/lib/api/perplexity";
import { ServiceCard } from "@/components/ServiceCard";
import { exportToMarkdown, copyToClipboard } from "@/lib/confluence-export";

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

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<ServiceInventoryItem | null>(null);
  const [selectedServiceDetails, setSelectedServiceDetails] = useState<ServiceDetails | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRelevance, setSelectedRelevance] = useState<RelevanceLevel | "all">("all");
  const { isDark, toggleTheme } = useTheme();

  // SEO Meta Tags
  useSEO({
    title: "Dashboard - Analyze SAP BTP Services",
    description: "Analyze SAP BTP services with AI, generate documentation, and export to Confluence. Secure, private, and GDPR compliant.",
    ogTitle: "SAP BTP Basis Analyzer - Dashboard",
    ogDescription: "AI-powered analysis and documentation for SAP BTP services.",
    canonical: "https://sapbaseanalyzer.lovable.app/app",
    noindex: false,
  });

  // Steps with translations
  const steps = [
    { id: 1, titleKey: "app.step1.title", icon: Database, descriptionKey: "app.step1.description" },
    { id: 2, titleKey: "app.step2.title", icon: Bot, descriptionKey: "app.step2.description" },
    { id: 3, titleKey: "app.step3.title", icon: FileText, descriptionKey: "app.step3.description" },
  ];

  // Prompt State
  const { prompt, isLoading: isLoadingPrompt, isSaving: isSavingPrompt, savePrompt } = useAnalysisPrompt();
  const [editedPrompt, setEditedPrompt] = useState<string>("");
  const [isPromptOpen, setIsPromptOpen] = useState(false);

  // Sync prompt when loaded
  useEffect(() => {
    if (prompt?.prompt_text) {
      setEditedPrompt(prompt.prompt_text);
    }
  }, [prompt]);

  // Analysis States (Step 2)
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [currentAnalysisCategory, setCurrentAnalysisCategory] = useState<string | null>(null);

  // Handler für "Basis-Analyse starten" Button in ServiceCard
  const handleProceedToAnalysis = (service: ServiceInventoryItem, details: ServiceDetails) => {
    setSelectedService(service);
    setSelectedServiceDetails(details);
    setCurrentStep(2);
  };

  // Live-Daten vom SAP GitHub Repository laden
  const { 
    data: services, 
    isLoading: isLoadingServices, 
    isError: isServicesError,
    error: servicesError,
    refetch: refetchServices 
  } = useServiceInventory();

  // Service-Details laden sobald ein Service ausgewählt wird (nur als Fallback)
  const {
    data: fetchedServiceDetails,
    isLoading: isLoadingDetails,
    isError: isDetailsError,
    error: detailsError,
  } = useServiceDetails(selectedService?.fileName ?? null);

  // Konsolidierte Service-Details: Bevorzuge die explizit gesetzten, fallback auf gefetched
  const activeServiceDetails = useMemo(() => {
    return selectedServiceDetails || fetchedServiceDetails || null;
  }, [selectedServiceDetails, fetchedServiceDetails]);

  // Discovery Center URL aus den konsolidierten Service-Details extrahieren
  const discoveryUrl = useMemo(() => {
    if (!activeServiceDetails?.links) return null;
    const dcLink = activeServiceDetails.links.find(link => 
      link.classification === "Discovery Center" && 
      !link.value.includes("index.html#")
    );
    return dcLink?.value ?? null;
  }, [activeServiceDetails]);

  // Gefilterte Services basierend auf Suche und Kategorie
  const categoryFilteredServices = useMemo(() => {
    if (!services) return [];
    return filterServices(services, searchQuery, selectedCategory);
  }, [services, searchQuery, selectedCategory]);

  // Batch-Relevanz für alle Services laden (Ergebnisse werden in DB gecacht)
  const { data: relevanceMap, isLoading: isLoadingRelevance } = useBatchRelevance(
    categoryFilteredServices,
    categoryFilteredServices.length > 0
  );

  // Weitere Filterung nach Relevanz
  const filteredServices = useMemo(() => {
    if (selectedRelevance === "all" || !relevanceMap) {
      return categoryFilteredServices;
    }
    return categoryFilteredServices.filter((service) => {
      const rel = relevanceMap.get(service.technicalId);
      return rel?.relevance === selectedRelevance;
    });
  }, [categoryFilteredServices, selectedRelevance, relevanceMap]);

  // Relevanz-Counts berechnen
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

  // Verfügbare Kategorien aus den Daten extrahieren
  const availableCategories = useMemo(() => {
    if (!services) return [];
    return extractCategories(services);
  }, [services]);

  // Anzahl der Services pro Kategorie berechnen
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

  // Full-Basis Analyse State
  const [fullBasisResult, setFullBasisResult] = useState<AnalysisResponse | null>(null);

  // Start Full-Basis Analysis
  const startAnalysis = async () => {
    if (!selectedService || !activeServiceDetails) return;

    if (!prompt?.prompt_text) {
      toast({
        title: t("app.promptMissing"),
        description: t("app.promptMissingDesc"),
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setFullBasisResult(null);
    setAnalysisComplete(false);
    setCurrentAnalysisCategory('full-basis');

    try {
      setAnalysisProgress(25);
      
      const result = await perplexityApi.analyzeWithFullContext(
        selectedService.displayName,
        selectedService.description || '',
        activeServiceDetails,
        prompt.prompt_text,
        selectedService.fileName,
        language
      );

      setAnalysisProgress(100);
      setFullBasisResult(result);
      setAnalysisComplete(true);
      setCurrentAnalysisCategory(null);
      
      if (result.success) {
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

  // Auto-start analysis when entering Step 2 with service details loaded
  useEffect(() => {
    if (currentStep === 2 && !isAnalyzing && !analysisComplete && activeServiceDetails && !isLoadingDetails) {
      startAnalysis();
    }
  }, [currentStep, activeServiceDetails, isLoadingDetails]);

  // Skeleton-Komponente für Ladezustand
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
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl nagarro-gradient flex items-center justify-center nagarro-glow">
                <Sparkles className="w-5 h-5 text-background" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">{t("header.title")}</h1>
                <p className="text-xs text-muted-foreground">{t("header.subtitle")} • Powered by Perplexity AI</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs px-3 py-1 border-primary/30 text-primary">
                <Github className="w-3 h-3 mr-1" />
                {t("header.liveApi")}
              </Badge>
              <LanguageToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-lg"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              {user && (
                <div className="flex items-center gap-2 border-l border-border/50 pl-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline max-w-32 truncate">{user.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      await signOut();
                      navigate('/');
                    }}
                    className="h-8 px-2 text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline ml-1">{t("header.logout")}</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="border-b border-border/30 bg-muted/30">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-center gap-2 md:gap-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => {
                    if (step.id === 1 || (step.id === 2 && selectedService) || (step.id > 2 && analysisComplete)) {
                      setCurrentStep(step.id);
                    }
                  }}
                  className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 rounded-xl transition-all ${
                    currentStep === step.id
                      ? "nagarro-gradient text-background nagarro-glow"
                      : currentStep > step.id
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  } ${(step.id === 1 || (step.id === 2 && selectedService) || (step.id > 2 && analysisComplete)) ? 'cursor-pointer hover:opacity-90' : 'cursor-default'}`}
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
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-10">
        {/* Step 1: Service Selection */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-semibold mb-2">{t("app.selectServiceTitle")}</h2>
              <p className="text-muted-foreground mb-2">{t("app.selectServiceDescription")}</p>
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
            </div>

            {/* Search and Filter */}
            <div className="max-w-3xl mx-auto space-y-4">
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

              {/* Relevanz-Filter */}
              {!isLoadingServices && !isServicesError && (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground font-medium">{t("app.basisRelevance")}</span>
                  <div className="flex gap-1.5">
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
                  {isLoadingRelevance && (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              )}
            </div>

            {/* Error State */}
            {isServicesError && (
              <div className="max-w-2xl mx-auto">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Loading State */}
              {isLoadingServices && (
                <>
                  {[...Array(6)].map((_, i) => (
                    <ServiceCardSkeleton key={i} />
                  ))}
                </>
              )}

              {/* Services */}
              {!isLoadingServices && !isServicesError && filteredServices.map((service) => (
                <ServiceCard
                  key={service.technicalId}
                  service={service}
                  isSelected={selectedService?.technicalId === service.technicalId}
                  onSelect={setSelectedService}
                  onProceedToAnalysis={handleProceedToAnalysis}
                />
              ))}

              {/* Keine Ergebnisse */}
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
        )}

        {/* Step 2: AI Analysis */}
        {currentStep === 2 && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="text-center mb-4">
              <h2 className="text-3xl font-semibold mb-2">{t("app.basisAnalysis")}</h2>
              <p className="text-muted-foreground">
                {t("app.perplexityResearching")} {selectedService?.displayName || "the service"}
              </p>
            </div>

            {/* Editable Prompt Section */}
            <Card className="border-border/50">
              <Collapsible open={isPromptOpen} onOpenChange={setIsPromptOpen}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                    <CardTitle className="flex items-center justify-between text-base">
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-primary" />
                        {t("app.analysisPrompt")}
                      </div>
                      <div className="flex items-center gap-2">
                        {prompt && (
                          <Badge variant="outline" className="text-xs">
                            {t("app.lastUpdated")}: {new Date(prompt.updated_at).toLocaleDateString()}
                          </Badge>
                        )}
                        <ChevronDown className={`w-4 h-4 transition-transform ${isPromptOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </CardTitle>
                    <CardDescription>
                      {t("app.promptDescription")}
                    </CardDescription>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 space-y-4">
                    {isLoadingPrompt ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-4/6" />
                      </div>
                    ) : (
                      <>
                        <Textarea
                          value={editedPrompt}
                          onChange={(e) => setEditedPrompt(e.target.value)}
                          className="min-h-[300px] font-mono text-xs bg-muted/30"
                          placeholder="Enter analysis prompt..."
                        />
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {editedPrompt.length} {t("app.characters")}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditedPrompt(prompt?.prompt_text || "")}
                              disabled={editedPrompt === prompt?.prompt_text}
                            >
                              {t("app.reset")}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => savePrompt(editedPrompt)}
                              disabled={isSavingPrompt || editedPrompt === prompt?.prompt_text}
                              className="gap-2"
                            >
                              {isSavingPrompt ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Save className="w-3 h-3" />
                              )}
                              {t("app.save")}
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Service-Kontext Card */}
            {activeServiceDetails && (
              <Card className="border-border/50">
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                      <CardTitle className="flex items-center justify-between text-base">
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-primary" />
                          {t("app.serviceContext")}
                        </div>
                        <ChevronDown className="w-4 h-4" />
                      </CardTitle>
                      <CardDescription>
                        {t("app.contextDescription")}
                      </CardDescription>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <ScrollArea className="h-[250px]">
                        <pre className="text-xs font-mono bg-muted/30 p-4 rounded whitespace-pre-wrap">
                          {JSON.stringify(
                            {
                              serviceName: selectedService?.displayName,
                              description: selectedService?.description,
                              githubSource: selectedService?.fileName 
                                ? `https://github.com/SAP-samples/btp-service-metadata/blob/main/v1/developer/${selectedService.fileName}.json`
                                : null,
                              links: activeServiceDetails.links?.filter(l => l.value?.startsWith('http')).map(l => ({
                                classification: l.classification,
                                text: l.text || l.classification,
                                url: l.value,
                              })),
                              servicePlans: activeServiceDetails.servicePlans?.map(p => ({
                                name: p.displayName,
                                isFree: p.isFree,
                                regions: p.dataCenters?.map(dc => dc.displayName || dc.region || dc.name).filter(Boolean) || [],
                              })),
                              supportComponents: activeServiceDetails.supportComponents,
                            },
                            null,
                            2
                          )}
                        </pre>
                      </ScrollArea>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )}
              
            {/* Progress indicator */}
            {isAnalyzing && (
              <div className="max-w-md mx-auto text-center">
                <Progress value={analysisProgress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {currentAnalysisCategory === 'full-basis'
                    ? t("app.fullBasisAnalysisRunning")
                    : `${analysisProgress}% ${t("app.completed")}`
                  }
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

                {/* Success State - Show Analysis */}
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
                              {new URL(citation).hostname}
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
                    
                    {/* Model info */}
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
        )}

        {/* Step 3: Summary */}
        {currentStep === 3 && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-semibold mb-2">{t("app.summary")}</h2>
              <p className="text-muted-foreground">
                {t("app.summaryForExport")}
              </p>
            </div>

            {/* Service-Überblick Card */}
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
                
                {/* Links Summary */}
                {activeServiceDetails?.links && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">{t("app.documentationLinksLabel")}</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(
                        (activeServiceDetails.links || [])
                          .filter(l => l.value?.startsWith('http'))
                          .reduce((acc: Record<string, number>, l) => {
                            const c = l.classification || 'Other';
                            acc[c] = (acc[c] || 0) + 1;
                            return acc;
                          }, {})
                      ).map(([classification, count]) => (
                        <Badge key={classification} variant="secondary" className="text-xs">
                          {classification} ({count})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Basis-Analyse Findings Card */}
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
                  
                  {/* Citations */}
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
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  {t("app.wikiExport")}
                </CardTitle>
                <CardDescription>
                  {t("app.exportDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    disabled={!fullBasisResult?.data?.content}
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
                          title: t("app.exportSuccess"),
                          description: t("app.markdownDownloaded"),
                        });
                      }
                    }}
                  >
                    <FileText className="w-4 h-4" />
                    {t("app.markdown")}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    disabled={!fullBasisResult?.data?.content}
                    onClick={async () => {
                      if (fullBasisResult?.data?.content) {
                        const success = await copyToClipboard(fullBasisResult.data.content);
                        toast({
                          title: success ? t("app.copiedToClipboard") : t("app.copyFailed"),
                          description: success 
                            ? t("app.analysisTextCopied")
                            : t("app.tryAgain"),
                          variant: success ? "default" : "destructive",
                        });
                      }
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    {t("app.copy")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep(2)} className="gap-2">
                {t("app.back")}
              </Button>
              <Button
                onClick={() => {
                  setCurrentStep(1);
                  setSelectedService(null);
                  setSelectedServiceDetails(null);
                  setFullBasisResult(null);
                  setAnalysisProgress(0);
                  setAnalysisComplete(false);
                }}
                className="gap-2 nagarro-gradient text-background nagarro-glow"
              >
                {t("app.startNewAnalysis")}
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/30 py-4">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            {t("footer.createdBy")}
            <span className="text-border">•</span>
            <a
              href="https://www.linkedin.com/in/eeimicke"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
