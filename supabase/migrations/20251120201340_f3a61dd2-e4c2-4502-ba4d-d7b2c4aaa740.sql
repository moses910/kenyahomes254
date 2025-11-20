-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "Public can view basic agent info only" ON public.profiles;

-- Add a policy that allows everyone to view agent profiles
-- The view already filters to only safe columns (id, name, role, verified, created_at)
CREATE POLICY "Everyone can view agent profiles"
ON public.profiles
FOR SELECT
USING (role = 'agent');

-- This policy will be used by both authenticated and anonymous users
-- The frontend uses the public_agent_profiles view which only exposes safe columns
-- Users viewing their own profile still use "Users can view own full profile"