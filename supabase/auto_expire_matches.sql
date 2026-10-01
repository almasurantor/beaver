-- SQL to add auto-expiration support for matches
-- Run this after updating the schema

-- Add expires_at column if it doesn't exist
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Update status check constraint to include 'auto_expired'
ALTER TABLE public.matches 
DROP CONSTRAINT IF EXISTS matches_status_check;

ALTER TABLE public.matches 
ADD CONSTRAINT matches_status_check 
CHECK (status IN ('active', 'pending_confirmation', 'confirmed', 'auto_expired'));

-- Function to auto-expire matches where one player hasn't submitted within 1 hour
CREATE OR REPLACE FUNCTION expire_unsubmitted_matches()
RETURNS void AS $$
BEGIN
  UPDATE public.matches
  SET status = 'auto_expired'
  WHERE status IN ('active', 'pending_confirmation')
    AND expires_at IS NOT NULL
    AND expires_at < NOW()
    AND (
      (player_one_submission = TRUE AND player_two_submission = FALSE) OR
      (player_one_submission = FALSE AND player_two_submission = TRUE)
    );
END;
$$ LANGUAGE plpgsql;
