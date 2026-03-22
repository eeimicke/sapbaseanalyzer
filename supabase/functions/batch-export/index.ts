import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const GITHUB_BASE = 'https://raw.githubusercontent.com/SAP-samples/btp-service-metadata/main/v1';
const BATCH_SIZE = 3; // Process 3 services per invocation to avoid timeout

// Default German basis prompt
const DEFAULT_PROMPT = `Du bist ein erfahrener SAP Basis-Administrator mit tiefem Verständnis für SAP BTP.
Analysiere den bereitgestellten SAP BTP Service aus Basis-Perspektive und erstelle eine strukturierte Zusammenfassung.

### 1. Service-Überblick
### 2. Basis-Verantwortlichkeiten
### 3. Security und IAM
### 4. Integration und Konnektivität
### 5. Monitoring und Operations
### 6. Lifecycle Management
### 7. Nicht-Basis-Themen
### 8. Referenzen

Antworte auf Deutsch in strukturiertem Markdown-Format.`;

const DEFAULT_PROMPT_EN = `You are an experienced SAP Basis Administrator with deep understanding of SAP BTP.
Analyze the provided SAP BTP Service from a Basis perspective and create a structured summary.

### 1. Service Overview
### 2. Basis Responsibilities
### 3. Security and IAM
### 4. Integration and Connectivity
### 5. Monitoring and Operations
### 6. Lifecycle Management
### 7. Non-Basis Topics
### 8. References

Respond in English in structured Markdown format.`;

function getSupabaseAdmin() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
}

async function fetchServiceDetails(fileName: string) {
  const url = `${GITHUB_BASE}/developer/${fileName}.json`;
  const resp = await fetch(url);
  if (!resp.ok) return null;
  return await resp.json();
}

async function analyzeService(
  serviceName: string,
  serviceDescription: string,
  serviceDetails: any,
  prompt: string,
  fileName: string,
  language: string
) {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey) throw new Error('LOVABLE_API_KEY not configured');

  // Build context
  const links = (serviceDetails?.links || [])
    .filter((l: any) => l.value?.startsWith('http'))
    .map((l: any) => `- [${l.text || l.classification || 'Link'}](${l.value})`)
    .join('\n');

  const plans = (serviceDetails?.servicePlans || [])
    .map((p: any) => `- ${p.displayName}: ${p.description || 'N/A'}`)
    .join('\n');

  const githubUrl = `https://github.com/SAP-samples/btp-service-metadata/blob/main/v1/developer/${fileName}.json`;

  const userMessage = `# SAP BTP Service: ${serviceName}

## Beschreibung
${serviceDescription || 'Keine Beschreibung verfügbar.'}

## Metadaten-Quelle
${githubUrl}

## Dokumentationslinks
${links || 'Keine Links verfügbar.'}

## Service-Plans
${plans || 'Keine Plans verfügbar.'}

---
Bitte analysiere diesen Service gemäß der Struktur im System-Prompt.`;

  const sapDomainFilter = [
    'help.sap.com', 'community.sap.com', 'blogs.sap.com',
    'discovery-center.cloud.sap', 'api.sap.com', 'support.sap.com',
  ];

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 4000,
      temperature: 0.3,
      search_domain_filter: sapDomainFilter,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || `Perplexity API error: ${response.status}`);
  }

  const content = data.choices?.[0]?.message?.content || 'Keine Analyse verfügbar.';
  const citations = data.citations || [];

  // Format as markdown with header and citations
  let markdown = `# SAP Basis-Analyse: ${serviceName}\n\n`;
  markdown += `> **Kategorie:** ${serviceDetails?.category || 'N/A'}  \n`;
  markdown += `> **Analyse-Datum:** ${new Date().toLocaleDateString('de-DE')}  \n`;
  markdown += `> **KI-Modell:** ${data.model || 'sonar'}\n\n---\n\n`;
  markdown += content;

  if (citations.length > 0) {
    markdown += '\n\n---\n\n## Quellen\n\n';
    markdown += citations.map((url: string) => `- ${url}`).join('\n');
  }

  return markdown;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, batchId, services, language = 'de' } = await req.json();
    const supabaseAdmin = getSupabaseAdmin();

    // ACTION: Start a new batch export
    if (action === 'start') {
      // Get auth user from request
      const authHeader = req.headers.get('Authorization');
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        { global: { headers: { Authorization: authHeader || '' } } }
      );
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) {
        return new Response(
          JSON.stringify({ success: false, error: 'Authentication required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create batch export record
      const { data: batch, error: batchError } = await supabaseAdmin
        .from('batch_exports')
        .insert({
          user_id: user.id,
          status: 'running',
          total_services: services.length,
          language,
        })
        .select()
        .single();

      if (batchError) throw batchError;

      // Create items
      const items = services.map((s: any) => ({
        batch_id: batch.id,
        service_technical_id: s.technicalId,
        service_name: s.displayName,
        service_file_name: s.fileName,
        status: 'pending',
      }));

      const { error: itemsError } = await supabaseAdmin
        .from('batch_export_items')
        .insert(items);

      if (itemsError) throw itemsError;

      // Self-invoke to start processing
      const selfUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/batch-export`;
      EdgeRuntime.waitUntil(
        fetch(selfUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          },
          body: JSON.stringify({ action: 'process', batchId: batch.id }),
        })
      );

      return new Response(
        JSON.stringify({ success: true, batchId: batch.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ACTION: Process next batch of services
    if (action === 'process') {
      // Get prompt from DB
      const { data: promptData } = await supabaseAdmin
        .from('analysis_prompts')
        .select('prompt_text')
        .eq('is_active', true)
        .single();

      const prompt = language === 'en'
        ? DEFAULT_PROMPT_EN
        : (promptData?.prompt_text || DEFAULT_PROMPT);

      // Get next pending items
      const { data: pendingItems, error: fetchError } = await supabaseAdmin
        .from('batch_export_items')
        .select('*')
        .eq('batch_id', batchId)
        .eq('status', 'pending')
        .limit(BATCH_SIZE);

      if (fetchError) throw fetchError;

      if (!pendingItems || pendingItems.length === 0) {
        // All done - mark batch complete
        const { data: completedCount } = await supabaseAdmin
          .from('batch_export_items')
          .select('id', { count: 'exact' })
          .eq('batch_id', batchId)
          .eq('status', 'completed');

        const { data: failedCount } = await supabaseAdmin
          .from('batch_export_items')
          .select('id', { count: 'exact' })
          .eq('batch_id', batchId)
          .eq('status', 'failed');

        await supabaseAdmin
          .from('batch_exports')
          .update({
            status: 'completed',
            completed_services: completedCount?.length || 0,
            failed_services: failedCount?.length || 0,
          })
          .eq('id', batchId);

        return new Response(
          JSON.stringify({ success: true, status: 'completed' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Process each item in this batch
      for (const item of pendingItems) {
        try {
          // Mark as running
          await supabaseAdmin
            .from('batch_export_items')
            .update({ status: 'running' })
            .eq('id', item.id);

          // Fetch service details from GitHub
          const details = await fetchServiceDetails(item.service_file_name);

          // Analyze with Perplexity
          const markdown = await analyzeService(
            item.service_name,
            details?.description || '',
            details,
            prompt,
            item.service_file_name,
            language
          );

          // Save result
          await supabaseAdmin
            .from('batch_export_items')
            .update({ status: 'completed', analysis_markdown: markdown })
            .eq('id', item.id);

          // Update batch progress
          const { data: doneCount } = await supabaseAdmin
            .from('batch_export_items')
            .select('id', { count: 'exact' })
            .eq('batch_id', batchId)
            .in('status', ['completed', 'failed']);

          await supabaseAdmin
            .from('batch_exports')
            .update({ completed_services: doneCount?.length || 0 })
            .eq('id', batchId);

          // Small delay to avoid rate limiting
          await new Promise(r => setTimeout(r, 1000));
        } catch (err) {
          console.error(`Failed to analyze ${item.service_name}:`, err);
          await supabaseAdmin
            .from('batch_export_items')
            .update({
              status: 'failed',
              error_message: err instanceof Error ? err.message : 'Unknown error',
            })
            .eq('id', item.id);

          // Update failed count
          const { data: failCount } = await supabaseAdmin
            .from('batch_export_items')
            .select('id', { count: 'exact' })
            .eq('batch_id', batchId)
            .eq('status', 'failed');

          await supabaseAdmin
            .from('batch_exports')
            .update({ failed_services: failCount?.length || 0 })
            .eq('id', batchId);
        }
      }

      // Self-invoke for next batch
      const selfUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/batch-export`;
      EdgeRuntime.waitUntil(
        fetch(selfUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          },
          body: JSON.stringify({ action: 'process', batchId }),
        })
      );

      return new Response(
        JSON.stringify({ success: true, status: 'processing', processed: pendingItems.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ACTION: Download completed batch as combined markdown
    if (action === 'download') {
      const { data: items, error: dlError } = await supabaseAdmin
        .from('batch_export_items')
        .select('service_name, analysis_markdown')
        .eq('batch_id', batchId)
        .eq('status', 'completed')
        .order('service_name');

      if (dlError) throw dlError;

      const combined = items
        .map((item: any) => item.analysis_markdown)
        .join('\n\n---\n\n');

      const header = `# SAP BTP Batch-Analyse\n\n> **Datum:** ${new Date().toLocaleDateString('de-DE')}  \n> **Services:** ${items.length}\n\n---\n\n`;

      // Build table of contents
      const toc = '## Inhaltsverzeichnis\n\n' +
        items.map((item: any, i: number) => `${i + 1}. [${item.service_name}](#${item.service_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')})`).join('\n') +
        '\n\n---\n\n';

      return new Response(
        JSON.stringify({ success: true, markdown: header + toc + combined }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Batch export error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
