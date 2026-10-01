-- RLS policies for Realtime: users see only their own challenges/matches.
-- Run this in Supabase SQL Editor. Then refresh Supabase and restart dev server.
-- Realtime evaluates RLS before delivering events; these policies ensure events reach the client.

-- Challenges: only rows where current user is challenger or opponent
DROP POLICY IF EXISTS "Challenges are viewable by everyone" ON public.challenges;
CREATE POLICY "Users can view their own challenges"
  ON public.challenges
  FOR SELECT
  USING (
    auth.uid() = challenger_id
    OR auth.uid() = opponent_id
  );

-- Matches: only rows where current user is player_one or player_two
DROP POLICY IF EXISTS "Matches are viewable by everyone" ON public.matches;
CREATE POLICY "Users can view their matches"
  ON public.matches
  FOR SELECT
  USING (
    auth.uid() = player_one_id
    OR auth.uid() = player_two_id
  );

-- Profiles: keep public read (optional; only change if you want to restrict)
-- CREATE POLICY "Users can view profiles" ON public.profiles FOR SELECT USING (true);
-- Your existing "Profiles are viewable by everyone" with USING (true) is fine.
