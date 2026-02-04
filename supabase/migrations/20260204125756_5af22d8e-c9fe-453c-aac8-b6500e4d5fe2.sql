-- Cache-Tabelle für Service-Relevanz-Klassifizierungen
CREATE TABLE public.service_relevance_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_technical_id TEXT UNIQUE NOT NULL,
  relevance TEXT NOT NULL CHECK (relevance IN ('hoch', 'mittel', 'niedrig')),
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS aktivieren
ALTER TABLE public.service_relevance_cache ENABLE ROW LEVEL SECURITY;

-- Öffentlich lesbar
CREATE POLICY "Anyone can read relevance cache" 
ON public.service_relevance_cache 
FOR SELECT 
USING (true);

-- Edge Functions können einfügen (via service role)
CREATE POLICY "Service role can insert" 
ON public.service_relevance_cache 
FOR INSERT 
WITH CHECK (true);

-- Index für schnelle Lookups
CREATE INDEX idx_service_relevance_technical_id 
ON public.service_relevance_cache(service_technical_id);