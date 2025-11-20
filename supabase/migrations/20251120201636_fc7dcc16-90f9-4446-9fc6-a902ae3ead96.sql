-- Add validation trigger to ensure seeker_id matches auth.uid()
CREATE OR REPLACE FUNCTION public.validate_message_seeker()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Ensure seeker_id matches the authenticated user
  IF NEW.seeker_id != auth.uid() THEN
    RAISE EXCEPTION 'seeker_id must match authenticated user';
  END IF;
  
  -- Validate email format if provided
  IF NEW.email IS NOT NULL AND NEW.email != '' THEN
    IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
      RAISE EXCEPTION 'Invalid email format';
    END IF;
    -- Limit email length
    IF length(NEW.email) > 255 THEN
      RAISE EXCEPTION 'Email must be less than 255 characters';
    END IF;
  END IF;
  
  -- Validate phone format if provided
  IF NEW.phone IS NOT NULL AND NEW.phone != '' THEN
    -- Remove spaces, dashes, parentheses for validation
    IF regexp_replace(NEW.phone, '[^0-9+]', '', 'g') !~ '^\+?[0-9]{6,20}$' THEN
      RAISE EXCEPTION 'Invalid phone format';
    END IF;
    -- Limit phone length
    IF length(NEW.phone) > 20 THEN
      RAISE EXCEPTION 'Phone must be less than 20 characters';
    END IF;
  END IF;
  
  -- Validate message body
  IF NEW.body IS NULL OR trim(NEW.body) = '' THEN
    RAISE EXCEPTION 'Message body cannot be empty';
  END IF;
  
  IF length(NEW.body) > 5000 THEN
    RAISE EXCEPTION 'Message must be less than 5000 characters';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on messages table
DROP TRIGGER IF EXISTS validate_message_before_insert ON public.messages;
CREATE TRIGGER validate_message_before_insert
  BEFORE INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_message_seeker();