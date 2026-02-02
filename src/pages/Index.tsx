import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ExternalLink
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
  { icon: Shield, name: "Berechtigungen & Security", color: "text-red-500" },
  { icon: Network, name: "Integration & Konnektivität", color: "text-blue-500" },
  { icon: Activity, name: "Monitoring & Operations", color: "text-green-500" },
  { icon: RefreshCw, name: "Lifecycle Management", color: "text-purple-500" },
];

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<typeof mockServices[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredServices = mockServices.filter(
    (service) =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">SAP BTP Basis-Analyzer</h1>
              <p className="text-sm text-muted-foreground">
                Integrationskosten und Basis-relevante Themen analysieren
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              🎨 WIREFRAME / MOCKUP
            </Badge>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center gap-2 cursor-pointer transition-all ${
                    currentStep === step.id
                      ? "text-primary"
                      : currentStep > step.id
                      ? "text-primary/60"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setCurrentStep(step.id)}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      currentStep === step.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : currentStep > step.id
                        ? "border-primary/60 bg-primary/20 text-primary"
                        : "border-muted-foreground/30 bg-background"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-5 h-5 mx-4 text-muted-foreground/50" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Step 1: Service Selection */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Service suchen..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Tabs defaultValue="all" className="w-auto">
                <TabsList>
                  <TabsTrigger value="all">Alle</TabsTrigger>
                  <TabsTrigger value="integration">Integration</TabsTrigger>
                  <TabsTrigger value="ai">AI</TabsTrigger>
                  <TabsTrigger value="data">Data</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServices.map((service) => (
                <Card
                  key={service.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedService?.id === service.id
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                  onClick={() => setSelectedService(service)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {service.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {service.pricing}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-2">{service.name}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" size="sm" className="w-full gap-2">
                      <ExternalLink className="w-4 h-4" />
                      SAP Discovery Center
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedService && (
              <div className="flex justify-end">
                <Button onClick={() => setCurrentStep(2)} className="gap-2">
                  Weiter mit "{selectedService.name}"
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Crawling */}
        {currentStep === 2 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary" />
                  Dokumentation wird gecrawlt...
                </CardTitle>
                <CardDescription>
                  SAP Discovery Center und verknüpfte Dokumentation werden durchsucht
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Fortschritt</span>
                    <span className="text-muted-foreground">67%</span>
                  </div>
                  <Progress value={67} className="h-2" />
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-primary">
                    <Check className="w-4 h-4" />
                    <span>Discovery Center Seite geladen</span>
                  </div>
                  <div className="flex items-center gap-2 text-primary">
                    <Check className="w-4 h-4" />
                    <span>Service-Dokumentation extrahiert</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Pricing-Informationen werden geladen...</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground/50">
                    <div className="w-4 h-4 rounded-full border-2 border-muted" />
                    <span>Verknüpfte Dokumentation scannen</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Zurück
                  </Button>
                  <Button onClick={() => setCurrentStep(3)} className="flex-1">
                    Weiter zur Analyse
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Basis Analysis */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    KI-Analyse läuft...
                  </CardTitle>
                  <CardDescription>
                    Perplexity AI identifiziert Basis-relevante Themen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {basisCategories.map((category, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <category.icon className={`w-4 h-4 ${category.color}`} />
                          <span className="text-sm font-medium">{category.name}</span>
                        </div>
                        <Progress value={index < 2 ? 100 : index === 2 ? 45 : 0} className="h-1" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gefundene Themen</CardTitle>
                  <CardDescription>Basis-relevante Einrichtungsthemen</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">Trust-Konfiguration</span>
                        <Badge className="bg-red-500">Hoch</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Identity Provider und Trust-Beziehungen einrichten
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">Destination Setup</span>
                        <Badge className="bg-blue-500">Mittel</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Backend-Verbindungen konfigurieren
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted border">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Weitere Themen werden analysiert...</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                Zurück
              </Button>
              <Button onClick={() => setCurrentStep(4)}>
                Weiter zur Kostenabschätzung
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Cost Estimation */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Einmalkosten</CardDescription>
                  <CardTitle className="text-3xl">~15 PT</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Implementierung & Schulung
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Monatliche Kosten</CardDescription>
                  <CardTitle className="text-3xl">~€2.500</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Lizenz + Betrieb
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>TCO (3 Jahre)</CardDescription>
                  <CardTitle className="text-3xl">~€105.000</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Total Cost of Ownership
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Implementierungsaufwand</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Einrichtung & Konfiguration</span>
                      <span className="font-medium">8 PT</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Schulung Basis-Team</span>
                      <span className="font-medium">3 PT</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Testing & Abnahme</span>
                      <span className="font-medium">4 PT</span>
                    </div>
                    <div className="border-t pt-2 flex items-center justify-between font-medium">
                      <span>Gesamt</span>
                      <span>15 PT</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Laufende Kosten</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Subscription (monatlich)</span>
                      <span className="font-medium">€1.800</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Wartung (~4h/Monat)</span>
                      <span className="font-medium">€500</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Monitoring-Tools</span>
                      <span className="font-medium">€200</span>
                    </div>
                    <div className="border-t pt-2 flex items-center justify-between font-medium">
                      <span>Gesamt / Monat</span>
                      <span>€2.500</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setCurrentStep(3)}>
                Zurück
              </Button>
              <Button onClick={() => setCurrentStep(5)}>
                Report erstellen
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Report */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>SAP Integration Suite - Basis-Analyse Report</CardTitle>
                    <CardDescription>Generiert am {new Date().toLocaleDateString("de-DE")}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Als PDF exportieren</Button>
                    <Button variant="outline" size="sm">Als Markdown</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Executive Summary */}
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h3 className="font-semibold mb-2">Executive Summary</h3>
                  <p className="text-sm text-muted-foreground">
                    Die SAP Integration Suite erfordert initiale Konfiguration von Trust-Beziehungen, 
                    Destinations und Monitoring. Geschätzter Einrichtungsaufwand: 15 PT. 
                    Monatliche Kosten: ~€2.500. Empfehlung: Externe Beratung für initiale Einrichtung empfohlen.
                  </p>
                </div>

                {/* Basis Topics Overview */}
                <div>
                  <h3 className="font-semibold mb-4">Basis-relevante Themen</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {basisCategories.map((category, index) => (
                      <div key={index} className="p-4 rounded-lg border">
                        <div className="flex items-center gap-2 mb-3">
                          <category.icon className={`w-5 h-5 ${category.color}`} />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-center gap-2">
                            <Check className="w-3 h-3" />
                            Beispiel-Thema 1
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-3 h-3" />
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
                  <div className="h-48 rounded-lg border border-dashed flex items-center justify-center text-muted-foreground">
                    📊 Recharts Kostenvisualisierung (wird in Implementierung ergänzt)
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2 justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Neue Analyse starten
              </Button>
              <Button onClick={() => setCurrentStep(4)}>
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
