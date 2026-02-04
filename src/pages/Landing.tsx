import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/hooks/useTheme";
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
                <p className="text-xs text-muted-foreground">by Ernst Eimicke</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-lg"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <a
                href="https://www.linkedin.com/in/eeimicke"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <Badge variant="outline" className="text-xs px-3 py-1 border-primary/30 text-primary hidden sm:flex">
                <Github className="w-3 h-3 mr-1" />
                Open Source Data
              </Badge>
              <Link to="/auth">
                <Button variant="outline" size="sm">
                  Anmelden
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="sm" className="nagarro-gradient text-background nagarro-glow">
                  Kostenlos starten
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
