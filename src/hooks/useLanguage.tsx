// Language Provider for i18n support
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
    "header.title": "SAP BTP Basis Analyzer",
    "header.subtitle": "by Ernst Eimicke",
    "header.login": "Sign In",
    "header.start": "Get Started Free",
    "header.startShort": "Start",
    "header.openSource": "Open Source Data",
    "header.liveApi": "Live API",
    "header.logout": "Logout",
    
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
    "relevance.basisRelevance": "Basis Relevance",
    
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
    "footer.poweredBy": "SAP BTP Basis Analyzer • Powered by Perplexity AI",
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
    
    // App/Index Page - Steps
    "app.step1.title": "Select Service",
    "app.step1.description": "Choose SAP BTP Service",
    "app.step2.title": "Basis Analysis",
    "app.step2.description": "AI Analysis",
    "app.step3.title": "Summary",
    "app.step3.description": "Wiki Export",
    
    // App/Index Page - Step 1
    "app.selectServiceTitle": "Select SAP BTP Service",
    "app.selectServiceDescription": "Choose a service for Basis analysis",
    "app.loadingServices": "Loading services...",
    "app.loadError": "Error loading",
    "app.servicesFromGithub": "Services from SAP GitHub Repository",
    "app.searchPlaceholder": "Search services...",
    "app.all": "All",
    "app.basisRelevance": "Basis Relevance:",
    "app.high": "High",
    "app.medium": "Medium",
    "app.low": "Low",
    "app.errorLoadingServices": "Error loading services",
    "app.retry": "Retry",
    "app.noServicesFound": "No services found",
    "app.tryDifferentSearch": "Try a different search term or select another category.",
    
    // App/Index Page - Step 2
    "app.basisAnalysis": "SAP Basis Analysis",
    "app.perplexityResearching": "Perplexity AI is researching the web for",
    "app.analysisPrompt": "Analysis Prompt",
    "app.lastUpdated": "Last updated",
    "app.promptDescription": "This prompt is used for AI analysis. Click to edit.",
    "app.characters": "characters",
    "app.reset": "Reset",
    "app.save": "Save",
    "app.serviceContext": "Service Context (from metadata)",
    "app.contextDescription": "This information is automatically passed to the AI.",
    "app.fullBasisAnalysis": "Full Basis Analysis",
    "app.aiAnalysisDescription": "AI-powered analysis based on Basis prompt and all service metadata",
    "app.perplexitySearching": "Perplexity AI is researching the web...",
    "app.error": "Error",
    "app.analysisStarting": "Analysis is starting...",
    "app.documentationLinks": "documentation links as research context",
    "app.back": "Back",
    "app.toSummary": "To Summary",
    "app.analysisRunning": "Analysis running...",
    "app.analysisComplete": "Analysis complete",
    "app.analysisCompleteDesc": "The full Basis analysis was successfully completed.",
    "app.analysisError": "Analysis Error",
    "app.unknownError": "Unknown error",
    "app.promptMissing": "Basis prompt missing",
    "app.promptMissingDesc": "The analysis prompt could not be loaded from the database.",
    "app.fullBasisAnalysisRunning": "Perplexity AI is performing full Basis analysis...",
    "app.completed": "completed",
    
    // App/Index Page - Step 3
    "app.summary": "Summary",
    "app.summaryForExport": "Summary for Wiki export",
    "app.serviceOverview": "Service Overview",
    "app.serviceName": "Service Name",
    "app.technicalId": "Technical ID",
    "app.description": "Description",
    "app.noDescription": "No description available",
    "app.category": "Category",
    "app.servicePlans": "Service Plans",
    "app.available": "available",
    "app.documentationLinksLabel": "Documentation Links",
    "app.basisAnalysisFindings": "Basis Analysis Findings",
    "app.aiAnalysisFrom": "AI-powered analysis from",
    "app.sourcesUsed": "Sources used",
    "app.analyzedWith": "Analyzed with",
    "app.wikiExport": "Wiki Export",
    "app.exportDescription": "Export the summary for Confluence or other wikis",
    "app.confluenceXhtml": "Confluence XHTML",
    "app.markdown": "Markdown",
    "app.copy": "Copy",
    "app.exportSuccess": "Export successful",
    "app.confluenceDownloaded": "Confluence XHTML file was downloaded.",
    "app.markdownDownloaded": "Markdown file was downloaded.",
    "app.copiedToClipboard": "Copied to clipboard",
    "app.analysisTextCopied": "The analysis text was copied to the clipboard.",
    "app.copyFailed": "Copy failed",
    "app.tryAgain": "Please try again.",
    "app.startNewAnalysis": "Start New Analysis",
    "app.sources": "Sources",
    "app.more": "more",
    "app.model": "Model",
    
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
    "header.title": "SAP BTP Basis Analyzer",
    "header.subtitle": "by Ernst Eimicke",
    "header.login": "Anmelden",
    "header.start": "Kostenlos starten",
    "header.startShort": "Start",
    "header.openSource": "Open Source Data",
    "header.liveApi": "Live API",
    "header.logout": "Abmelden",
    
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
    "relevance.basisRelevance": "Basis-Relevanz",
    
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
    "footer.poweredBy": "SAP BTP Basis Analyzer • Powered by Perplexity AI",
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
    
    // App/Index Page - Steps
    "app.step1.title": "Service auswählen",
    "app.step1.description": "SAP BTP Service wählen",
    "app.step2.title": "Basis-Analyse",
    "app.step2.description": "KI-Analyse",
    "app.step3.title": "Summary",
    "app.step3.description": "Wiki-Export",
    
    // App/Index Page - Step 1
    "app.selectServiceTitle": "SAP BTP Service auswählen",
    "app.selectServiceDescription": "Wählen Sie einen Service für die Basis-Analyse",
    "app.loadingServices": "Lade Services...",
    "app.loadError": "Fehler beim Laden",
    "app.servicesFromGithub": "Services vom SAP GitHub Repository",
    "app.searchPlaceholder": "Services durchsuchen...",
    "app.all": "Alle",
    "app.basisRelevance": "Basis-Relevanz:",
    "app.high": "Hoch",
    "app.medium": "Mittel",
    "app.low": "Niedrig",
    "app.errorLoadingServices": "Fehler beim Laden der Services",
    "app.retry": "Erneut versuchen",
    "app.noServicesFound": "Keine Services gefunden",
    "app.tryDifferentSearch": "Versuchen Sie einen anderen Suchbegriff oder wählen Sie eine andere Kategorie.",
    
    // App/Index Page - Step 2
    "app.basisAnalysis": "SAP Basis-Analyse",
    "app.perplexityResearching": "Perplexity AI recherchiert im Web für",
    "app.analysisPrompt": "Analyse-Prompt",
    "app.lastUpdated": "Zuletzt aktualisiert",
    "app.promptDescription": "Dieser Prompt wird für die KI-Analyse verwendet. Klicken zum Bearbeiten.",
    "app.characters": "Zeichen",
    "app.reset": "Zurücksetzen",
    "app.save": "Speichern",
    "app.serviceContext": "Service-Kontext (aus Metadaten)",
    "app.contextDescription": "Diese Informationen werden automatisch an die KI übergeben.",
    "app.fullBasisAnalysis": "Vollständige Basis-Analyse",
    "app.aiAnalysisDescription": "KI-gestützte Analyse basierend auf dem Basis-Prompt und allen Service-Metadaten",
    "app.perplexitySearching": "Perplexity AI recherchiert im Web...",
    "app.error": "Fehler",
    "app.analysisStarting": "Analyse wird gestartet...",
    "app.documentationLinks": "Dokumentationslinks als Recherchekontext",
    "app.back": "Zurück",
    "app.toSummary": "Zur Summary",
    "app.analysisRunning": "Analyse läuft...",
    "app.analysisComplete": "Analyse abgeschlossen",
    "app.analysisCompleteDesc": "Die vollständige Basis-Analyse wurde erfolgreich durchgeführt.",
    "app.analysisError": "Analyse Fehler",
    "app.unknownError": "Unbekannter Fehler",
    "app.promptMissing": "Basis-Prompt fehlt",
    "app.promptMissingDesc": "Der Analyse-Prompt konnte nicht aus der Datenbank geladen werden.",
    "app.fullBasisAnalysisRunning": "Perplexity AI führt vollständige Basis-Analyse durch...",
    "app.completed": "abgeschlossen",
    
    // App/Index Page - Step 3
    "app.summary": "Summary",
    "app.summaryForExport": "Zusammenfassung für Wiki-Export",
    "app.serviceOverview": "Service-Überblick",
    "app.serviceName": "Service Name",
    "app.technicalId": "Technische ID",
    "app.description": "Beschreibung",
    "app.noDescription": "Keine Beschreibung verfügbar",
    "app.category": "Kategorie",
    "app.servicePlans": "Service Plans",
    "app.available": "verfügbar",
    "app.documentationLinksLabel": "Dokumentationslinks",
    "app.basisAnalysisFindings": "Basis-Analyse Findings",
    "app.aiAnalysisFrom": "KI-gestützte Analyse vom",
    "app.sourcesUsed": "Verwendete Quellen",
    "app.analyzedWith": "Analysiert mit",
    "app.wikiExport": "Wiki-Export",
    "app.exportDescription": "Exportiere die Zusammenfassung für Confluence oder andere Wikis",
    "app.confluenceXhtml": "Confluence XHTML",
    "app.markdown": "Markdown",
    "app.copy": "Kopieren",
    "app.exportSuccess": "Export erfolgreich",
    "app.confluenceDownloaded": "Confluence XHTML-Datei wurde heruntergeladen.",
    "app.markdownDownloaded": "Markdown-Datei wurde heruntergeladen.",
    "app.copiedToClipboard": "In Zwischenablage kopiert",
    "app.analysisTextCopied": "Der Analyse-Text wurde in die Zwischenablage kopiert.",
    "app.copyFailed": "Kopieren fehlgeschlagen",
    "app.tryAgain": "Bitte versuchen Sie es erneut.",
    "app.startNewAnalysis": "Neue Analyse starten",
    "app.sources": "Quellen",
    "app.more": "mehr",
    "app.model": "Modell",
    
    // Service Card
    "serviceCard.proceedToAnalysis": "Basis Analyse starten",
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
