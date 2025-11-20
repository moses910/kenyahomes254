-- Drop the existing view completely
DROP VIEW IF EXISTS public.public_agent_profiles CASCADE;

-- Recreate as a security invoker view (not security definer)
CREATE VIEW public.public_agent_profiles AS
SELECT 
  id,
  name,
  role,
  verified,
  created_at
FROM public.profiles
WHERE role = 'agent';

-- Set security invoker to use the permissions of the querying user
ALTER VIEW public.public_agent_profiles SET (security_invoker = true);

-- Grant SELECT permission on the view to everyone
GRANT SELECT ON public.public_agent_profiles TO anon, authenticated;