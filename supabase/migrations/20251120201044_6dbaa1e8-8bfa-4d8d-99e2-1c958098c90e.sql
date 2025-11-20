-- Drop the overly permissive policy that exposes all columns
DROP POLICY IF EXISTS "Anyone can view agent basic info" ON public.profiles;

-- Create a view that only exposes safe, public agent information
CREATE OR REPLACE VIEW public.public_agent_profiles AS
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

-- Note: Users can still view their own full profile via the existing
-- "Users can view own full profile" policy on the profiles table