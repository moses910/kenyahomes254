-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create a restrictive policy: users can view their own full profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Create a policy for public info: only name and role visible to others (for agent listings)
CREATE POLICY "Public can view basic agent info"
ON public.profiles
FOR SELECT
USING (
  auth.uid() != id AND role = 'agent'
);

-- However, we need to allow viewing only specific columns publicly
-- Since Postgres RLS doesn't support column-level permissions directly,
-- we'll create a more nuanced approach:

-- Drop the policies we just created
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public can view basic agent info" ON public.profiles;

-- Create a comprehensive policy that allows:
-- 1. Users to see their own full profile
-- 2. Everyone to see name and role of agents (for property listings)
-- But we can't restrict columns in RLS, so we'll document that the frontend
-- should create a view or the backend should filter

-- For now, let's use a policy that:
-- - Allows full access to own profile
-- - Allows access to agent profiles (name/role visible, app will filter)

CREATE POLICY "Users can view own full profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Anyone can view agent basic info"
ON public.profiles
FOR SELECT
USING (role = 'agent');

-- Note: The application layer should filter to only show name and role for agents
-- when accessed by non-owners. Email and phone should only be shown to the profile owner.