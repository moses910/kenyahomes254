-- 1. Revoke EXECUTE on SECURITY DEFINER functions from anon/authenticated
-- Both functions are only invoked internally by triggers, not by API callers.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_message_seeker() FROM PUBLIC, anon, authenticated;

-- 2. Fix public bucket listing: replace broad public SELECT on storage.objects
-- with a no-op policy. Files remain accessible via the public URL/CDN
-- because the bucket is public, but list/enumerate API calls are blocked.
DROP POLICY IF EXISTS "Public can view property images" ON storage.objects;

-- Keep authenticated users able to see their own files (needed for the app to list an agent's uploads).
CREATE POLICY "Owners can list their own property images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'property-images'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);