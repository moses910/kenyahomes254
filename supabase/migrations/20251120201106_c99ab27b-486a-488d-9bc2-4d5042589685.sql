-- Fix the security definer issue by recreating the view with SECURITY INVOKER
DROP VIEW IF EXISTS public.public_agent_profiles;

CREATE OR REPLACE VIEW public.public_agent_profiles
WITH (security_invoker = true) AS
SELECT 
  id,
  name,
  role,
  verified,
  created_at
FROM public.profiles
WHERE role = 'agent';

-- Grant SELECT on the view to everyone (including anonymous users)
GRANT SELECT ON public.public_agent_profiles TO anon, authenticated;