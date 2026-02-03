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
}

const categoryPrompts: Record<string, string> = {
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

// Format service metadata for the user message in full-basis analysis
function formatServiceContext(
  serviceName: string,
  serviceDescription: string,
  serviceLinks: ServiceLink[],
  servicePlans?: ServicePlanContext[],
  supportComponents?: SupportComponent[],
  githubRepoUrl?: string
): string {
  const sections: string[] = [];

  sections.push(`# SAP BTP Service: ${serviceName}`);
  sections.push(`\n## Beschreibung\n${serviceDescription || 'Keine Beschreibung verfügbar.'}`);

  // Add GitHub source reference
  if (githubRepoUrl) {
    sections.push(`\n## Metadaten-Quelle`);
    sections.push(`Die Service-Metadaten stammen aus dem offiziellen SAP GitHub Repository:`);
    sections.push(`- [Service-Metadaten JSON](${githubRepoUrl})`);
  }

  // Format links by classification (prioritized order)
  if (serviceLinks && serviceLinks.length > 0) {
    sections.push('\n## Dokumentationslinks');
    sections.push('Nutze diese Links als primäre Recherchequellen:');
    
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
    sections.push('\n## Service-Plans');
    for (const plan of servicePlans) {
      const freeTag = plan.isFree ? ' (kostenlos)' : '';
      sections.push(`\n### ${plan.displayName}${freeTag}`);
      if (plan.description) {
        sections.push(plan.description);
      }
      if (plan.regions && plan.regions.length > 0) {
        sections.push(`Verfügbare Regionen: ${plan.regions.join(', ')}`);
      }
    }
  }

  // Format support components
  if (supportComponents && supportComponents.length > 0) {
    sections.push('\n## Support-Komponenten');
    for (const comp of supportComponents) {
      sections.push(`- ${comp.value} (${comp.classification})`);
    }
  }

  sections.push('\n---\nBitte analysiere diesen Service gemäß der Struktur im System-Prompt.');

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
      basePrompt 
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

    // Determine system prompt and user message based on category
    let systemPrompt: string;
    let userMessage: string;
    let maxTokens: number;

    if (category === 'full-basis') {
      // Use the base prompt from DB (passed from frontend) as system prompt
      systemPrompt = basePrompt || 'Du bist ein erfahrener SAP Basis-Administrator. Analysiere den folgenden Service.';
      
      // Format full service context as user message (now includes GitHub link)
      userMessage = formatServiceContext(
        serviceName,
        serviceDescription,
        serviceLinks,
        servicePlans,
        supportComponents,
        githubRepoUrl
      );
      maxTokens = 4000;
    } else if (category === 'quick-summary') {
      systemPrompt = categoryPrompts[category];
      
      const linksContext = serviceLinks && serviceLinks.length > 0
        ? serviceLinks
            .filter(l => l.value?.startsWith('http'))
            .map(l => `- [${l.text || l.classification}](${l.value}) (${l.classification})`)
            .join('\n')
        : 'Keine Links verfügbar.';

      userMessage = `SAP BTP Service: "${serviceName}"
Beschreibung: ${serviceDescription || 'Keine Beschreibung verfügbar.'}
Links: ${linksContext}
Erstelle eine sehr kurze Zusammenfassung.`;
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
        : 'Keine Links verfügbar.';

      userMessage = `Analysiere den SAP BTP Service "${serviceName}".

Beschreibung: ${serviceDescription || 'Keine Beschreibung verfügbar.'}

Relevante Dokumentationslinks:
${linksContext}

Bitte recherchiere im Web nach aktuellen Informationen zu diesem Service und erstelle eine detaillierte Analyse. Nutze die obigen Links als Ausgangspunkt.`;
      maxTokens = 2000;
    }

    console.log(`Analyzing ${serviceName} for category: ${category}`);

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

    const analysisContent = data.choices?.[0]?.message?.content || 'Keine Analyse verfügbar.';
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
