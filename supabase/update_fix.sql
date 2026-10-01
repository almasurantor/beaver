-- Function to update both players' stats after match confirmation
-- Uses SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION update_match_stats(
  p_match_id UUID,
  p_player_one_id UUID,
  p_player_two_id UUID,
  p_player_one_new_elo INTEGER,
  p_player_two_new_elo INTEGER,
  p_player_one_won BOOLEAN
)
RETURNS void AS $$
BEGIN
  -- Update player one
  UPDATE public.profiles
  SET 
    current_elo = p_player_one_new_elo,
    total_wins = total_wins + CASE WHEN p_player_one_won THEN 1 ELSE 0 END,
    total_losses = total_losses + CASE WHEN p_player_one_won THEN 0 ELSE 1 END,
    weekly_wins = weekly_wins + CASE WHEN p_player_one_won THEN 1 ELSE 0 END,
    weekly_losses = weekly_losses + CASE WHEN p_player_one_won THEN 0 ELSE 1 END,
    updated_at = NOW()
  WHERE id = p_player_one_id;

  -- Update player two
  UPDATE public.profiles
  SET 
    current_elo = p_player_two_new_elo,
    total_wins = total_wins + CASE WHEN p_player_one_won THEN 0 ELSE 1 END,
    total_losses = total_losses + CASE WHEN p_player_one_won THEN 1 ELSE 0 END,
    weekly_wins = weekly_wins + CASE WHEN p_player_one_won THEN 0 ELSE 1 END,
    weekly_losses = weekly_losses + CASE WHEN p_player_one_won THEN 1 ELSE 0 END,
    updated_at = NOW()
  WHERE id = p_player_two_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Realtime for tables (if not already enabled)
-- These commands will fail silently if already added, which is fine
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.challenges;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
