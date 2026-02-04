import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CLASSIFICATION_PROMPT = `Du bist ein SAP Basis-Experte mit 15+ Jahren Erfahrung. Klassifiziere den SAP BTP Service nach seiner Relevanz für SAP Basis-Administratoren.

RELEVANZ-STUFEN:

🟢 HOCH - Kernaufgaben für SAP Basis:
- Provisionierung & Lifecycle von Instanzen/Subaccounts
- Security, Identity & Access Management (IAM, Trust, Roles)
- Connectivity (Destinations, Cloud Connector, Zertifikate)
- Monitoring, Alerting, Health Checks
- Transport & Change Management
- Infrastruktur & Plattform-Administration

🟡 MITTEL - Teilweise Basis-relevant:
- Setup/Provisionierung durch Basis, aber primär Entwickler-Nutzung
- Services die Basis initial konfiguriert, dann an Entwickler übergibt
- Shared responsibility zwischen Basis und Entwicklung

🔴 NIEDRIG - Kaum/keine Basis-Relevanz:
- Reine Entwicklungs-Frameworks und SDKs
- Fachbereichs-spezifische Anwendungen
- End-User Tools ohne Admin-Komponente

WICHTIG: Antworte AUSSCHLIESSLICH mit einem JSON-Objekt. Keine Erklärungen außerhalb des JSON.`;

interface ClassifyRequest {
  serviceName: string;
  serviceDescription: string;
  serviceCategory: string;
  technicalId: string;
  forceReclassify?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { serviceName, serviceDescription, serviceCategory, technicalId, forceReclassify }: ClassifyRequest = await req.json();

    if (!serviceName || !technicalId) {
      return new Response(
        JSON.stringify({ error: "serviceName und technicalId sind erforderlich" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role to write to cache
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check cache first (unless force reclassify)
    if (!forceReclassify) {
      const { data: cached } = await supabase
        .from("service_relevance_cache")
        .select("relevance, reason")
        .eq("service_technical_id", technicalId)
        .single();

      if (cached) {
        console.log(`Cache hit for ${technicalId}`);
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: { 
              relevance: cached.relevance, 
              reason: cached.reason,
              cached: true 
            } 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      console.log(`Force reclassify for ${technicalId}`);
    }

    // Call Lovable AI Gateway for classification
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const userMessage = `Service: ${serviceName}
Kategorie: ${serviceCategory || 'Nicht angegeben'}
Beschreibung: ${serviceDescription || 'Keine Beschreibung verfügbar'}

Klassifiziere diesen Service und antworte NUR mit JSON:
{"relevance": "hoch" | "mittel" | "niedrig", "reason": "Kurze Begründung (max 100 Zeichen)"}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: CLASSIFICATION_PROMPT },
          { role: "user", content: userMessage }
        ],
        max_tokens: 150,
        temperature: 0.3, // Lower temperature for consistent classifications
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit überschritten. Bitte später erneut versuchen." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Kredit-Limit erreicht. Bitte Guthaben aufladen." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Keine Antwort vom AI Gateway");
    }

    // Parse the JSON response
    let classification: { relevance: string; reason: string };
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/\{[\s\S]*?\}/);
      if (!jsonMatch) {
        throw new Error("Kein JSON in der Antwort gefunden");
      }
      classification = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Parse error:", parseError, "Content:", content);
      throw new Error("Konnte AI-Antwort nicht parsen");
    }

    // Validate relevance value
    const validRelevance = ["hoch", "mittel", "niedrig"];
    if (!validRelevance.includes(classification.relevance)) {
      classification.relevance = "mittel"; // Default fallback
    }

    // Truncate reason if too long
    const reason = (classification.reason || "Keine Begründung").slice(0, 200);

    // Cache the result
    const { error: insertError } = await supabase
      .from("service_relevance_cache")
      .upsert({
        service_technical_id: technicalId,
        relevance: classification.relevance,
        reason: reason,
      }, { onConflict: "service_technical_id" });

    if (insertError) {
      console.warn("Cache insert error:", insertError);
      // Don't fail the request, just log the warning
    }

    console.log(`Classified ${technicalId}: ${classification.relevance}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          relevance: classification.relevance,
          reason: reason,
          cached: false,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("classify-relevance error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unbekannter Fehler" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
