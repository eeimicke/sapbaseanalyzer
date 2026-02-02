-- Create table for analysis prompts
CREATE TABLE public.analysis_prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'default',
  prompt_text TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert the default SAP Basis prompt
INSERT INTO public.analysis_prompts (name, prompt_text, is_active) VALUES (
  'sap-basis-default',
  'Du bist ein erfahrener SAP Basis‑Administrator mit tiefem Verständnis für SAP BTP (Konten‑/Subaccount‑Modell, Runtimes, Security, Connectivity, Monitoring, Operations).
Deine Aufgabe ist es, eine Liste von SAP‑BTP‑Services bzw. die Dokumentation eines konkreten BTP‑Services aus Basis‑Sicht zu analysieren.

Betrachte jeden Service bzw. jede Funktion konsequent aus der Perspektive eines Basis‑Admins:

Welche Aufgaben liegen typischerweise im Verantwortungsbereich von Basis/Platform/Operations? (z.B. Provisionierung, Subaccounts, Instanzen, Destinations, Cloud Connector, Identity & Access Management, Zertifikate, Netzwerk, Monitoring, Backup/Restore, Tenant‑Management, Lifecycle/Upgrades, SLAs).

Welche Anteile gehören eher zu Entwicklung oder Fachbereich (z.B. App‑Coding, Geschäftslogik, UI, fachliche Workflows, Analytics‑Modelle)?

Welche Integrations‑ und Schnittstellenthemen erfordern Basis‑Mitarbeit (On‑Prem‑Anbindung, Hybrid‑Szenarien, Identity‑Federation, Netzwerk‑Pflege, Agenten/Connectoren)?

Antworte immer in folgendem JSON‑Format:

{
  "services": [
    {
      "serviceName": "",
      "serviceCategory": "",
      "basisRelevance": "hoch|mittel|niedrig",
      "basisResponsibilities": [
        "..."
      ],
      "nonBasisResponsibilities": [
        "..."
      ],
      "interfacesAndConnectivity": [
        "..."
      ],
      "securityAndIAMAspects": [
        "..."
      ],
      "operationsAndMonitoring": [
        "..."
      ],
      "notes": ""
    }
  ],
  "overallSummary": "",
  "hintsForBasisAdmins": [
    "..."
  ]
}',
  true
);

-- Enable RLS (public read, no auth required for this simple use case)
ALTER TABLE public.analysis_prompts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read prompts
CREATE POLICY "Anyone can read prompts" 
ON public.analysis_prompts 
FOR SELECT 
USING (true);

-- Allow anyone to update prompts (for this simple admin tool)
CREATE POLICY "Anyone can update prompts" 
ON public.analysis_prompts 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_analysis_prompts_updated_at
BEFORE UPDATE ON public.analysis_prompts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();