import { useState, useEffect, useMemo } from "react";
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
  Save
} from "lucide-react";
import { useServiceInventory, useServiceDetails } from "@/hooks/use-sap-services";
import { 
  filterServices, 
  extractCategories, 
  linkClassifications,
  type ServiceInventoryItem,
  type ServiceDetails
} from "@/lib/sap-services";
import { perplexityApi, type AnalysisCategoryUI, type AnalysisResponse, type ServiceLink } from "@/lib/api/perplexity";
import { ServiceCard } from "@/components/ServiceCard";

const steps = [
  { id: 1, title: "Service auswählen", icon: Database, description: "SAP BTP Service wählen" },
  { id: 2, title: "Basis-Analyse", icon: Bot, description: "KI-Analyse" },
  { id: 3, title: "Report", icon: FileText, description: "Übersicht" },
];

const basisCategories: Array<{
  id: AnalysisCategoryUI;
  icon: typeof Shield;
  name: string;
  color: string;
}> = [
  { id: 'security', icon: Shield, name: "Berechtigungen & Security", color: "text-red-400" },
  { id: 'integration', icon: Network, name: "Integration & Konnektivität", color: "text-blue-400" },
  { id: 'monitoring', icon: Activity, name: "Monitoring & Operations", color: "text-primary" },
  { id: 'lifecycle', icon: RefreshCw, name: "Lifecycle Management", color: "text-purple-400" },
];

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
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<ServiceInventoryItem | null>(null);
  const [selectedServiceDetails, setSelectedServiceDetails] = useState<ServiceDetails | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isDark, setIsDark] = useState(true);

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
  const [analysisResults, setAnalysisResults] = useState<Record<AnalysisCategoryUI, AnalysisResponse | null>>({
    security: null,
    integration: null,
    monitoring: null,
    lifecycle: null,
  });
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

  // Service-Details laden sobald ein Service ausgewählt wird
  const {
    data: serviceDetails,
    isLoading: isLoadingDetails,
    isError: isDetailsError,
    error: detailsError,
  } = useServiceDetails(selectedService?.technicalId ?? null);

  // Discovery Center URL aus den echten Service-Details extrahieren
  const discoveryUrl = useMemo(() => {
    if (!serviceDetails?.links) return null;
    const dcLink = serviceDetails.links.find(link => 
      link.classification === "Discovery Center" && 
      !link.value.includes("index.html#")
    );
    return dcLink?.value ?? null;
  }, [serviceDetails]);

  // Gefilterte Services basierend auf Suche und Kategorie
  const filteredServices = useMemo(() => {
    if (!services) return [];
    return filterServices(services, searchQuery, selectedCategory);
  }, [services, searchQuery, selectedCategory]);

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

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // Start Perplexity AI Analysis
  const startAnalysis = async () => {
    const details = selectedServiceDetails || serviceDetails;
    if (!selectedService || !details) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisResults({
      security: null,
      integration: null,
      monitoring: null,
      lifecycle: null,
    });
    setAnalysisComplete(false);

    // Prepare service links for Perplexity
    const serviceLinks: ServiceLink[] = (details.links || [])
      .filter(l => l.value?.startsWith('http'))
      .map(l => ({
        classification: l.classification || 'Other',
        text: l.text || l.classification || 'Link',
        value: l.value,
      }));

    const categories: AnalysisCategoryUI[] = ['security', 'integration', 'monitoring', 'lifecycle'];
    let completedCount = 0;

    try {
      // Run all analyses in parallel
      const promises = categories.map(async (category) => {
        setCurrentAnalysisCategory(category);
        
        const result = await perplexityApi.analyze(
          selectedService.displayName,
          selectedService.description || '',
          serviceLinks,
          category
        );

        completedCount++;
        setAnalysisProgress(Math.round((completedCount / categories.length) * 100));
        
        setAnalysisResults(prev => ({
          ...prev,
          [category]: result,
        }));

        return { category, result };
      });

      await Promise.all(promises);

      setAnalysisComplete(true);
      setCurrentAnalysisCategory(null);
      toast({
        title: "Analyse abgeschlossen",
        description: "Alle 4 Kategorien wurden erfolgreich analysiert.",
      });
    } catch (error) {
      toast({
        title: "Analyse Fehler",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-start analysis when entering Step 2 with service details loaded
  useEffect(() => {
    const details = selectedServiceDetails || serviceDetails;
    if (currentStep === 2 && !isAnalyzing && !analysisComplete && details && !isLoadingDetails) {
      startAnalysis();
    }
  }, [currentStep, serviceDetails, selectedServiceDetails, isLoadingDetails]);

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
                <h1 className="text-xl font-semibold tracking-tight">SAP Basis Analyzer</h1>
                <p className="text-xs text-muted-foreground">Powered by Perplexity AI</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs px-3 py-1 border-primary/30 text-primary">
                <Github className="w-3 h-3 mr-1" />
                Live API
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDark(!isDark)}
                className="rounded-lg"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
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
                  <span className="hidden md:inline text-sm font-medium">{step.title}</span>
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
              <h2 className="text-3xl font-semibold mb-2">SAP BTP Service auswählen</h2>
              <p className="text-muted-foreground mb-2">Wählen Sie einen Service für die Basis-Analyse</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm">
                <Database className="w-4 h-4" />
                <span>
                  {isLoadingServices 
                    ? "Lade Services..." 
                    : isServicesError 
                    ? "Fehler beim Laden" 
                    : `${services?.length || 0} Services vom SAP GitHub Repository`
                  }
                </span>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Services durchsuchen..."
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
                      className="text-xs px-4 py-2 rounded-lg transition-all data-[state=active]:nagarro-gradient data-[state=active]:text-background data-[state=active]:shadow-lg data-[state=active]:nagarro-glow data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/50"
                    >
                      Alle ({categoryCounts.all || 0})
                    </TabsTrigger>
                    {availableCategories.slice(0, 6).map((cat) => (
                      <TabsTrigger 
                        key={cat} 
                        value={cat}
                        className="text-xs px-4 py-2 rounded-lg transition-all data-[state=active]:nagarro-gradient data-[state=active]:text-background data-[state=active]:shadow-lg data-[state=active]:nagarro-glow data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/50"
                      >
                        {cat} ({categoryCounts[cat] || 0})
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              )}
            </div>

            {/* Error State */}
            {isServicesError && (
              <div className="max-w-2xl mx-auto">
                <Card className="border-destructive/50 bg-destructive/5">
                  <CardContent className="flex items-center gap-4 p-6">
                    <AlertCircle className="w-10 h-10 text-destructive flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-medium text-destructive mb-1">Fehler beim Laden der Services</h3>
                      <p className="text-sm text-muted-foreground">{servicesError?.message || "Unbekannter Fehler"}</p>
                    </div>
                    <Button onClick={() => refetchServices()} variant="outline" size="sm">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Erneut versuchen
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
                  <h3 className="text-lg font-medium mb-2">Keine Services gefunden</h3>
                  <p className="text-muted-foreground text-sm">
                    Versuchen Sie einen anderen Suchbegriff oder wählen Sie eine andere Kategorie.
                  </p>
                </div>
              )}
            </div>

            {/* Weiter-Button */}
            {selectedService && (
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={() => setCurrentStep(2)} 
                  className="gap-2 h-12 px-8 nagarro-gradient text-background font-medium nagarro-glow"
                >
                  Analyse starten für "{selectedService.displayName}"
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: AI Analysis */}
        {currentStep === 2 && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="text-center mb-4">
              <h2 className="text-3xl font-semibold mb-2">SAP Basis-Analyse</h2>
              <p className="text-muted-foreground">
                Perplexity AI recherchiert im Web für {selectedService?.displayName || "den Service"}
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
                        Analyse-Prompt
                      </div>
                      <div className="flex items-center gap-2">
                        {prompt && (
                          <Badge variant="outline" className="text-xs">
                            Zuletzt aktualisiert: {new Date(prompt.updated_at).toLocaleDateString("de-DE")}
                          </Badge>
                        )}
                        <ChevronDown className={`w-4 h-4 transition-transform ${isPromptOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Dieser Prompt wird für die KI-Analyse verwendet. Klicken zum Bearbeiten.
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
                          placeholder="Analyse-Prompt eingeben..."
                        />
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {editedPrompt.length} Zeichen
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditedPrompt(prompt?.prompt_text || "")}
                              disabled={editedPrompt === prompt?.prompt_text}
                            >
                              Zurücksetzen
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
                              Speichern
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Service-Kontext Card (read-only JSON preview) */}
            {(selectedServiceDetails || serviceDetails) && (
              <Card className="border-border/50">
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                      <CardTitle className="flex items-center justify-between text-base">
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-primary" />
                          Service-Kontext (aus Metadaten)
                        </div>
                        <ChevronDown className="w-4 h-4" />
                      </CardTitle>
                      <CardDescription>
                        Diese Informationen werden automatisch an die KI übergeben.
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
                              links: (selectedServiceDetails || serviceDetails)?.links?.filter(l => l.value?.startsWith('http')).map(l => ({
                                classification: l.classification,
                                text: l.text || l.classification,
                                url: l.value,
                              })),
                              servicePlans: (selectedServiceDetails || serviceDetails)?.servicePlans?.map(p => ({
                                name: p.displayName,
                                isFree: p.isFree,
                                regions: p.dataCenters?.map(dc => dc.displayName) || [],
                              })),
                              supportComponents: (selectedServiceDetails || serviceDetails)?.supportComponents,
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
                  {currentAnalysisCategory 
                    ? `Analysiere: ${basisCategories.find(c => c.id === currentAnalysisCategory)?.name || currentAnalysisCategory}`
                    : `${analysisProgress}% abgeschlossen`
                  }
                </p>
              </div>
            )}
            
            {/* Service links info */}
            {(serviceDetails?.links || selectedServiceDetails?.links) && (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 text-sm">
                  <Link2 className="w-4 h-4 text-primary" />
                  <span>
                    {(selectedServiceDetails?.links || serviceDetails?.links || []).filter(l => l.value?.startsWith('http')).length} Dokumentationslinks als Recherchekontext
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {basisCategories.map((category) => {
                const result = analysisResults[category.id];
                const isCurrentlyAnalyzing = isAnalyzing && currentAnalysisCategory === category.id;
                const hasResult = result !== null;
                const isSuccess = hasResult && result.success;
                const hasError = hasResult && !result.success;

                return (
                  <Card key={category.id} className={`border-border/50 transition-all ${isSuccess ? 'border-primary/30' : ''}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center`}>
                          <category.icon className={`w-5 h-5 ${category.color}`} />
                        </div>
                        <span className="flex-1">{category.name}</span>
                        {isSuccess && <Check className="w-5 h-5 text-primary" />}
                        {hasError && <AlertCircle className="w-5 h-5 text-destructive" />}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Loading State */}
                      {(!hasResult && !isCurrentlyAnalyzing && isAnalyzing) && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-4 h-4 rounded-full bg-muted animate-pulse" />
                            <span className="text-muted-foreground">Wartend...</span>
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-4/6" />
                          </div>
                        </div>
                      )}

                      {/* Currently Analyzing */}
                      {isCurrentlyAnalyzing && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            <span className="text-muted-foreground">Perplexity AI recherchiert...</span>
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-full animate-pulse" />
                            <Skeleton className="h-4 w-5/6 animate-pulse" />
                            <Skeleton className="h-4 w-4/6 animate-pulse" />
                          </div>
                        </div>
                      )}

                      {/* Error State */}
                      {hasError && (
                        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                          <p className="text-sm text-destructive">
                            Fehler: {result.error || 'Unbekannter Fehler'}
                          </p>
                        </div>
                      )}

                      {/* Success State - Show Analysis */}
                      {isSuccess && result.data && (
                        <div className="space-y-4">
                          <ScrollArea className="h-[200px] rounded-md border border-border/30 p-3">
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <div className="text-sm whitespace-pre-wrap">
                                {result.data.content}
                              </div>
                            </div>
                          </ScrollArea>
                          
                          {/* Citations */}
                          {result.data.citations && result.data.citations.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs text-muted-foreground font-medium">
                                Quellen ({result.data.citations.length}):
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {result.data.citations.slice(0, 3).map((citation, idx) => (
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
                                {result.data.citations.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{result.data.citations.length - 3} mehr
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Initial waiting state */}
                      {!hasResult && !isAnalyzing && (
                        <div className="text-center py-4 text-muted-foreground text-sm">
                          Analyse wird gestartet...
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-between pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setAnalysisResults({
                    security: null,
                    integration: null,
                    monitoring: null,
                    lifecycle: null,
                  });
                  setAnalysisProgress(0);
                  setAnalysisComplete(false);
                  setCurrentStep(1);
                }} 
                className="gap-2"
                disabled={isAnalyzing}
              >
                Zurück
              </Button>
              <Button
                onClick={() => setCurrentStep(3)}
                disabled={!analysisComplete}
                className="gap-2 nagarro-gradient text-background nagarro-glow"
              >
                {analysisComplete ? "Zur Kostenanalyse" : "Analyse läuft..."}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Report */}
        {currentStep === 3 && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-semibold mb-2">Analyse-Report</h2>
              <p className="text-muted-foreground">
                Zusammenfassung für {selectedService?.displayName || "den Service"}
              </p>
            </div>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg nagarro-gradient flex items-center justify-center nagarro-glow">
                    <FileText className="w-5 h-5 text-background" />
                  </div>
                  {selectedService?.displayName || "SAP Service"} - Basis-Analyse
                </CardTitle>
                <CardDescription>
                  Generiert am {new Date().toLocaleDateString("de-DE")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-lg bg-muted/30 space-y-4">
                  <h4 className="font-medium">Zusammenfassung</h4>
                  <p className="text-sm text-muted-foreground">
                    Der vollständige Report enthält detaillierte Informationen zu:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                    <li>Berechtigungen und Security-Anforderungen</li>
                    <li>Integration und Konnektivität</li>
                    <li>Monitoring und Operations</li>
                    <li>Lifecycle Management</li>
                  </ul>
                </div>

                {/* Analysis Results Summary */}
                {analysisComplete && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Analyse-Ergebnisse</h4>
                    {basisCategories.map((category) => {
                      const result = analysisResults[category.id];
                      if (!result?.success || !result.data) return null;
                      
                      return (
                        <div key={category.id} className="p-4 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-2 mb-2">
                            <category.icon className={`w-4 h-4 ${category.color}`} />
                            <h5 className="font-medium text-sm">{category.name}</h5>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-3">
                            {result.data.content.substring(0, 200)}...
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1 gap-2">
                    <FileText className="w-4 h-4" />
                    Als PDF exportieren
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Teilen
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep(2)} className="gap-2">
                Zurück
              </Button>
              <Button
                onClick={() => {
                  setCurrentStep(1);
                  setSelectedService(null);
                  setAnalysisResults({
                    security: null,
                    integration: null,
                    monitoring: null,
                    lifecycle: null,
                  });
                  setAnalysisProgress(0);
                  setAnalysisComplete(false);
                }}
                className="gap-2 nagarro-gradient text-background nagarro-glow"
              >
                Neue Analyse starten
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
