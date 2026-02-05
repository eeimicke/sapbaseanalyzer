import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useServiceInventory } from "@/hooks/use-sap-services";
import { ServiceCard } from "@/components/ServiceCard";
import { type ServiceInventoryItem } from "@/lib/sap-services";
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

const Landing = () => {
  const { isDark, toggleTheme } = useTheme();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<ServiceInventoryItem | null>(null);

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
    {
      icon: Database,
      titleKey: "features.services.title",
      descriptionKey: "features.services.description",
    },
    {
      icon: Bot,
      titleKey: "features.ai.title",
      descriptionKey: "features.ai.description",
    },
    {
      icon: FileText,
      titleKey: "features.export.title",
      descriptionKey: "features.export.description",
    },
    {
      icon: Zap,
      titleKey: "features.realtime.title",
      descriptionKey: "features.realtime.description",
    },
    {
      icon: Shield,
      titleKey: "features.enterprise.title",
      descriptionKey: "features.enterprise.description",
    },
    {
      icon: Globe,
      titleKey: "features.cloud.title",
      descriptionKey: "features.cloud.description",
    },
  ];

  const steps = [
    {
      step: "01",
      titleKey: "workflow.step1.title",
      descriptionKey: "workflow.step1.description",
    },
    {
      step: "02",
      titleKey: "workflow.step2.title",
      descriptionKey: "workflow.step2.description",
    },
    {
      step: "03",
      titleKey: "workflow.step3.title",
      descriptionKey: "workflow.step3.description",
    },
  ];

  // Lade Service-Inventar von GitHub
  const { data: services, isLoading: isLoadingInventory } = useServiceInventory();

  // Lade Services mit hoher Basis-Relevanz aus dem Cache
  const { data: highRelevanceIds, isLoading: isLoadingRelevance } = useQuery({
    queryKey: ["landing-high-relevance-ids"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_relevance_cache")
        .select("service_technical_id")
        .eq("relevance", "hoch")
        .limit(10);
      
      if (error) throw error;
      return new Set((data || []).map(d => d.service_technical_id));
    },
    staleTime: 1000 * 60 * 5,
  });

  // Filtere Services mit hoher Relevanz
  const highRelevanceServices = useMemo(() => {
    if (!services || !highRelevanceIds) return [];
    return services
      .filter(s => highRelevanceIds.has(s.technicalId))
      .slice(0, 10);
  }, [services, highRelevanceIds]);

  const isLoading = isLoadingInventory || isLoadingRelevance;

  // Redirect to auth when selecting service
  const handleServiceSelect = (service: ServiceInventoryItem) => {
    setSelectedService(prev => prev?.technicalId === service.technicalId ? null : service);
  };

  // Redirect to auth for analysis
  const handleProceedToAnalysis = () => {
    navigate("/auth");
  };

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
                <h1 className="text-base sm:text-xl font-semibold tracking-tight truncate">{t("header.title")}</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">{t("header.subtitle")}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
              <LanguageToggle />
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
                {t("header.openSource")}
              </Badge>
              <Link to="/auth" className="hidden sm:block">
                <Button variant="outline" size="sm" className="h-8 text-xs sm:text-sm">
                  {t("header.login")}
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="sm" className="nagarro-gradient text-background nagarro-glow h-8 text-xs sm:text-sm px-2 sm:px-4">
                  <span className="hidden sm:inline">{t("header.start")}</span>
                  <span className="sm:hidden">{t("header.startShort")}</span>
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
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              {t("hero.title1")}
              <span className="block text-primary">{t("hero.title2")}</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("hero.description")}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button size="lg" className="nagarro-gradient text-background nagarro-glow h-12 px-8 text-base">
                  {t("hero.cta")}
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
                  {t("hero.dataSource")}
                </Button>
              </a>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-8 border-t border-border/50 mt-12">
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

      {/* High Relevance Services Preview */}
      <section className="py-16 border-b border-border/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <Badge className="mb-4 bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">
              <CircleCheck className="w-3 h-3 mr-1.5" />
              {t("relevance.badge")}
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              {t("relevance.title")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
              {t("relevance.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 max-w-7xl mx-auto">
            {isLoading ? (
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
            ) : highRelevanceServices.length > 0 ? (
              highRelevanceServices.map((service) => (
                <ServiceCard
                  key={service.technicalId}
                  service={service}
                  isSelected={selectedService?.technicalId === service.technicalId}
                  onSelect={handleServiceSelect}
                  onProceedToAnalysis={handleProceedToAnalysis}
                />
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground py-8">
                <p className="text-sm">{t("relevance.empty")}</p>
              </div>
            )}
          </div>

          {/* Login-Hinweis */}
          <div className="mt-8 p-4 rounded-lg bg-primary/5 border border-primary/20 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">{t("relevance.loginRequired")}</span>{" "}
                {t("relevance.loginDescription")}
              </p>
              <Link to="/auth" className="flex-shrink-0">
                <Button size="sm" className="nagarro-gradient text-background nagarro-glow h-8">
                  {t("relevance.loginButton")}
                </Button>
              </Link>
            </div>
          </div>

          <div className="text-center mt-6">
            <Link to="/auth">
              <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
                {t("relevance.viewAll")}
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
            <Badge variant="outline" className="mb-4">{t("features.badge")}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("features.title")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("features.description")}
            </p>
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

      {/* How it Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">{t("workflow.badge")}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("workflow.title")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("workflow.description")}
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
                    <h3 className="text-xl font-semibold mb-3">{t(step.titleKey)}</h3>
                    <p className="text-muted-foreground text-sm">{t(step.descriptionKey)}</p>
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
                {t("workflow.cta")}
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
                  {t("cta.title")}
                </h2>
                <p className="text-muted-foreground mb-8 text-lg">
                  {t("cta.description")}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/auth">
                    <Button size="lg" className="nagarro-gradient text-background nagarro-glow h-12 px-8">
                      {t("cta.register")}
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
                      {t("cta.metadata")}
                    </Button>
                  </a>
                </div>
                <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    {t("cta.noCard")}
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    {t("cta.instant")}
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    {t("cta.gdpr")}
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
                {t("footer.poweredBy")}
              </p>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
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
        </div>
      </footer>
    </div>
  );
};

export default Landing;
