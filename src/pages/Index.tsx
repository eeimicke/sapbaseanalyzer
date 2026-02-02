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
  Globe,
  Github
} from "lucide-react";
import { useServiceInventory, useServiceDetails } from "@/hooks/use-sap-services";
import { 
  filterServices, 
  extractCategories, 
  linkClassifications,
  type ServiceInventoryItem,
  type ServiceLink
} from "@/lib/sap-services";

// Typ für UI-Links mit Selection-State
interface DiscoveredUrl {
  url: string;
  classification: string;
  text: string;
  type: string;
  selected: boolean;
}

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

// Icon-Mapping für Link-Classifications aus der API
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

// Label-Mapping für Link-Classifications
const classificationLabels: Record<string, string> = {
  "Discovery Center": "Discovery Center",
  "Documentation": "Dokumentation",
  "SAP Help Portal": "SAP Help Portal",
  "Tutorial": "Tutorial",
  "API Hub": "API Hub",
  "Support": "Support",
  "Marketing": "Marketing",
  "Other": "Sonstige",
};

// Hauptkategorien werden dynamisch aus den Daten extrahiert

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<ServiceInventoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isDark, setIsDark] = useState(true);
  const [discoveredUrls, setDiscoveredUrls] = useState<DiscoveredUrl[]>([]);
  const [mapProgress, setMapProgress] = useState(0);

  // Live-Daten vom SAP GitHub Repository laden
  const { 
    data: services, 
    isLoading: isLoadingServices, 
    isError: isServicesError,
    error: servicesError,
    refetch: refetchServices 
  } = useServiceInventory();

  // Service-Details laden sobald ein Service ausgewählt wird (auch schon in Schritt 1)
  const {
    data: serviceDetails,
    isLoading: isLoadingDetails,
    isError: isDetailsError,
    error: detailsError,
    refetch: refetchDetails
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

  // Links nach Classification gruppieren für die Anzeige
  const groupedLinks = useMemo(() => {
    const groups: Record<string, DiscoveredUrl[]> = {};
    for (const url of discoveredUrls) {
      const classification = url.classification || "Other";
      if (!groups[classification]) {
        groups[classification] = [];
      }
      groups[classification].push(url);
    }
    // Nach Priorität sortieren
    const sorted = Object.entries(groups).sort((a, b) => {
      const priorityA = linkClassifications[a[0] as keyof typeof linkClassifications]?.priority ?? 99;
      const priorityB = linkClassifications[b[0] as keyof typeof linkClassifications]?.priority ?? 99;
      return priorityA - priorityB;
    });
    return Object.fromEntries(sorted);
  }, [discoveredUrls]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // Wenn Service-Details geladen werden, URLs konvertieren
  useEffect(() => {
    if (serviceDetails?.links) {
      const urls: DiscoveredUrl[] = serviceDetails.links
        .filter(link => link.value && link.value.startsWith("http"))
        .map(link => ({
          url: link.value,
          classification: link.classification || "Other",
          text: link.text || link.value,
          type: link.type || "Link",
          selected: ["Discovery Center", "Documentation", "SAP Help Portal", "API Hub"].includes(link.classification)
        }));
      setDiscoveredUrls(urls);
      // Progress auf 100 setzen wenn Links geladen
      if (urls.length > 0) {
        setMapProgress(100);
      }
    }
  }, [serviceDetails]);

  // Progress-Animation beim Laden der Details
  useEffect(() => {
    if (currentStep === 2 && isLoadingDetails) {
      setMapProgress(0);
      const interval = setInterval(() => {
        setMapProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90; // Stoppt bei 90%, wird auf 100% gesetzt wenn Daten da sind
          }
          return prev + 15;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [currentStep, isLoadingDetails]);

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
                  <TabsTrigger value="all">
                    Alle ({categoryCounts.all || 0})
                  </TabsTrigger>
                  {availableCategories.slice(0, 5).map((cat) => (
                    <TabsTrigger key={cat} value={cat}>
                      {cat.length > 12 ? cat.substring(0, 12) + "…" : cat} ({categoryCounts[cat] || 0})
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
                      <a
                        href={`https://github.com/SAP-samples/btp-service-metadata/blob/main/v1/developer/${service.technicalId}.json`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        title="JSON auf GitHub ansehen"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    </div>
                    <CardTitle className="text-lg line-clamp-1">{service.displayName}</CardTitle>
                    <CardDescription className={selectedService?.technicalId === service.technicalId ? "text-sm" : "text-sm line-clamp-2"}>
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  
                  {/* Links anzeigen wenn Service ausgewählt */}
                  {selectedService?.technicalId === service.technicalId && (
                    <CardContent className="pt-0">
                      {isLoadingDetails ? (
                        <div className="flex items-center gap-2 text-muted-foreground py-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Lade Links...</span>
                        </div>
                      ) : serviceDetails?.links && serviceDetails.links.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            {serviceDetails.links.filter(l => l.value?.startsWith("http")).length} Links verfügbar:
                          </p>
                          <div className="space-y-1 max-h-48 overflow-y-auto">
                            {serviceDetails.links
                              .filter(link => link.value?.startsWith("http"))
                              .map((link, idx) => {
                                const Icon = classificationIcons[link.classification] || Link2;
                                return (
                                  <a
                                    key={idx}
                                    href={link.value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center gap-2 text-xs p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors group"
                                  >
                                    <Icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                                    <span className="flex-1 truncate text-muted-foreground group-hover:text-foreground">
                                      {link.text || link.classification || "Link"}
                                    </span>
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 flex-shrink-0">
                                      {link.classification || "Other"}
                                    </Badge>
                                    <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                                  </a>
                                );
                              })}
                          </div>
                          
                          {/* Button zum Übergeben an Map Discovery */}
                          <Button
                            size="sm"
                            className="w-full mt-3 gap-2 nagarro-gradient text-background"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentStep(2);
                            }}
                          >
                            <Map className="w-4 h-4" />
                            {serviceDetails.links.filter(l => l.value?.startsWith("http")).length} Links an Map Discovery übergeben
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground py-2">
                          Keine Links verfügbar
                        </p>
                      )}
                    </CardContent>
                  )}
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
                    // Details werden automatisch geladen durch useServiceDetails Hook
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
                    {isLoadingDetails ? (
                      <Loader2 className="w-5 h-5 text-background animate-spin" />
                    ) : (
                      <Map className="w-5 h-5 text-background" />
                    )}
                  </div>
                  {isLoadingDetails 
                    ? "Links werden geladen..." 
                    : isDetailsError 
                    ? "Fehler beim Laden" 
                    : `${discoveredUrls.length} Links gefunden`}
                </CardTitle>
                <CardDescription>
                  Daten werden direkt vom SAP GitHub Repository geladen ({selectedService?.technicalId}.json)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Error State */}
                {isDetailsError && (
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                    <AlertCircle className="w-6 h-6 text-destructive" />
                    <div className="flex-1">
                      <p className="font-medium text-destructive">Fehler beim Laden der Links</p>
                      <p className="text-sm text-muted-foreground">{detailsError?.message}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => refetchDetails()}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Erneut versuchen
                    </Button>
                  </div>
                )}

                {/* Progress */}
                {!isDetailsError && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Lade Fortschritt</span>
                      <span className="text-primary font-medium">{mapProgress}%</span>
                    </div>
                    <Progress value={mapProgress} className="h-2" />
                  </div>
                )}

                {/* URL Stats */}
                {!isDetailsError && mapProgress >= 100 && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-muted/50 text-center">
                      <p className="text-2xl font-semibold text-primary">{discoveredUrls.length}</p>
                      <p className="text-xs text-muted-foreground">Links gefunden</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50 text-center">
                      <p className="text-2xl font-semibold text-primary">{selectedUrlCount}</p>
                      <p className="text-xs text-muted-foreground">Ausgewählt</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50 text-center">
                      <p className="text-2xl font-semibold text-primary">
                        {Object.keys(groupedLinks).length}
                      </p>
                      <p className="text-xs text-muted-foreground">Kategorien</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Discovered URLs List - Grouped by Classification */}
            {mapProgress >= 100 && discoveredUrls.length > 0 && (
              <Card className="border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Link2 className="w-5 h-5 text-primary" />
                      Entdeckte Links nach Kategorie
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
                    Wählen Sie die Links aus, die für die Basis-Analyse gecrawlt werden sollen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-6">
                      {Object.entries(groupedLinks).map(([classification, links]) => {
                        const IconComponent = classificationIcons[classification] || Link2;
                        const selectedInGroup = links.filter(l => l.selected).length;
                        
                        return (
                          <div key={classification} className="space-y-3">
                            {/* Category Header */}
                            <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm py-2 z-10">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <IconComponent className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-medium">
                                    {classificationLabels[classification] || classification}
                                  </h4>
                                  <p className="text-xs text-muted-foreground">
                                    {selectedInGroup} von {links.length} ausgewählt
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs"
                                onClick={() => {
                                  const allSelected = links.every(l => l.selected);
                                  setDiscoveredUrls(prev => 
                                    prev.map(u => 
                                      u.classification === classification 
                                        ? { ...u, selected: !allSelected }
                                        : u
                                    )
                                  );
                                }}
                              >
                                {links.every(l => l.selected) ? "Keine" : "Alle"}
                              </Button>
                            </div>
                            
                            {/* Links in Category */}
                            <div className="space-y-2 pl-2">
                              {links.map((urlItem) => {
                                const globalIndex = discoveredUrls.findIndex(u => u.url === urlItem.url);
                                return (
                                  <div
                                    key={urlItem.url}
                                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                                      urlItem.selected
                                        ? "border-primary/50 bg-primary/5"
                                        : "border-border/50 hover:border-primary/30"
                                    }`}
                                    onClick={() => toggleUrl(globalIndex)}
                                  >
                                    <div className="flex items-center gap-3">
                                      <Checkbox
                                        checked={urlItem.selected}
                                        onCheckedChange={() => toggleUrl(globalIndex)}
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate mb-0.5">
                                          {urlItem.text || urlItem.url}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                          {urlItem.url}
                                        </p>
                                      </div>
                                      <Badge variant="outline" className="text-xs shrink-0">
                                        {urlItem.type}
                                      </Badge>
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
