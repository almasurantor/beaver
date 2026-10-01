import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-response';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  if (body.action === 'dispute') {
    const { data, error } = await supabase.rpc('propose_match_correction_v2', {
      p_match: params.id,
      p_reason: body.reason,
      p_winner: body.winner_id,
      p_winner_score: Number(body.winner_score),
      p_loser_score: Number(body.loser_score),
    });
    if (error) return apiError(error);
    return NextResponse.json(data);
  }

  if (body.action === 'confirm') {
    const { data, error } = await supabase.rpc('confirm_match_result_v2', { p_match: params.id });
    if (error) return apiError(error);
    return NextResponse.json(data);
  }

  return NextResponse.json({ error: 'Action must be confirm or dispute' }, { status: 400 });
}
