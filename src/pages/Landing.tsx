import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/hooks/useTheme";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
} from "lucide-react";

const features = [
  {
    icon: Database,
    title: "589+ SAP BTP Services",
    description: "Zugriff auf den kompletten SAP BTP Service-Katalog direkt vom offiziellen GitHub Repository.",
  },
  {
    icon: Bot,
    title: "KI-gestützte Analyse",
    description: "Perplexity AI analysiert Services und liefert strukturierte Basis-Dokumentation.",
  },
  {
    icon: FileText,
    title: "Wiki-Export",
    description: "Exportieren Sie Analysen als Confluence-Wiki oder Markdown für Ihre Dokumentation.",
  },
  {
    icon: Zap,
    title: "Echtzeit-Daten",
    description: "Immer aktuelle Service-Metadaten direkt von SAP-samples/btp-service-metadata.",
  },
  {
    icon: Shield,
    title: "Enterprise-Ready",
    description: "Sichere Authentifizierung und datenschutzkonforme Verarbeitung Ihrer Analysen.",
  },
  {
    icon: Globe,
    title: "Cloud-Native",
    description: "Vollständig in der Cloud gehostet, jederzeit und überall verfügbar.",
  },
];

const steps = [
  {
    step: "01",
    title: "Service auswählen",
    description: "Wählen Sie aus über 589 SAP BTP Services den gewünschten Service für die Analyse.",
  },
  {
    step: "02",
    title: "KI-Analyse starten",
    description: "Unsere KI analysiert den Service und erstellt eine strukturierte Basis-Dokumentation.",
  },
  {
    step: "03",
    title: "Exportieren",
    description: "Exportieren Sie die Ergebnisse als Confluence-Wiki oder Markdown in Ihre Dokumentation.",
  },
];

const Landing = () => {
  const { isDark, toggleTheme } = useTheme();

  // Lade 10 Services mit hoher Basis-Relevanz aus dem Cache
  const { data: highRelevanceServices, isLoading: isLoadingServices } = useQuery({
    queryKey: ["landing-high-relevance"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_relevance_cache")
        .select("service_technical_id, reason")
        .eq("relevance", "hoch")
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 Minuten
  });

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl nagarro-gradient flex items-center justify-center nagarro-glow flex-shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-background" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-semibold tracking-tight truncate">SAP Basis Analyzer</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">by Ernst Eimicke</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-lg h-8 w-8 sm:h-9 sm:w-9"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <a
                href="https://www.linkedin.com/in/eeimicke"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <Linkedin className="w-4 h-4" />
                <span className="hidden md:inline">LinkedIn</span>
              </a>
              <Badge variant="outline" className="text-xs px-2 sm:px-3 py-1 border-primary/30 text-primary hidden lg:flex">
                <Github className="w-3 h-3 mr-1" />
                Open Source Data
              </Badge>
              <Link to="/auth" className="hidden sm:block">
                <Button variant="outline" size="sm" className="h-8 text-xs sm:text-sm">
                  Anmelden
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="sm" className="nagarro-gradient text-background nagarro-glow h-8 text-xs sm:text-sm px-2 sm:px-4">
                  <span className="hidden sm:inline">Kostenlos starten</span>
                  <span className="sm:hidden">Start</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto px-6 py-20 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge className="nagarro-gradient text-background px-4 py-1.5 text-sm">
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              Powered by Perplexity AI
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              SAP BTP Services
              <span className="block text-primary">intelligent analysiert</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Analysieren Sie über 589 SAP BTP Services mit KI-Unterstützung und erstellen Sie 
              strukturierte Basis-Dokumentation für Ihr Team.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button size="lg" className="nagarro-gradient text-background nagarro-glow h-12 px-8 text-base">
                  Jetzt starten
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a
                href="https://github.com/SAP-samples/btp-service-metadata"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                  <Github className="w-4 h-4 mr-2" />
                  Datenquelle ansehen
                </Button>
              </a>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-8 border-t border-border/50 mt-12">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">589+</p>
                <p className="text-sm text-muted-foreground">SAP BTP Services</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">AI</p>
                <p className="text-sm text-muted-foreground">Powered Analysis</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">100%</p>
                <p className="text-sm text-muted-foreground">Cloud-Native</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* High Relevance Services Preview */}
      <section className="py-16 border-b border-border/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <Badge className="mb-4 bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">
              <CircleCheck className="w-3 h-3 mr-1.5" />
              Hohe Basis-Relevanz
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Services für SAP Basis-Administratoren
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
              Diese Services wurden von unserer KI als besonders relevant für SAP Basis-Aufgaben klassifiziert.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 max-w-7xl mx-auto">
            {isLoadingServices ? (
              Array.from({ length: 10 }).map((_, i) => (
                <Card key={i} className="border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Skeleton className="h-5 w-24" />
                  </CardContent>
                </Card>
              ))
            ) : highRelevanceServices && highRelevanceServices.length > 0 ? (
              highRelevanceServices.map((service) => (
                <Card 
                  key={service.service_technical_id} 
                  className="border-border/50 hover:border-primary/50 transition-all card-hover"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        Service
                      </Badge>
                      <Badge className="text-[10px] px-1.5 py-0.5 gap-1 bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Hoch
                      </Badge>
                    </div>
                    <CardTitle className="text-base leading-tight">
                      {service.service_technical_id}
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-2">
                      {service.reason}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <code className="bg-muted px-2 py-1 rounded text-[10px] text-muted-foreground">
                      {service.service_technical_id}
                    </code>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground py-8">
                <p className="text-sm">Starte die App um Services zu klassifizieren</p>
              </div>
            )}
          </div>

          <div className="text-center mt-8">
            <Link to="/auth">
              <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
                Alle Basis-relevanten Services ansehen
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Alles was Sie brauchen
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Der SAP Basis Analyzer kombiniert aktuelle SAP-Metadaten mit 
              fortschrittlicher KI-Analyse für optimale Ergebnisse.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-border/50 card-hover bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Workflow</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              In 3 Schritten zur Dokumentation
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Einfacher Workflow für schnelle und präzise Service-Analysen.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl nagarro-gradient flex items-center justify-center mb-6 nagarro-glow">
                      <span className="text-2xl font-bold text-background">{step.step}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="hidden md:block absolute top-8 -right-4 w-8 h-8 text-primary/30" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-16">
            <Link to="/auth">
              <Button size="lg" className="nagarro-gradient text-background nagarro-glow h-12 px-8">
                Jetzt kostenlos testen
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-12 md:p-16 relative">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Bereit für effizientere SAP-Dokumentation?
                </h2>
                <p className="text-muted-foreground mb-8 text-lg">
                  Starten Sie jetzt und erstellen Sie in Minuten strukturierte 
                  Basis-Dokumentation für Ihre SAP BTP Services.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/auth">
                    <Button size="lg" className="nagarro-gradient text-background nagarro-glow h-12 px-8">
                      Kostenlos registrieren
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <a
                    href="https://github.com/SAP-samples/btp-service-metadata/tree/main/v1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="lg" variant="outline" className="h-12 px-8">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      SAP Metadaten
                    </Button>
                  </a>
                </div>
                <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Keine Kreditkarte
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Sofort einsatzbereit
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    DSGVO-konform
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/30 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg nagarro-gradient flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-background" />
              </div>
              <p className="text-sm text-muted-foreground">
                SAP Basis Analyzer • Powered by Perplexity AI
              </p>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              Created by Ernst Eimicke
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
        </div>
      </footer>
    </div>
  );
};

export default Landing;
