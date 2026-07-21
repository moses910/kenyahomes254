-- Remove the public SELECT policy on profiles that exposed full rows (including email/phone)
-- to anonymous callers. Public reads must go through the public_agent_profiles view,
-- which exposes only safe columns (id, name, role, verified, created_at).
DROP POLICY IF EXISTS "Public can view agent profiles without email" ON public.profiles;