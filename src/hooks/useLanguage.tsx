import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "de";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Header
    "header.title": "SAP Basis Analyzer",
    "header.subtitle": "by Ernst Eimicke",
    "header.login": "Sign In",
    "header.start": "Get Started Free",
    "header.startShort": "Start",
    "header.openSource": "Open Source Data",
    
    // Hero Section
    "hero.badge": "Powered by Perplexity AI",
    "hero.title1": "SAP BTP Services",
    "hero.title2": "intelligently analyzed",
    "hero.description": "Analyze over 589 SAP BTP Services with AI support and create structured base documentation for your team.",
    "hero.cta": "Get Started",
    "hero.dataSource": "View Data Source",
    "hero.stat1": "SAP BTP Services",
    "hero.stat2": "Powered Analysis",
    "hero.stat3": "Cloud-Native",
    
    // High Relevance Section
    "relevance.badge": "High Basis Relevance",
    "relevance.title": "Services for SAP Basis Administrators",
    "relevance.description": "These services have been classified by our AI as particularly relevant for SAP Basis tasks.",
    "relevance.empty": "Start the app to classify services",
    "relevance.viewAll": "View all Basis-relevant services",
    "relevance.loginRequired": "Login required:",
    "relevance.loginDescription": "For the full AI analysis, Perplexity integration, and Confluence export, a free registration is required.",
    "relevance.loginButton": "Sign In",
    
    // Features Section
    "features.badge": "Features",
    "features.title": "Everything you need",
    "features.description": "SAP Basis Analyzer combines current SAP metadata with advanced AI analysis for optimal results.",
    "features.services.title": "589+ SAP BTP Services",
    "features.services.description": "Access the complete SAP BTP service catalog directly from the official GitHub repository.",
    "features.ai.title": "AI-Powered Analysis",
    "features.ai.description": "Perplexity AI analyzes services and provides structured base documentation.",
    "features.export.title": "Wiki Export",
    "features.export.description": "Export analyses as Confluence Wiki or Markdown for your documentation.",
    "features.realtime.title": "Real-Time Data",
    "features.realtime.description": "Always up-to-date service metadata directly from SAP-samples/btp-service-metadata.",
    "features.enterprise.title": "Enterprise-Ready",
    "features.enterprise.description": "Secure authentication and privacy-compliant processing of your analyses.",
    "features.cloud.title": "Cloud-Native",
    "features.cloud.description": "Fully hosted in the cloud, available anytime and anywhere.",
    
    // Workflow Section
    "workflow.badge": "Workflow",
    "workflow.title": "Documentation in 3 Steps",
    "workflow.description": "Simple workflow for fast and precise service analyses.",
    "workflow.step1.title": "Select Service",
    "workflow.step1.description": "Choose from over 589 SAP BTP services the desired service for analysis.",
    "workflow.step2.title": "Start AI Analysis",
    "workflow.step2.description": "Our AI analyzes the service and creates structured base documentation.",
    "workflow.step3.title": "Export",
    "workflow.step3.description": "Export results as Confluence Wiki or Markdown to your documentation.",
    "workflow.cta": "Try it free now",
    
    // CTA Section
    "cta.title": "Ready for more efficient SAP documentation?",
    "cta.description": "Start now and create structured base documentation for your SAP BTP services in minutes.",
    "cta.register": "Register for free",
    "cta.metadata": "SAP Metadata",
    "cta.noCard": "No credit card",
    "cta.instant": "Instant access",
    "cta.gdpr": "GDPR compliant",
    
    // Footer
    "footer.poweredBy": "SAP Basis Analyzer • Powered by Perplexity AI",
    "footer.createdBy": "Created by Ernst Eimicke",
    
    // Auth Page
    "auth.welcome": "Welcome",
    "auth.welcomeBack": "Welcome back",
    "auth.createAccount": "Create your free account to get started.",
    "auth.signInToContinue": "Sign in to continue.",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.signIn": "Sign In",
    "auth.signUp": "Sign Up",
    "auth.signingIn": "Signing in...",
    "auth.signingUp": "Signing up...",
    "auth.noAccount": "Don't have an account?",
    "auth.hasAccount": "Already have an account?",
    "auth.backToLanding": "Back to homepage",
    "auth.checkEmail": "Check your email",
    "auth.confirmationSent": "We have sent you a confirmation link to",
    "auth.confirmToContinue": "Please confirm your email address to continue.",
    "auth.backToSignIn": "Back to sign in",
    
    // App/Index Page
    "app.title": "SAP Basis Analyzer",
    "app.logout": "Logout",
    "app.selectService": "Select Service",
    "app.searchPlaceholder": "Search services...",
    "app.allCategories": "All",
    "app.loadingServices": "Loading services...",
    "app.noResults": "No services found for",
    "app.tryDifferent": "Try a different search term or category.",
    "app.servicesFound": "services found",
    "app.selectedService": "Selected Service",
    "app.noServiceSelected": "No service selected",
    "app.selectFromList": "Select a service from the list to view details.",
    "app.category": "Category",
    "app.viewOnGithub": "View on GitHub",
    "app.startAnalysis": "Start Basis Analysis",
    "app.analyzing": "Analyzing...",
    "app.basisAnalysis": "Basis Analysis",
    "app.exportConfluence": "Export as Confluence-Wiki",
    "app.exportMarkdown": "Export as Markdown",
    "app.analysisResult": "Analysis Result",
    
    // Service Card
    "serviceCard.proceedToAnalysis": "Proceed to Basis Analysis",
    "serviceCard.viewOnGithub": "View on GitHub",
    
    // Relevance Badge
    "relevanceBadge.high": "High",
    "relevanceBadge.medium": "Medium",
    "relevanceBadge.low": "Low",
    "relevanceBadge.classifying": "Classifying...",
    "relevanceBadge.basisRelevance": "Basis Relevance",
    "relevanceBadge.reclassify": "Reclassify",
    "relevanceBadge.reclassifying": "Reclassifying...",
  },
  de: {
    // Header
    "header.title": "SAP Basis Analyzer",
    "header.subtitle": "by Ernst Eimicke",
    "header.login": "Anmelden",
    "header.start": "Kostenlos starten",
    "header.startShort": "Start",
    "header.openSource": "Open Source Data",
    
    // Hero Section
    "hero.badge": "Powered by Perplexity AI",
    "hero.title1": "SAP BTP Services",
    "hero.title2": "intelligent analysiert",
    "hero.description": "Analysieren Sie über 589 SAP BTP Services mit KI-Unterstützung und erstellen Sie strukturierte Basis-Dokumentation für Ihr Team.",
    "hero.cta": "Jetzt starten",
    "hero.dataSource": "Datenquelle ansehen",
    "hero.stat1": "SAP BTP Services",
    "hero.stat2": "Powered Analysis",
    "hero.stat3": "Cloud-Native",
    
    // High Relevance Section
    "relevance.badge": "Hohe Basis-Relevanz",
    "relevance.title": "Services für SAP Basis-Administratoren",
    "relevance.description": "Diese Services wurden von unserer KI als besonders relevant für SAP Basis-Aufgaben klassifiziert.",
    "relevance.empty": "Starte die App um Services zu klassifizieren",
    "relevance.viewAll": "Alle Basis-relevanten Services ansehen",
    "relevance.loginRequired": "Anmeldung erforderlich:",
    "relevance.loginDescription": "Für die vollständige KI-Analyse, Perplexity-Integration und den Export nach Confluence ist eine kostenlose Registrierung notwendig.",
    "relevance.loginButton": "Anmelden",
    
    // Features Section
    "features.badge": "Features",
    "features.title": "Alles was Sie brauchen",
    "features.description": "Der SAP Basis Analyzer kombiniert aktuelle SAP-Metadaten mit fortschrittlicher KI-Analyse für optimale Ergebnisse.",
    "features.services.title": "589+ SAP BTP Services",
    "features.services.description": "Zugriff auf den kompletten SAP BTP Service-Katalog direkt vom offiziellen GitHub Repository.",
    "features.ai.title": "KI-gestützte Analyse",
    "features.ai.description": "Perplexity AI analysiert Services und liefert strukturierte Basis-Dokumentation.",
    "features.export.title": "Wiki-Export",
    "features.export.description": "Exportieren Sie Analysen als Confluence-Wiki oder Markdown für Ihre Dokumentation.",
    "features.realtime.title": "Echtzeit-Daten",
    "features.realtime.description": "Immer aktuelle Service-Metadaten direkt von SAP-samples/btp-service-metadata.",
    "features.enterprise.title": "Enterprise-Ready",
    "features.enterprise.description": "Sichere Authentifizierung und datenschutzkonforme Verarbeitung Ihrer Analysen.",
    "features.cloud.title": "Cloud-Native",
    "features.cloud.description": "Vollständig in der Cloud gehostet, jederzeit und überall verfügbar.",
    
    // Workflow Section
    "workflow.badge": "Workflow",
    "workflow.title": "In 3 Schritten zur Dokumentation",
    "workflow.description": "Einfacher Workflow für schnelle und präzise Service-Analysen.",
    "workflow.step1.title": "Service auswählen",
    "workflow.step1.description": "Wählen Sie aus über 589 SAP BTP Services den gewünschten Service für die Analyse.",
    "workflow.step2.title": "KI-Analyse starten",
    "workflow.step2.description": "Unsere KI analysiert den Service und erstellt eine strukturierte Basis-Dokumentation.",
    "workflow.step3.title": "Exportieren",
    "workflow.step3.description": "Exportieren Sie die Ergebnisse als Confluence-Wiki oder Markdown in Ihre Dokumentation.",
    "workflow.cta": "Jetzt kostenlos testen",
    
    // CTA Section
    "cta.title": "Bereit für effizientere SAP-Dokumentation?",
    "cta.description": "Starten Sie jetzt und erstellen Sie in Minuten strukturierte Basis-Dokumentation für Ihre SAP BTP Services.",
    "cta.register": "Kostenlos registrieren",
    "cta.metadata": "SAP Metadaten",
    "cta.noCard": "Keine Kreditkarte",
    "cta.instant": "Sofort einsatzbereit",
    "cta.gdpr": "DSGVO-konform",
    
    // Footer
    "footer.poweredBy": "SAP Basis Analyzer • Powered by Perplexity AI",
    "footer.createdBy": "Created by Ernst Eimicke",
    
    // Auth Page
    "auth.welcome": "Willkommen",
    "auth.welcomeBack": "Willkommen zurück",
    "auth.createAccount": "Erstellen Sie Ihr kostenloses Konto um zu starten.",
    "auth.signInToContinue": "Melden Sie sich an um fortzufahren.",
    "auth.email": "E-Mail",
    "auth.password": "Passwort",
    "auth.signIn": "Anmelden",
    "auth.signUp": "Registrieren",
    "auth.signingIn": "Wird angemeldet...",
    "auth.signingUp": "Wird registriert...",
    "auth.noAccount": "Noch kein Konto?",
    "auth.hasAccount": "Bereits ein Konto?",
    "auth.backToLanding": "Zurück zur Startseite",
    "auth.checkEmail": "Prüfen Sie Ihre E-Mail",
    "auth.confirmationSent": "Wir haben Ihnen einen Bestätigungslink gesendet an",
    "auth.confirmToContinue": "Bitte bestätigen Sie Ihre E-Mail-Adresse um fortzufahren.",
    "auth.backToSignIn": "Zurück zur Anmeldung",
    
    // App/Index Page
    "app.title": "SAP Basis Analyzer",
    "app.logout": "Abmelden",
    "app.selectService": "Service auswählen",
    "app.searchPlaceholder": "Services durchsuchen...",
    "app.allCategories": "Alle",
    "app.loadingServices": "Lade Services...",
    "app.noResults": "Keine Services gefunden für",
    "app.tryDifferent": "Versuchen Sie einen anderen Suchbegriff oder eine andere Kategorie.",
    "app.servicesFound": "Services gefunden",
    "app.selectedService": "Ausgewählter Service",
    "app.noServiceSelected": "Kein Service ausgewählt",
    "app.selectFromList": "Wählen Sie einen Service aus der Liste um Details anzuzeigen.",
    "app.category": "Kategorie",
    "app.viewOnGithub": "Auf GitHub ansehen",
    "app.startAnalysis": "Basis-Analyse starten",
    "app.analyzing": "Analysiert...",
    "app.basisAnalysis": "Basis-Analyse",
    "app.exportConfluence": "Als Confluence-Wiki exportieren",
    "app.exportMarkdown": "Als Markdown exportieren",
    "app.analysisResult": "Analyseergebnis",
    
    // Service Card
    "serviceCard.proceedToAnalysis": "An Basis-Analyse übergeben",
    "serviceCard.viewOnGithub": "Auf GitHub ansehen",
    
    // Relevance Badge
    "relevanceBadge.high": "Hoch",
    "relevanceBadge.medium": "Mittel",
    "relevanceBadge.low": "Niedrig",
    "relevanceBadge.classifying": "Klassifiziert...",
    "relevanceBadge.basisRelevance": "Basis-Relevanz",
    "relevanceBadge.reclassify": "Neu klassifizieren",
    "relevanceBadge.reclassifying": "Klassifiziert neu...",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "en"; // Default to English
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations["en"]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
