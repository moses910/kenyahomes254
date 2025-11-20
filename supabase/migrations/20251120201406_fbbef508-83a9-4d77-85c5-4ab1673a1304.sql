-- Enable RLS on the view itself
ALTER VIEW public.public_agent_profiles SET (security_barrier = true);

-- Views don't support RLS policies directly in the same way as tables
-- The solution is to create a policy on the underlying profiles table
-- that allows the specific columns to be viewed, which we already have

-- However, we need to ensure the view is accessible
-- Let's verify by granting explicit permissions and ensuring no RLS blocks it

-- The issue is that views with security_invoker check RLS on underlying tables
-- We already have "Everyone can view agent profiles" policy on profiles table
-- So the view should work now

-- Let's just make sure the grants are in place
GRANT SELECT ON public.public_agent_profiles TO anon;
GRANT SELECT ON public.public_agent_profiles TO authenticated;

-- The view will work because:
-- 1. It has security_invoker = true (uses caller's permissions)
-- 2. The profiles table has "Everyone can view agent profiles" policy
-- 3. The view only selects safe columns
-- 4. Grants are in place for anon and authenticated roles