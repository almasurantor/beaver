import { createClient } from '@/lib/supabase/server';
import { validateMatchScore } from '@/lib/match-result';
import { apiError } from '@/lib/api-response';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const winnerScore = Number(body.winner_score);
  const loserScore = Number(body.loser_score);
  const invalid = validateMatchScore(winnerScore, loserScore);
  if (invalid || winnerScore <= loserScore) return NextResponse.json({ error: invalid || 'Winner score must be higher' }, { status: 400 });
  if (![body.winner_id, body.opponent_id, body.request_id].every((value) => typeof value === 'string')) {
    return NextResponse.json({ error: 'Opponent, winner, and request ID are required' }, { status: 400 });
  }
  const { data, error } = await supabase.rpc('create_spontaneous_match_v2', {
    p_opponent: body.opponent_id,
    p_winner: body.winner_id,
    p_winner_score: winnerScore,
    p_loser_score: loserScore,
    p_request: body.request_id,
    p_allow_duplicate: body.allow_duplicate === true,
  });
  if (error) return apiError(error);
  return NextResponse.json(data);
}
