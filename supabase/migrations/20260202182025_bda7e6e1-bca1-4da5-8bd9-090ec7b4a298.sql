-- Drop the restrictive policies
DROP POLICY IF EXISTS "Anyone can read prompts" ON public.analysis_prompts;
DROP POLICY IF EXISTS "Anyone can update prompts" ON public.analysis_prompts;

-- Create permissive policies
CREATE POLICY "Anyone can read prompts" 
ON public.analysis_prompts 
FOR SELECT 
TO public
USING (true);

CREATE POLICY "Anyone can update prompts" 
ON public.analysis_prompts 
FOR UPDATE 
TO public
USING (true)
WITH CHECK (true);