import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/login');
  }

  // Rankings are derived directly from current database ratings.
  const { data: players } = await supabase
    .from('profiles')
    .select('*')
    .order('current_elo', { ascending: false });

  // Get pending challenges for current user
  const { data: pendingChallenges } = await supabase
    .from('challenges')
    .select(`
      *,
      challenger:profiles!challenges_challenger_id_fkey(*),
      opponent:profiles!challenges_opponent_id_fkey(*)
    `)
    .or(`challenger_id.eq.${user.id},opponent_id.eq.${user.id}`)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  // Get actionable matches, including legacy transition states.
  const { data: activeMatches } = await supabase
    .from('matches')
    .select(`
      *,
      player_one:profiles!matches_player_one_id_fkey(*),
      player_two:profiles!matches_player_two_id_fkey(*)
    `)
    .or(`player_one_id.eq.${user.id},player_two_id.eq.${user.id}`)
    .in('status', ['active', 'pending_confirmation', 'disputed', 'ready', 'result_reported', 'awaiting_independent_report', 'correction_proposed', 'admin_review'])
    .order('created_at', { ascending: false });

  const { data: ratingEvents } = await supabase
    .from('rating_events')
    .select('*')
    .eq('player_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(5);
  const { data: isAdmin } = await supabase.rpc('is_admin');

  const rank = (players || []).findIndex((player) => player.id === user.id) + 1;

  return (
    <DashboardClient
      user={profile}
      rank={rank || 1}
      pendingChallenges={pendingChallenges || []}
      activeMatches={activeMatches || []}
      ratingEvents={ratingEvents || []}
      isAdmin={!!isAdmin}
    />
  );
}
