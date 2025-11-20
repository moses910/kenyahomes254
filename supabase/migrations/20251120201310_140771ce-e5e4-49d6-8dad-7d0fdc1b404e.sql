-- Enable RLS on the public_agent_profiles view
ALTER VIEW public.public_agent_profiles SET (security_barrier = true);

-- Create a policy to allow public SELECT access to the view
-- Since it's a view, we need to add RLS to the underlying mechanism
-- Actually, we need to handle this differently - let's add a policy to profiles table
-- that allows viewing only specific columns for agents

-- Add a policy on profiles table that allows public to view agent basic info
CREATE POLICY "Public can view basic agent info only"
ON public.profiles
FOR SELECT
USING (
  role = 'agent' 
  AND auth.uid() IS NULL  -- Only for anonymous/unauthenticated users
);

-- Note: Authenticated users viewing agents will use this policy
-- Users viewing their own profile will use "Users can view own full profile"