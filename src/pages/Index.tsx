import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Sparkles
} from "lucide-react";

const mockServices = [
  { id: 1, name: "SAP Integration Suite", category: "Integration", description: "Integrationsplattform für Cloud und On-Premise", pricing: "Subscription" },
  { id: 2, name: "SAP AI Core", category: "AI", description: "Machine Learning und AI-Infrastruktur", pricing: "Pay-per-Use" },
  { id: 3, name: "SAP HANA Cloud", category: "Data & Analytics", description: "In-Memory Datenbank als Service", pricing: "Subscription" },
  { id: 4, name: "SAP Build Work Zone", category: "Application Development", description: "Unified Launchpad und Digital Workplace", pricing: "Subscription" },
  { id: 5, name: "SAP Cloud Identity Services", category: "Security", description: "Identity & Access Management", pricing: "Included" },
  { id: 6, name: "SAP Connectivity Service", category: "Integration", description: "Cloud Connector und Destination Management", pricing: "Included" },
];

const steps = [
  { id: 1, title: "Service auswählen", icon: Database, description: "SAP BTP Service wählen" },
  { id: 2, title: "Dokumentation crawlen", icon: Search, description: "SAP Docs durchsuchen" },
  { id: 3, title: "Basis-Analyse", icon: Bot, description: "KI-gestützte Analyse" },
  { id: 4, title: "Kostenabschätzung", icon: DollarSign, description: "TCO berechnen" },
  { id: 5, title: "Report erstellen", icon: FileText, description: "Übersicht generieren" },
];

const basisCategories = [
  { icon: Shield, name: "Berechtigungen & Security", color: "text-red-400" },
  { icon: Network, name: "Integration & Konnektivität", color: "text-blue-400" },
  { icon: Activity, name: "Monitoring & Operations", color: "text-primary" },
  { icon: RefreshCw, name: "Lifecycle Management", color: "text-purple-400" },
];

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<typeof mockServices[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const filteredServices = mockServices.filter(
    (service) =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header - Nagarro Style */}
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
              <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                WIREFRAME
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

      {/* Progress Steps - Clean Nagarro Style */}
      <div className="border-b border-border/50 bg-card/50">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
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
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
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
                  <div className="text-center hidden md:block">
                    <p className="text-xs font-medium">{step.title}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div 
                    className={`w-12 lg:w-20 h-[2px] mx-2 transition-colors ${
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
              <p className="text-muted-foreground">Wählen Sie einen Service für die Basis-Analyse</p>
            </div>

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
              <Tabs defaultValue="all" className="w-auto">
                <TabsList className="bg-muted/50">
                  <TabsTrigger value="all">Alle</TabsTrigger>
                  <TabsTrigger value="integration">Integration</TabsTrigger>
                  <TabsTrigger value="ai">AI</TabsTrigger>
                  <TabsTrigger value="data">Data</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredServices.map((service) => (
                <Card
                  key={service.id}
                  className={`cursor-pointer card-hover border-border/50 ${
                    selectedService?.id === service.id
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
                      <Badge variant="outline" className="text-xs">
                        {service.pricing}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <CardDescription className="text-sm">{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" size="sm" className="w-full gap-2 text-muted-foreground hover:text-primary">
                      <ExternalLink className="w-4 h-4" />
                      SAP Discovery Center
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedService && (
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={() => setCurrentStep(2)} 
                  className="gap-2 h-12 px-8 nagarro-gradient text-background font-medium nagarro-glow"
                >
                  Weiter mit "{selectedService.name}"
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Crawling */}
        {currentStep === 2 && (
          <div className="max-w-xl mx-auto space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg nagarro-gradient flex items-center justify-center">
                    <Search className="w-5 h-5 text-background" />
                  </div>
                  Dokumentation wird gecrawlt...
                </CardTitle>
                <CardDescription>
                  SAP Discovery Center und verknüpfte Dokumentation werden durchsucht
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Fortschritt</span>
                    <span className="text-primary font-medium">67%</span>
                  </div>
                  <Progress value={67} className="h-2" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-primary">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-sm">Discovery Center Seite geladen</span>
                  </div>
                  <div className="flex items-center gap-3 text-primary">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-sm">Service-Dokumentation extrahiert</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                      <Loader2 className="w-3 h-3 animate-spin" />
                    </div>
                    <span className="text-sm">Pricing-Informationen werden geladen...</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground/50">
                    <div className="w-6 h-6 rounded-full border border-border flex items-center justify-center" />
                    <span className="text-sm">Verknüpfte Dokumentation scannen</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                    Zurück
                  </Button>
                  <Button 
                    onClick={() => setCurrentStep(3)} 
                    className="flex-1 nagarro-gradient text-background"
                  >
                    Weiter zur Analyse
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Basis Analysis */}
        {currentStep === 3 && (
          <div className="space-y-8 max-w-5xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-semibold mb-2">KI-gestützte Basis-Analyse</h2>
              <p className="text-muted-foreground">Perplexity AI identifiziert relevante Themen</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg nagarro-gradient flex items-center justify-center">
                      <Bot className="w-5 h-5 text-background" />
                    </div>
                    Analyse läuft...
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    {basisCategories.map((category, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <category.icon className={`w-4 h-4 ${category.color}`} />
                          <span className="text-sm font-medium">{category.name}</span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {index < 2 ? "100%" : index === 2 ? "45%" : "0%"}
                          </span>
                        </div>
                        <Progress value={index < 2 ? 100 : index === 2 ? 45 : 0} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Gefundene Themen</CardTitle>
                  <CardDescription>Basis-relevante Einrichtungsthemen</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">Trust-Konfiguration</span>
                        <Badge className="bg-red-500/20 text-red-400 border-0">Hoch</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Identity Provider und Trust-Beziehungen einrichten
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">Destination Setup</span>
                        <Badge className="bg-blue-500/20 text-blue-400 border-0">Mittel</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Backend-Verbindungen konfigurieren
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted border border-border">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Weitere Themen werden analysiert...</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-3 justify-center pt-4">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                Zurück
              </Button>
              <Button onClick={() => setCurrentStep(4)} className="nagarro-gradient text-background px-8">
                Weiter zur Kostenabschätzung
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Cost Estimation */}
        {currentStep === 4 && (
          <div className="space-y-8 max-w-5xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-semibold mb-2">Kostenabschätzung</h2>
              <p className="text-muted-foreground">Total Cost of Ownership Analyse</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Card className="border-border/50 card-hover">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs uppercase tracking-wider">Einmalkosten</CardDescription>
                  <CardTitle className="text-4xl font-light">
                    <span className="text-primary">~15</span>
                    <span className="text-lg ml-1 text-muted-foreground">PT</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Implementierung & Schulung
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50 card-hover">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs uppercase tracking-wider">Monatliche Kosten</CardDescription>
                  <CardTitle className="text-4xl font-light">
                    <span className="text-primary">~€2.500</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Lizenz + Betrieb
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/30 nagarro-glow card-hover">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs uppercase tracking-wider text-primary">TCO (3 Jahre)</CardDescription>
                  <CardTitle className="text-4xl font-light">
                    <span className="text-primary">~€105.000</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Total Cost of Ownership
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Implementierungsaufwand</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">Einrichtung & Konfiguration</span>
                      <span className="font-medium">8 PT</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">Schulung Basis-Team</span>
                      <span className="font-medium">3 PT</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">Testing & Abnahme</span>
                      <span className="font-medium">4 PT</span>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="font-medium">Gesamt</span>
                      <span className="font-semibold text-primary">15 PT</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Laufende Kosten</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">Subscription (monatlich)</span>
                      <span className="font-medium">€1.800</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">Wartung (~4h/Monat)</span>
                      <span className="font-medium">€500</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">Monitoring-Tools</span>
                      <span className="font-medium">€200</span>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="font-medium">Gesamt / Monat</span>
                      <span className="font-semibold text-primary">€2.500</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-3 justify-center pt-4">
              <Button variant="outline" onClick={() => setCurrentStep(3)}>
                Zurück
              </Button>
              <Button onClick={() => setCurrentStep(5)} className="nagarro-gradient text-background px-8">
                Report erstellen
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Report */}
        {currentStep === 5 && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">SAP Integration Suite</CardTitle>
                    <CardDescription>Basis-Analyse Report • {new Date().toLocaleDateString("de-DE")}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <FileText className="w-4 h-4" />
                      PDF
                    </Button>
                    <Button variant="outline" size="sm">
                      Markdown
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Executive Summary */}
                <div className="p-5 rounded-xl nagarro-gradient/10 border border-primary/20 bg-primary/5">
                  <h3 className="font-semibold mb-3 text-primary">Executive Summary</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Die SAP Integration Suite erfordert initiale Konfiguration von Trust-Beziehungen, 
                    Destinations und Monitoring. Geschätzter Einrichtungsaufwand: <strong className="text-foreground">15 PT</strong>. 
                    Monatliche Kosten: <strong className="text-foreground">~€2.500</strong>. 
                    Empfehlung: Externe Beratung für initiale Einrichtung empfohlen.
                  </p>
                </div>

                {/* Basis Topics Overview */}
                <div>
                  <h3 className="font-semibold mb-5">Basis-relevante Themen</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {basisCategories.map((category, index) => (
                      <div key={index} className="p-4 rounded-xl border border-border/50 bg-card">
                        <div className="flex items-center gap-2 mb-4">
                          <div className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center`}>
                            <category.icon className={`w-4 h-4 ${category.color}`} />
                          </div>
                          <span className="font-medium text-sm">{category.name}</span>
                        </div>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-center gap-2">
                            <Check className="w-3 h-3 text-primary" />
                            Beispiel-Thema 1
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-3 h-3 text-primary" />
                            Beispiel-Thema 2
                          </li>
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cost Summary Chart Placeholder */}
                <div>
                  <h3 className="font-semibold mb-4">Kostenübersicht</h3>
                  <div className="h-48 rounded-xl border border-dashed border-border/50 flex items-center justify-center text-muted-foreground bg-muted/30">
                    📊 Recharts Kostenvisualisierung (wird in Implementierung ergänzt)
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3 justify-between">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedService(null);
                  setCurrentStep(1);
                }}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Neue Analyse
              </Button>
              <Button variant="outline" onClick={() => setCurrentStep(4)}>
                Zurück zur Kostenabschätzung
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
