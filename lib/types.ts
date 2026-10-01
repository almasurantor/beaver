export interface Profile {
  id: string;
  display_name: string;
  current_elo: number;
  total_wins: number;
  total_losses: number;
  weekly_wins: number;
  weekly_losses: number;
  highest_elo: number;
  current_streak: number;
  longest_streak: number;
  created_at: string;
  updated_at: string;
}

export interface Challenge {
  id: string;
  challenger_id: string;
  opponent_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'completed';
  created_at: string;
  expires_at: string;
  challenger?: Profile;
  opponent?: Profile;
}

export interface Match {
  id: string;
  challenge_id: string | null;
  player_one_id: string;
  player_two_id: string;
  player_one_score: number | null;
  player_two_score: number | null;
  status: MatchStatus;
  source: 'challenge' | 'spontaneous' | 'legacy';
  ranked: boolean;
  winner_id: string | null;
  verification_mode: 'normal' | 'dual';
  request_id: string | null;
  finalized_at: string | null;
  season_id: string | null;
  revision: number;
  reported_by: string | null;
  reported_at: string | null;
  confirmed_by: string | null;
  disputed_by: string | null;
  disputed_at: string | null;
  dispute_reason: string | null;
  expires_at: string | null;
  player_one_elo_before: number | null;
  player_two_elo_before: number | null;
  player_one_elo_change: number | null;
  player_two_elo_change: number | null;
  confirmed_at: string | null;
  created_at: string;
  player_one?: Profile;
  player_two?: Profile;
}

export type MatchStatus =
  | 'active' | 'pending_confirmation' | 'disputed' | 'auto_expired'
  | 'ready' | 'result_reported' | 'awaiting_independent_report'
  | 'correction_proposed' | 'admin_review' | 'confirmed' | 'expired' | 'voided';

export type VerificationLevel = 'normal' | 'monitored' | 'dual_verification' | 'ranked_restricted';

export interface RatingEvent {
  id: string;
  match_id: string | null;
  player_id: string;
  event_kind: 'match_result' | 'legacy_match' | 'opening_balance' | 'migration_adjustment' | 'reversal' | 'admin_adjustment';
  rating_before: number;
  rating_change: number;
  rating_after: number;
  revision: number;
  is_active: boolean;
  created_at: string;
}

export interface Dispute {
  id: string;
  match_id: string;
  opened_by: string;
  reason: 'wrong_score' | 'wrong_winner' | 'dual_conflict' | 'other';
  original_winner_id: string;
  original_player_one_score: number;
  original_player_two_score: number;
  proposed_winner_id: string;
  proposed_player_one_score: number;
  proposed_player_two_score: number;
  status: 'proposed' | 'admin_review' | 'resolved' | 'voided';
  match?: Match;
}

export interface MatchHistory {
  id: string;
  player_one_id: string;
  player_two_id: string;
  player_one_score: number;
  player_two_score: number;
  player_one_elo_change: number | null;
  player_two_elo_change: number | null;
  confirmed_at: string;
  created_at: string;
  winner_id: string | null;
  player_one?: Profile;
  player_two?: Profile;
}
