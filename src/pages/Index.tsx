import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Database, 
  Bot, 
  DollarSign, 
  FileText,
  ChevronRight,
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
  Map,
  Link2,
  FileCode,
  BookOpen,
  Settings,
  AlertCircle,
  Globe
} from "lucide-react";
import { useServiceInventory } from "@/hooks/use-sap-services";
import { 
  filterServices, 
  extractCategories, 
  getDiscoveryCenterUrl,
  type ServiceInventoryItem 
} from "@/lib/sap-services";

// Mock discovered URLs für Demo (wird später durch echte Daten ersetzt)
const mockDiscoveredUrls = [
  { url: "https://discovery-center.cloud.sap/serviceCatalog/integration-suite", type: "main", selected: true },
  { url: "https://help.sap.com/docs/integration-suite", type: "docs", selected: true },
  { url: "https://help.sap.com/docs/integration-suite/sap-integration-suite/what-is-sap-integration-suite", type: "docs", selected: true },
  { url: "https://help.sap.com/docs/integration-suite/sap-integration-suite/initial-setup", type: "setup", selected: true },
  { url: "https://help.sap.com/docs/integration-suite/sap-integration-suite/configuring-user-access", type: "security", selected: true },
  { url: "https://help.sap.com/docs/integration-suite/sap-integration-suite/monitoring-and-troubleshooting", type: "operations", selected: true },
  { url: "https://help.sap.com/docs/integration-suite/sap-integration-suite/connectivity", type: "integration", selected: true },
  { url: "https://community.sap.com/topics/integration-suite", type: "community", selected: false },
  { url: "https://blogs.sap.com/tags/73554900100800002451/", type: "blog", selected: false },
  { url: "https://api.sap.com/package/IntegrationSuite", type: "api", selected: true },
  { url: "https://help.sap.com/docs/integration-suite/sap-integration-suite/pricing", type: "pricing", selected: true },
  { url: "https://help.sap.com/docs/integration-suite/sap-integration-suite/security-guide", type: "security", selected: true },
];

const steps = [
  { id: 1, title: "Service auswählen", icon: Database, description: "SAP BTP Service wählen" },
  { id: 2, title: "Map Discovery", icon: Map, description: "URLs entdecken" },
  { id: 3, title: "Crawlen", icon: Search, description: "Docs durchsuchen" },
  { id: 4, title: "Basis-Analyse", icon: Bot, description: "KI-Analyse" },
  { id: 5, title: "Kosten", icon: DollarSign, description: "TCO berechnen" },
  { id: 6, title: "Report", icon: FileText, description: "Übersicht" },
];

const basisCategories = [
  { icon: Shield, name: "Berechtigungen & Security", color: "text-red-400" },
  { icon: Network, name: "Integration & Konnektivität", color: "text-blue-400" },
  { icon: Activity, name: "Monitoring & Operations", color: "text-primary" },
  { icon: RefreshCw, name: "Lifecycle Management", color: "text-purple-400" },
];

const urlTypeIcons: Record<string, typeof FileCode> = {
  main: Database,
  docs: BookOpen,
  setup: Settings,
  security: Shield,
  operations: Activity,
  integration: Network,
  community: Link2,
  blog: FileText,
  api: FileCode,
  pricing: DollarSign,
};

const urlTypeLabels: Record<string, string> = {
  main: "Hauptseite",
  docs: "Dokumentation",
  setup: "Einrichtung",
  security: "Sicherheit",
  operations: "Betrieb",
  integration: "Integration",
  community: "Community",
  blog: "Blog",
  api: "API",
  pricing: "Preise",
};

// Hauptkategorien werden dynamisch aus den Daten extrahiert

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<ServiceInventoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isDark, setIsDark] = useState(true);
  const [discoveredUrls, setDiscoveredUrls] = useState(mockDiscoveredUrls);
  const [mapProgress, setMapProgress] = useState(0);
  const [isMapping, setIsMapping] = useState(false);

  // Live-Daten vom SAP GitHub Repository laden
  const { 
    data: services, 
    isLoading: isLoadingServices, 
    isError: isServicesError,
    error: servicesError,
    refetch: refetchServices 
  } = useServiceInventory();

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

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // Simulate mapping progress
  useEffect(() => {
    if (currentStep === 2 && isMapping) {
      const interval = setInterval(() => {
        setMapProgress((prev) => {
          if (prev >= 100) {
            setIsMapping(false);
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [currentStep, isMapping]);

  const startMapping = () => {
    setIsMapping(true);
    setMapProgress(0);
  };

  const toggleUrl = (index: number) => {
    setDiscoveredUrls((prev) =>
      prev.map((url, i) => (i === index ? { ...url, selected: !url.selected } : url))
    );
  };

  const selectedUrlCount = discoveredUrls.filter((u) => u.selected).length;

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
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg nagarro-gradient flex items-center justify-center nagarro-glow">
                <Sparkles className="w-5 h-5 text-background" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">SAP BTP Basis-Analyzer</h1>
                <p className="text-xs text-muted-foreground">
                  Integrationskosten intelligent analysieren
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-xs border-primary/30 text-primary gap-1">
                <Globe className="w-3 h-3" />
                LIVE DATA
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDark(!isDark)}
                className="rounded-full"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="border-b border-border/50 bg-card/50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex flex-col items-center gap-2 cursor-pointer transition-all group ${
                    currentStep === step.id
                      ? "text-primary"
                      : currentStep > step.id
                      ? "text-primary/70"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setCurrentStep(step.id)}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                      currentStep === step.id
                        ? "nagarro-gradient nagarro-glow text-background"
                        : currentStep > step.id
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "bg-muted text-muted-foreground border border-border group-hover:border-primary/30"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="text-center hidden lg:block">
                    <p className="text-xs font-medium">{step.title}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div 
                    className={`w-8 lg:w-14 h-[2px] mx-1 lg:mx-2 transition-colors ${
                      currentStep > step.id ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-10 animate-fade-in">
        {/* Step 1: Service Selection */}
        {currentStep === 1 && (
          <div className="space-y-8 max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-semibold mb-2">SAP BTP Service auswählen</h2>
              <p className="text-muted-foreground mb-2">Wählen Sie einen Service für die Basis-Analyse</p>
              {/* Info-Box für den Benutzer */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm">
                <Globe className="w-4 h-4" />
                <span>
                  Daten werden direkt vom{" "}
                  <a 
                    href="https://github.com/SAP-samples/btp-service-metadata" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:no-underline"
                  >
                    SAP GitHub Repository
                  </a>{" "}
                  geladen
                </span>
              </div>
            </div>

            {/* Fehlerbehandlung */}
            {isServicesError && (
              <Card className="border-destructive/50 bg-destructive/10">
                <CardContent className="flex items-center gap-4 py-6">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-destructive">Fehler beim Laden der Services</h3>
                    <p className="text-sm text-muted-foreground">
                      {servicesError?.message || "Die Service-Daten konnten nicht geladen werden."}
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => refetchServices()}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Erneut versuchen
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Such- und Filterbereich */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Service suchen..."
                  className="pl-11 h-12 bg-card border-border/50 focus:border-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-auto">
                <TabsList className="bg-muted/50 flex-wrap h-auto">
                  <TabsTrigger value="all">Alle</TabsTrigger>
                  {availableCategories.slice(0, 5).map((cat) => (
                    <TabsTrigger key={cat} value={cat}>
                      {cat.length > 15 ? cat.substring(0, 15) + "…" : cat}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Service-Anzahl Anzeige */}
            {!isLoadingServices && services && (
              <div className="text-center text-sm text-muted-foreground">
                {filteredServices.length === services.length ? (
                  <span>{services.length} Services verfügbar</span>
                ) : (
                  <span>
                    {filteredServices.length} von {services.length} Services
                    {searchQuery && ` für "${searchQuery}"`}
                    {selectedCategory !== "all" && ` in ${selectedCategory}`}
                  </span>
                )}
              </div>
            )}

            {/* Service-Karten Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Ladezustand mit Skeleton-Karten */}
              {isLoadingServices && (
                <>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ServiceCardSkeleton key={i} />
                  ))}
                </>
              )}

              {/* Echte Service-Karten */}
              {!isLoadingServices && filteredServices.map((service) => (
                <Card
                  key={service.technicalId}
                  className={`cursor-pointer card-hover border-border/50 ${
                    selectedService?.technicalId === service.technicalId
                      ? "ring-2 ring-primary border-primary nagarro-glow"
                      : "hover:border-primary/30"
                  }`}
                  onClick={() => setSelectedService(service)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
                        {service.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-1">{service.displayName}</CardTitle>
                    <CardDescription className="text-sm line-clamp-2">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full gap-2 text-muted-foreground hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(getDiscoveryCenterUrl(service.technicalId), "_blank");
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      SAP Discovery Center
                    </Button>
                  </CardContent>
                </Card>
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
                  onClick={() => {
                    setCurrentStep(2);
                    startMapping();
                  }} 
                  className="gap-2 h-12 px-8 nagarro-gradient text-background font-medium nagarro-glow"
                >
                  URLs entdecken für "{selectedService.displayName}"
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Map Discovery - NEW */}
        {currentStep === 2 && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-semibold mb-2">Map Discovery</h2>
              <p className="text-muted-foreground">
                Alle relevanten URLs für {selectedService?.displayName || "den Service"} entdecken
              </p>
            </div>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg nagarro-gradient flex items-center justify-center">
                    <Map className="w-5 h-5 text-background" />
                  </div>
                  {mapProgress < 100 ? "URLs werden entdeckt..." : "URLs gefunden"}
                </CardTitle>
                <CardDescription>
                  Firecrawl Map scannt die SAP Discovery Center Seite und verknüpfte Dokumentation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Mapping Fortschritt</span>
                    <span className="text-primary font-medium">{mapProgress}%</span>
                  </div>
                  <Progress value={mapProgress} className="h-2" />
                </div>

                {/* URL Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-muted/50 text-center">
                    <p className="text-2xl font-semibold text-primary">{discoveredUrls.length}</p>
                    <p className="text-xs text-muted-foreground">URLs gefunden</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50 text-center">
                    <p className="text-2xl font-semibold text-primary">{selectedUrlCount}</p>
                    <p className="text-xs text-muted-foreground">Ausgewählt</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50 text-center">
                    <p className="text-2xl font-semibold text-primary">
                      {new Set(discoveredUrls.map((u) => u.type)).size}
                    </p>
                    <p className="text-xs text-muted-foreground">Kategorien</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Discovered URLs List */}
            {mapProgress >= 100 && (
              <Card className="border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Link2 className="w-5 h-5 text-primary" />
                      Entdeckte URLs
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setDiscoveredUrls((prev) => prev.map((u) => ({ ...u, selected: true })))
                        }
                      >
                        Alle auswählen
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setDiscoveredUrls((prev) => prev.map((u) => ({ ...u, selected: false })))
                        }
                      >
                        Keine
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    Wählen Sie die URLs aus, die für die Basis-Analyse gecrawlt werden sollen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-2">
                      {discoveredUrls.map((urlItem, index) => {
                        const IconComponent = urlTypeIcons[urlItem.type] || Link2;
                        return (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border transition-all cursor-pointer ${
                              urlItem.selected
                                ? "border-primary/50 bg-primary/5"
                                : "border-border/50 hover:border-primary/30"
                            }`}
                            onClick={() => toggleUrl(index)}
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={urlItem.selected}
                                onCheckedChange={() => toggleUrl(index)}
                              />
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  urlItem.selected ? "bg-primary/20" : "bg-muted"
                                }`}
                              >
                                <IconComponent
                                  className={`w-4 h-4 ${
                                    urlItem.selected ? "text-primary" : "text-muted-foreground"
                                  }`}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {urlTypeLabels[urlItem.type] || urlItem.type}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground truncate">
                                  {urlItem.url}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(urlItem.url, "_blank");
                                }}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="gap-2"
              >
                Zurück zur Auswahl
              </Button>
              {mapProgress >= 100 && selectedUrlCount > 0 && (
                <Button
                  onClick={() => setCurrentStep(3)}
                  className="gap-2 nagarro-gradient text-background nagarro-glow"
                >
                  {selectedUrlCount} URLs crawlen
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Crawling Progress */}
        {currentStep === 3 && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-semibold mb-2">Dokumentation wird gecrawlt</h2>
              <p className="text-muted-foreground">
                Firecrawl extrahiert die Inhalte der ausgewählten URLs
              </p>
            </div>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Search className="w-5 h-5 text-primary animate-pulse" />
                  </div>
                  Crawling läuft...
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Fortschritt</span>
                    <span className="text-primary font-medium">Demo</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>

                <div className="space-y-2">
                  {discoveredUrls
                    .filter((u) => u.selected)
                    .slice(0, 5)
                    .map((url, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                      >
                        {i < 3 ? (
                          <Check className="w-4 h-4 text-primary" />
                        ) : i === 3 ? (
                          <Loader2 className="w-4 h-4 text-primary animate-spin" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-muted-foreground" />
                        )}
                        <span className="text-sm truncate flex-1">{url.url}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep(2)} className="gap-2">
                Zurück
              </Button>
              <Button
                onClick={() => setCurrentStep(4)}
                className="gap-2 nagarro-gradient text-background nagarro-glow"
              >
                Zur Basis-Analyse
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: AI Analysis */}
        {currentStep === 4 && (
          <div className="space-y-8 max-w-5xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-semibold mb-2">SAP Basis-Analyse</h2>
              <p className="text-muted-foreground">
                Perplexity AI analysiert die Dokumentation für {selectedService?.displayName || "den Service"}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {basisCategories.map((category, index) => (
                <Card key={index} className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center`}>
                        <category.icon className={`w-5 h-5 ${category.color}`} />
                      </div>
                      {category.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-muted-foreground">Analysiere...</span>
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-4/6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep(3)} className="gap-2">
                Zurück
              </Button>
              <Button
                onClick={() => setCurrentStep(5)}
                className="gap-2 nagarro-gradient text-background nagarro-glow"
              >
                Zur Kostenanalyse
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Cost Analysis */}
        {currentStep === 5 && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-semibold mb-2">Kostenanalyse</h2>
              <p className="text-muted-foreground">
                TCO-Berechnung für {selectedService?.displayName || "den Service"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardDescription>Lizenzkosten (p.a.)</CardDescription>
                  <CardTitle className="text-2xl text-primary">€ --,--</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Basierend auf Service-Plans</p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardDescription>Basis-Aufwand</CardDescription>
                  <CardTitle className="text-2xl text-primary">-- PT</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Initiale Einrichtung</p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardDescription>Laufender Betrieb</CardDescription>
                  <CardTitle className="text-2xl text-primary">-- PT/Monat</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Monitoring & Support</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Kostenaufschlüsselung</CardTitle>
                <CardDescription>Details werden nach der Analyse berechnet</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  <p className="text-sm">Diagramm wird nach der vollständigen Analyse angezeigt</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep(4)} className="gap-2">
                Zurück
              </Button>
              <Button
                onClick={() => setCurrentStep(6)}
                className="gap-2 nagarro-gradient text-background nagarro-glow"
              >
                Zum Report
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 6: Report */}
        {currentStep === 6 && (
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
                    Der vollständige Report wird nach Abschluss aller Analyse-Schritte generiert.
                    Er enthält detaillierte Informationen zu:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                    <li>Berechtigungen und Security-Anforderungen</li>
                    <li>Integration und Konnektivität</li>
                    <li>Monitoring und Operations</li>
                    <li>Lifecycle Management</li>
                    <li>Kostenaufschlüsselung und TCO</li>
                  </ul>
                </div>

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
              <Button variant="outline" onClick={() => setCurrentStep(5)} className="gap-2">
                Zurück
              </Button>
              <Button
                onClick={() => {
                  setCurrentStep(1);
                  setSelectedService(null);
                  setMapProgress(0);
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
