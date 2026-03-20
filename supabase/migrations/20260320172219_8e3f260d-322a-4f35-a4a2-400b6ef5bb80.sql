
-- Batch export jobs table
CREATE TABLE public.batch_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  total_services integer NOT NULL DEFAULT 0,
  completed_services integer NOT NULL DEFAULT 0,
  failed_services integer NOT NULL DEFAULT 0,
  language text NOT NULL DEFAULT 'de',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  error_message text
);

-- Batch export items (one per service)
CREATE TABLE public.batch_export_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid REFERENCES public.batch_exports(id) ON DELETE CASCADE NOT NULL,
  service_technical_id text NOT NULL,
  service_name text NOT NULL,
  service_file_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  analysis_markdown text,
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.batch_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_export_items ENABLE ROW LEVEL SECURITY;

-- RLS: Users can read their own exports
CREATE POLICY "Users can read own exports" ON public.batch_exports
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- RLS: Users can insert their own exports
CREATE POLICY "Users can insert own exports" ON public.batch_exports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- RLS: Service role can do everything (for edge functions)
CREATE POLICY "Service role full access exports" ON public.batch_exports
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- RLS: Users can read items of their exports
CREATE POLICY "Users can read own export items" ON public.batch_export_items
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.batch_exports WHERE id = batch_id AND user_id = auth.uid()));

-- RLS: Service role full access on items
CREATE POLICY "Service role full access items" ON public.batch_export_items
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Enable realtime for progress tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.batch_exports;

-- Trigger for updated_at
CREATE TRIGGER update_batch_exports_updated_at
  BEFORE UPDATE ON public.batch_exports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
