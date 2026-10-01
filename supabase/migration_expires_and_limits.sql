-- Run this in Supabase SQL Editor to fix schema cache and add new rules.
-- 1) Fix "expires_at" column missing from schema cache
-- 2) Challenges expire in 2 hours
-- 3) Pending-confirmation matches expire in 2 hours; both players -5 ELO
-- 4) (App will enforce 20 games per person per day when challenging)

-- 1. Ensure matches.expires_at exists (fixes "Could not find expires_at in schema cache")
ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- 2. Challenges: default expiry 2 hours (for new challenges)
ALTER TABLE public.challenges
ALTER COLUMN expires_at SET DEFAULT (NOW() + INTERVAL '2 hours');

-- 3. Function: expire pending_confirmation matches after 2h and apply -5 ELO to both players
CREATE OR REPLACE FUNCTION expire_pending_confirmation_matches()
RETURNS void AS $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT id, player_one_id, player_two_id
    FROM public.matches
    WHERE status = 'pending_confirmation'
      AND expires_at IS NOT NULL
      AND expires_at < NOW()
  LOOP
    UPDATE public.profiles SET current_elo = current_elo - 5, updated_at = NOW() WHERE id = r.player_one_id;
    UPDATE public.profiles SET current_elo = current_elo - 5, updated_at = NOW() WHERE id = r.player_two_id;
    UPDATE public.matches SET status = 'auto_expired' WHERE id = r.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: run expiry functions manually or via cron
-- SELECT expire_old_challenges();   -- expires pending challenges past expires_at
-- SELECT expire_unsubmitted_matches(); -- expires matches where only one player submitted
-- SELECT expire_pending_confirmation_matches(); -- pending_confirmation timeout, -5 each
