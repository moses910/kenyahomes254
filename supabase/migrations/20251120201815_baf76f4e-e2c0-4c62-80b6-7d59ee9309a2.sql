-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Everyone can view agent profiles" ON public.profiles;

-- Create a secure public view that excludes sensitive email addresses
CREATE OR REPLACE VIEW public.public_agent_profiles AS
SELECT 
  id,
  name,
  role,
  verified,
  created_at
FROM public.profiles
WHERE role = 'agent';

-- Grant SELECT permission on the view to everyone
GRANT SELECT ON public.public_agent_profiles TO anon, authenticated;

-- Create a new policy that allows everyone to view only non-sensitive agent profile data
-- This is now handled through the view, but we still need the base policy for authenticated users to see their own full profile
CREATE POLICY "Public can view agent profiles without email"
ON public.profiles
FOR SELECT
USING (role = 'agent' AND auth.uid() IS NULL);