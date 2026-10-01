import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PlayersClient from './PlayersClient';

export default async function PlayersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: players } = await supabase.from('profiles').select('*').order('current_elo', { ascending: false });
  return <PlayersClient players={players || []} currentUserId={user.id} />;
}
