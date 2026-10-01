import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import WeeklyClient from './WeeklyClient';

export default async function WeeklyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const today = new Date();
  const monday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
  const weekStart = monday.toISOString().slice(0, 10);
  const { data: weeklyRows } = await supabase
    .from('weekly_player_stats')
    .select('player_id,wins,losses,player:profiles(*)')
    .eq('week_start', weekStart)
    .order('wins', { ascending: false });

  const players = (weeklyRows || []).flatMap((row) => {
    const player = Array.isArray(row.player) ? row.player[0] : row.player;
    return player ? [{ ...player, weekly_wins: row.wins, weekly_losses: row.losses }] : [];
  });

  return <WeeklyClient players={players || []} currentUserId={user.id} />;
}
