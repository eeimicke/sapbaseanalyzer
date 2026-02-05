-- Drop existing public SELECT policy
DROP POLICY IF EXISTS "Anyone can read relevance cache" ON public.service_relevance_cache;

-- Create new policy that requires authentication
CREATE POLICY "Authenticated users can read relevance cache"
ON public.service_relevance_cache
FOR SELECT
TO authenticated
USING (true);