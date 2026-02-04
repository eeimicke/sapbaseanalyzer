const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ServiceLink {
  classification: string;
  text: string;
  value: string;
}

interface ServicePlanContext {
  name: string;
  displayName: string;
  description: string;
  isFree: boolean;
  regions: string[];
}

interface SupportComponent {
  value: string;
  classification: string;
}

interface AnalysisRequest {
  serviceName: string;
  serviceDescription: string;
  serviceLinks: ServiceLink[];
  servicePlans?: ServicePlanContext[];
  supportComponents?: SupportComponent[];
  githubRepoUrl?: string;
  category: 'security' | 'integration' | 'monitoring' | 'lifecycle' | 'quick-summary' | 'full-basis';
  basePrompt?: string;
  language?: 'en' | 'de';
}

// Language-specific prompts
const getCategoryPrompts = (language: 'en' | 'de'): Record<string, string> => {
  if (language === 'en') {
    return {
      security: `You are an SAP Basis expert. Research current information on the web and create a structured analysis for the "Permissions & Security" area for the specified SAP BTP Service.

Focus on:
- Required roles and permissions
- Security configurations
- Authentication and authorization
- Compliance requirements
- Security recommendations

Use the provided links as a starting point for your research.
Respond in English in structured Markdown format with clear headings and bullet points.`,

      integration: `You are an SAP Basis expert. Research current information on the web and create a structured analysis for the "Integration & Connectivity" area for the specified SAP BTP Service.

Focus on:
- Required connections (Destinations, Connectivity)
- API integrations
- Protocols and standards
- Network requirements
- Dependencies on other services

Use the provided links as a starting point for your research.
Respond in English in structured Markdown format with clear headings and bullet points.`,

      monitoring: `You are an SAP Basis expert. Research current information on the web and create a structured analysis for the "Monitoring & Operations" area for the specified SAP BTP Service.

Focus on:
- Monitoring capabilities
- Logging and tracing
- Alerting options
- Performance metrics
- Troubleshooting hints

Use the provided links as a starting point for your research.
Respond in English in structured Markdown format with clear headings and bullet points.`,

      lifecycle: `You are an SAP Basis expert. Research current information on the web and create a structured analysis for the "Lifecycle Management" area for the specified SAP BTP Service.

Focus on:
- Update and upgrade processes
- Backup and recovery
- Tenant management
- Scaling
- Deprecation notices

Use the provided links as a starting point for your research.
Respond in English in structured Markdown format with clear headings and bullet points.`,

      'quick-summary': `You are an SAP expert. Create a very brief summary (max. 2-3 sentences) of the specified SAP BTP Service.

Describe in a maximum of 50 words:
- What the service does
- Who it is intended for

Use the provided links for research. Respond in English, concise and without formatting.`,
    };
  }
  
  // German prompts (default)
  return {
    security: `Du bist ein SAP Basis-Experte. Recherchiere im Web nach aktuellen Informationen und erstelle eine strukturierte Analyse für den Bereich "Berechtigungen & Security" für den angegebenen SAP BTP Service.

Fokussiere auf:
- Erforderliche Rollen und Berechtigungen
- Security-Konfigurationen
- Authentifizierung und Autorisierung
- Compliance-Anforderungen
- Sicherheitsempfehlungen

Nutze die bereitgestellten Links als Ausgangspunkt für deine Recherche.
Antworte auf Deutsch in strukturiertem Markdown-Format mit klaren Überschriften und Bullet Points.`,

    integration: `Du bist ein SAP Basis-Experte. Recherchiere im Web nach aktuellen Informationen und erstelle eine strukturierte Analyse für den Bereich "Integration & Konnektivität" für den angegebenen SAP BTP Service.

Fokussiere auf:
- Erforderliche Verbindungen (Destinations, Connectivity)
- API-Integrationen
- Protokolle und Standards
- Netzwerk-Anforderungen
- Abhängigkeiten zu anderen Services

Nutze die bereitgestellten Links als Ausgangspunkt für deine Recherche.
Antworte auf Deutsch in strukturiertem Markdown-Format mit klaren Überschriften und Bullet Points.`,

    monitoring: `Du bist ein SAP Basis-Experte. Recherchiere im Web nach aktuellen Informationen und erstelle eine strukturierte Analyse für den Bereich "Monitoring & Operations" für den angegebenen SAP BTP Service.

Fokussiere auf:
- Monitoring-Möglichkeiten
- Logging und Tracing
- Alerting-Optionen
- Performance-Metriken
- Troubleshooting-Hinweise

Nutze die bereitgestellten Links als Ausgangspunkt für deine Recherche.
Antworte auf Deutsch in strukturiertem Markdown-Format mit klaren Überschriften und Bullet Points.`,

    lifecycle: `Du bist ein SAP Basis-Experte. Recherchiere im Web nach aktuellen Informationen und erstelle eine strukturierte Analyse für den Bereich "Lifecycle Management" für den angegebenen SAP BTP Service.

Fokussiere auf:
- Update- und Upgrade-Prozesse
- Backup und Recovery
- Tenant-Management
- Skalierung
- Deprecation-Hinweise

Nutze die bereitgestellten Links als Ausgangspunkt für deine Recherche.
Antworte auf Deutsch in strukturiertem Markdown-Format mit klaren Überschriften und Bullet Points.`,

    'quick-summary': `Du bist ein SAP-Experte. Erstelle eine sehr kurze Zusammenfassung (max. 2-3 Sätze) des angegebenen SAP BTP Services.

Beschreibe in maximal 50 Wörtern:
- Was der Service macht
- Für wen er gedacht ist

Nutze die bereitgestellten Links für die Recherche. Antworte auf Deutsch, prägnant und ohne Formatierung.`,
  };
};

// Language-specific labels for service context formatting
const getContextLabels = (language: 'en' | 'de') => {
  if (language === 'en') {
    return {
      description: 'Description',
      noDescription: 'No description available.',
      metadataSource: 'Metadata Source',
      metadataSourceText: 'The service metadata comes from the official SAP GitHub Repository:',
      serviceMetadataJson: 'Service Metadata JSON',
      documentationLinks: 'Documentation Links',
      useLinksText: 'Use these links as primary research sources:',
      servicePlans: 'Service Plans',
      free: '(free)',
      availableRegions: 'Available regions:',
      supportComponents: 'Support Components',
      analyzeInstruction: 'Please analyze this service according to the structure in the system prompt.',
      noLinksAvailable: 'No links available.',
      analyzeService: 'Analyze the SAP BTP Service',
      relevantLinks: 'Relevant Documentation Links:',
      researchInstruction: 'Please research current information about this service on the web and create a detailed analysis. Use the above links as a starting point.',
      createSummary: 'Create a very brief summary.',
    };
  }
  return {
    description: 'Beschreibung',
    noDescription: 'Keine Beschreibung verfügbar.',
    metadataSource: 'Metadaten-Quelle',
    metadataSourceText: 'Die Service-Metadaten stammen aus dem offiziellen SAP GitHub Repository:',
    serviceMetadataJson: 'Service-Metadaten JSON',
    documentationLinks: 'Dokumentationslinks',
    useLinksText: 'Nutze diese Links als primäre Recherchequellen:',
    servicePlans: 'Service-Plans',
    free: '(kostenlos)',
    availableRegions: 'Verfügbare Regionen:',
    supportComponents: 'Support-Komponenten',
    analyzeInstruction: 'Bitte analysiere diesen Service gemäß der Struktur im System-Prompt.',
    noLinksAvailable: 'Keine Links verfügbar.',
    analyzeService: 'Analysiere den SAP BTP Service',
    relevantLinks: 'Relevante Dokumentationslinks:',
    researchInstruction: 'Bitte recherchiere im Web nach aktuellen Informationen zu diesem Service und erstelle eine detaillierte Analyse. Nutze die obigen Links als Ausgangspunkt.',
    createSummary: 'Erstelle eine sehr kurze Zusammenfassung.',
  };
};

// Format service metadata for the user message in full-basis analysis
function formatServiceContext(
  serviceName: string,
  serviceDescription: string,
  serviceLinks: ServiceLink[],
  servicePlans: ServicePlanContext[] | undefined,
  supportComponents: SupportComponent[] | undefined,
  githubRepoUrl: string | undefined,
  language: 'en' | 'de'
): string {
  const labels = getContextLabels(language);
  const sections: string[] = [];

  sections.push(`# SAP BTP Service: ${serviceName}`);
  sections.push(`\n## ${labels.description}\n${serviceDescription || labels.noDescription}`);

  // Add GitHub source reference
  if (githubRepoUrl) {
    sections.push(`\n## ${labels.metadataSource}`);
    sections.push(labels.metadataSourceText);
    sections.push(`- [${labels.serviceMetadataJson}](${githubRepoUrl})`);
  }

  // Format links by classification (prioritized order)
  if (serviceLinks && serviceLinks.length > 0) {
    sections.push(`\n## ${labels.documentationLinks}`);
    sections.push(labels.useLinksText);
    
    const linksByClass: Record<string, ServiceLink[]> = {};
    for (const link of serviceLinks) {
      const cls = link.classification || 'Other';
      if (!linksByClass[cls]) linksByClass[cls] = [];
      linksByClass[cls].push(link);
    }
    
    // Priority order for classifications
    const priorityOrder = ['Discovery Center', 'Documentation', 'SAP Help Portal', 'Tutorial', 'API Hub', 'Support'];
    const sortedClasses = Object.keys(linksByClass).sort((a, b) => {
      const idxA = priorityOrder.indexOf(a);
      const idxB = priorityOrder.indexOf(b);
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });
    
    for (const cls of sortedClasses) {
      const links = linksByClass[cls];
      sections.push(`\n### ${cls}`);
      for (const link of links) {
        sections.push(`- [${link.text}](${link.value})`);
      }
    }
  }

  // Format service plans
  if (servicePlans && servicePlans.length > 0) {
    sections.push(`\n## ${labels.servicePlans}`);
    for (const plan of servicePlans) {
      const freeTag = plan.isFree ? ` ${labels.free}` : '';
      sections.push(`\n### ${plan.displayName}${freeTag}`);
      if (plan.description) {
        sections.push(plan.description);
      }
      if (plan.regions && plan.regions.length > 0) {
        sections.push(`${labels.availableRegions} ${plan.regions.join(', ')}`);
      }
    }
  }

  // Format support components
  if (supportComponents && supportComponents.length > 0) {
    sections.push(`\n## ${labels.supportComponents}`);
    for (const comp of supportComponents) {
      sections.push(`- ${comp.value} (${comp.classification})`);
    }
  }

  sections.push(`\n---\n${labels.analyzeInstruction}`);

  return sections.join('\n');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      serviceName, 
      serviceDescription, 
      serviceLinks, 
      servicePlans,
      supportComponents,
      githubRepoUrl,
      category,
      basePrompt,
      language = 'en'
    }: AnalysisRequest = await req.json();

    if (!serviceName || !category) {
      return new Response(
        JSON.stringify({ success: false, error: 'serviceName and category are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!apiKey) {
      console.error('PERPLEXITY_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Perplexity connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get language-specific prompts
    const categoryPrompts = getCategoryPrompts(language);
    const labels = getContextLabels(language);

    // Determine system prompt and user message based on category
    let systemPrompt: string;
    let userMessage: string;
    let maxTokens: number;

    if (category === 'full-basis') {
      // Use the base prompt from DB (passed from frontend) as system prompt
      // Add language instruction to ensure response is in the correct language
      const languageInstruction = language === 'en' 
        ? '\n\nIMPORTANT: Respond entirely in English.'
        : '\n\nWICHTIG: Antworte komplett auf Deutsch.';
      
      systemPrompt = (basePrompt || (language === 'en' 
        ? 'You are an experienced SAP Basis Administrator. Analyze the following service.'
        : 'Du bist ein erfahrener SAP Basis-Administrator. Analysiere den folgenden Service.')) + languageInstruction;
      
      // Format full service context as user message
      userMessage = formatServiceContext(
        serviceName,
        serviceDescription,
        serviceLinks,
        servicePlans,
        supportComponents,
        githubRepoUrl,
        language
      );
      maxTokens = 4000;
    } else if (category === 'quick-summary') {
      systemPrompt = categoryPrompts[category];
      
      const linksContext = serviceLinks && serviceLinks.length > 0
        ? serviceLinks
            .filter(l => l.value?.startsWith('http'))
            .map(l => `- [${l.text || l.classification}](${l.value}) (${l.classification})`)
            .join('\n')
        : labels.noLinksAvailable;

      userMessage = `SAP BTP Service: "${serviceName}"
${labels.description}: ${serviceDescription || labels.noDescription}
Links: ${linksContext}
${labels.createSummary}`;
      maxTokens = 150;
    } else {
      systemPrompt = categoryPrompts[category];
      if (!systemPrompt) {
        return new Response(
          JSON.stringify({ success: false, error: `Invalid category: ${category}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const linksContext = serviceLinks && serviceLinks.length > 0
        ? serviceLinks
            .filter(l => l.value?.startsWith('http'))
            .map(l => `- [${l.text || l.classification}](${l.value}) (${l.classification})`)
            .join('\n')
        : labels.noLinksAvailable;

      userMessage = `${labels.analyzeService} "${serviceName}".

${labels.description}: ${serviceDescription || labels.noDescription}

${labels.relevantLinks}
${linksContext}

${labels.researchInstruction}`;
      maxTokens = 2000;
    }

    console.log(`Analyzing ${serviceName} for category: ${category} in language: ${language}`);

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: maxTokens,
        temperature: 0.3,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Perplexity API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.error?.message || `Request failed with status ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const analysisContent = data.choices?.[0]?.message?.content || (language === 'en' ? 'No analysis available.' : 'Keine Analyse verfügbar.');
    const citations = data.citations || [];

    console.log(`Analysis complete for ${category}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          category,
          content: analysisContent,
          citations,
          model: data.model,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error analyzing:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
