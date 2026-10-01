import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import RecordMatchClient from './RecordMatchClient';

export default async function RecordMatchPage({ searchParams }: { searchParams: { opponent?: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const [{ data: profile }, { data: players }, { data: recent }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('profiles').select('*').neq('id', user.id).order('current_elo', { ascending: false }),
    supabase.from('matches').select('player_one_id,player_two_id,confirmed_at')
      .or(`player_one_id.eq.${user.id},player_two_id.eq.${user.id}`).eq('status', 'confirmed')
      .order('confirmed_at', { ascending: false }).limit(10),
  ]);
  if (!profile) redirect('/login');
  const recentIds = [...new Set((recent || []).map((match) => match.player_one_id === user.id ? match.player_two_id : match.player_one_id))];
  return <RecordMatchClient user={profile} players={players || []} recentIds={recentIds} initialOpponentId={searchParams.opponent || null} />;
}
