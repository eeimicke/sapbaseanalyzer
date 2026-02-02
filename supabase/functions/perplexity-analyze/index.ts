const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface AnalysisRequest {
  serviceName: string;
  serviceDescription: string;
  crawledContent: Array<{
    url: string;
    markdown: string;
    title?: string;
  }>;
  category: 'security' | 'integration' | 'monitoring' | 'lifecycle';
}

const categoryPrompts: Record<string, string> = {
  security: `Du bist ein SAP Basis-Experte. Analysiere die bereitgestellte Dokumentation und erstelle eine strukturierte Analyse für den Bereich "Berechtigungen & Security".

Fokussiere auf:
- Erforderliche Rollen und Berechtigungen
- Security-Konfigurationen
- Authentifizierung und Autorisierung
- Compliance-Anforderungen
- Sicherheitsempfehlungen

Antworte auf Deutsch in strukturiertem Markdown-Format mit klaren Überschriften und Bullet Points.`,

  integration: `Du bist ein SAP Basis-Experte. Analysiere die bereitgestellte Dokumentation und erstelle eine strukturierte Analyse für den Bereich "Integration & Konnektivität".

Fokussiere auf:
- Erforderliche Verbindungen (Destinations, Connectivity)
- API-Integrationen
- Protokolle und Standards
- Netzwerk-Anforderungen
- Abhängigkeiten zu anderen Services

Antworte auf Deutsch in strukturiertem Markdown-Format mit klaren Überschriften und Bullet Points.`,

  monitoring: `Du bist ein SAP Basis-Experte. Analysiere die bereitgestellte Dokumentation und erstelle eine strukturierte Analyse für den Bereich "Monitoring & Operations".

Fokussiere auf:
- Monitoring-Möglichkeiten
- Logging und Tracing
- Alerting-Optionen
- Performance-Metriken
- Troubleshooting-Hinweise

Antworte auf Deutsch in strukturiertem Markdown-Format mit klaren Überschriften und Bullet Points.`,

  lifecycle: `Du bist ein SAP Basis-Experte. Analysiere die bereitgestellte Dokumentation und erstelle eine strukturierte Analyse für den Bereich "Lifecycle Management".

Fokussiere auf:
- Update- und Upgrade-Prozesse
- Backup und Recovery
- Tenant-Management
- Skalierung
- Deprecation-Hinweise

Antworte auf Deutsch in strukturiertem Markdown-Format mit klaren Überschriften und Bullet Points.`,
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { serviceName, serviceDescription, crawledContent, category }: AnalysisRequest = await req.json();

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

    // Combine crawled content into a single context
    const contentContext = crawledContent && crawledContent.length > 0
      ? crawledContent
          .filter(c => c.markdown && c.markdown.length > 0)
          .map(c => `### Quelle: ${c.title || c.url}\n\n${c.markdown.substring(0, 8000)}`)
          .join('\n\n---\n\n')
      : 'Keine gecrawlten Inhalte verfügbar.';

    const userMessage = `Analysiere den SAP BTP Service "${serviceName}".

Beschreibung: ${serviceDescription || 'Keine Beschreibung verfügbar.'}

Dokumentation:
${contentContext.substring(0, 25000)}

Bitte erstelle eine detaillierte Analyse für diesen Service.`;

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
        max_tokens: 2000,
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
