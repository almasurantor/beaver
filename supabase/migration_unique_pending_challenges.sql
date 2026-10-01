-- Prevent duplicate pending challenges (either direction) between two players.
-- Run in Supabase SQL Editor.
--
-- This blocks race conditions where the UI can send twice before it refreshes.

CREATE UNIQUE INDEX IF NOT EXISTS unique_pending_challenge_pair
ON public.challenges (
  LEAST(challenger_id, opponent_id),
  GREATEST(challenger_id, opponent_id)
)
WHERE status = 'pending';

