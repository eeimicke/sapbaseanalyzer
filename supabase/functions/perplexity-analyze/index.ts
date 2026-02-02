const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ServiceLink {
  classification: string;
  text: string;
  value: string;
}

interface AnalysisRequest {
  serviceName: string;
  serviceDescription: string;
  serviceLinks: ServiceLink[];
  category: 'security' | 'integration' | 'monitoring' | 'lifecycle' | 'quick-summary';
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { serviceName, serviceDescription, serviceLinks, category }: AnalysisRequest = await req.json();

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

    const systemPrompt = categoryPrompts[category];
    if (!systemPrompt) {
      return new Response(
        JSON.stringify({ success: false, error: `Invalid category: ${category}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format service links as context
    const linksContext = serviceLinks && serviceLinks.length > 0
      ? serviceLinks
          .filter(l => l.value?.startsWith('http'))
          .map(l => `- [${l.text || l.classification}](${l.value}) (${l.classification})`)
          .join('\n')
      : 'Keine Links verfügbar.';

    const isQuickSummary = category === 'quick-summary';
    
    const userMessage = isQuickSummary
      ? `SAP BTP Service: "${serviceName}"
Beschreibung: ${serviceDescription || 'Keine Beschreibung verfügbar.'}
Links: ${linksContext}
Erstelle eine sehr kurze Zusammenfassung.`
      : `Analysiere den SAP BTP Service "${serviceName}".

Beschreibung: ${serviceDescription || 'Keine Beschreibung verfügbar.'}

Relevante Dokumentationslinks:
${linksContext}

Bitte recherchiere im Web nach aktuellen Informationen zu diesem Service und erstelle eine detaillierte Analyse. Nutze die obigen Links als Ausgangspunkt.`;

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
        max_tokens: isQuickSummary ? 150 : 2000,
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
