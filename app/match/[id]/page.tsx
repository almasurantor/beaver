import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import MatchClient from './MatchClient';
import { Dispute } from '@/lib/types';

export default async function MatchPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: match } = await supabase
    .from('matches')
    .select(`
      *,
      player_one:profiles!matches_player_one_id_fkey(*),
      player_two:profiles!matches_player_two_id_fkey(*)
    `)
    .eq('id', params.id)
    .single();

  if (!match) {
    redirect('/dashboard');
  }

  // Verify user is part of this match
  if (match.player_one_id !== user.id && match.player_two_id !== user.id) {
    redirect('/dashboard');
  }

  const { data: dispute } = await supabase.from('disputes').select('*')
    .eq('match_id', match.id).in('status', ['proposed', 'admin_review']).order('created_at', { ascending: false }).limit(1).maybeSingle();
  const { data: mySubmission } = await supabase.from('match_submissions').select('id')
    .eq('match_id', match.id).eq('submitted_by', user.id).maybeSingle();

  return <MatchClient match={match} dispute={(dispute as Dispute | null) || null} hasSubmitted={!!mySubmission} currentUserId={user.id} />;
}
