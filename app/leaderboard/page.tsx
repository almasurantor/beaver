import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import LeaderboardClient from './LeaderboardClient';

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: players } = await supabase
    .from('profiles')
    .select('*')
    .order('current_elo', { ascending: false });

  return <LeaderboardClient players={players || []} currentUserId={user.id} />;
}
