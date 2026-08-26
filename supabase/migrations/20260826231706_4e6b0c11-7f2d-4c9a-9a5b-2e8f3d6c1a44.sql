-- Fix RLS data exposure on public.profiles
--
-- Problem: the leftover "Public can view agent profiles without email" policy
-- lets anonymous users SELECT agent rows directly from public.profiles. RLS
-- is row-level only (no column filtering), so this exposes the full agent
-- row -- including email and phone -- to anyone, even though the app is
-- supposed to expose only id/name/role/verified/created_at via the
-- public_agent_profiles view.
--
-- Fix:
--   1. Recreate public_agent_profiles as an owner-mode view (the default:
--      runs with the view owner's privileges, bypassing the underlying RLS
--      but only ever returning the safe columns listed in the definition).
--      Public reads then work without ANY permissive policy on profiles.
--   2. Drop every permissive SELECT policy on profiles.
--   3. Revoke all direct access to profiles from the anon role entirely.
--      Authenticated users keep table-level SELECT so the
--      "Users can view own full profile" policy (auth.uid() = id) still works.

-- 1. Owner-mode view: exposes only the safe agent columns.
DROP VIEW IF EXISTS public.public_agent_profiles CASCADE;
CREATE VIEW public.public_agent_profiles AS
SELECT
  id,
  name,
  role,
  verified,
  created_at
FROM public.profiles
WHERE role = 'agent';

GRANT SELECT ON public.public_agent_profiles TO anon, authenticated;

-- 2. Drop permissive policies that expose full agent rows (incl. email/phone).
DROP POLICY IF EXISTS "Public can view agent profiles without email" ON public.profiles;
DROP POLICY IF EXISTS "Everyone can view agent profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can view basic agent info only" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view agent basic info" ON public.profiles;
DROP POLICY IF EXISTS "Public can view basic agent info" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- 3. Anonymous users never need direct access to the profiles table.
REVOKE ALL ON public.profiles FROM anon;

-- 4. The only remaining SELECT path is a user's own profile.
DROP POLICY IF EXISTS "Users can view own full profile" ON public.profiles;
CREATE POLICY "Users can view own full profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);
