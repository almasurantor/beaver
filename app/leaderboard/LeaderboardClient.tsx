'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/lib/types';

export default function LeaderboardClient({ players: initialPlayers, currentUserId }: { players: Profile[]; currentUserId: string }) {
  const supabase = useMemo(() => createClient(), []);
  const [players, setPlayers] = useState(initialPlayers);
  useEffect(() => setPlayers(initialPlayers), [initialPlayers]);
  useEffect(() => { const channel=supabase.channel('leaderboard-ratings').on('postgres_changes',{event:'UPDATE',schema:'public',table:'profiles'},async()=>{const {data}=await supabase.from('profiles').select('*').order('current_elo',{ascending:false});if(data)setPlayers(data as Profile[]);}).subscribe();return()=>{void supabase.removeChannel(channel);};},[supabase]);
  const winRate=(p:Profile)=>p.total_wins+p.total_losses?Math.round(p.total_wins/(p.total_wins+p.total_losses)*100):0;
  return <main className="min-h-screen bg-accent-gray-50 px-4 py-7"><div className="mx-auto max-w-4xl"><div className="flex items-end justify-between"><div><h1 className="text-4xl font-black">Leaderboard</h1><p className="mt-1 text-accent-gray-600">Club skill ranking by ELO</p></div><Link href="/weekly" className="rounded-full bg-primary-purple/10 px-4 py-2 text-sm font-bold text-primary-purple">Weekly</Link></div><div className="mt-6 space-y-3">{players.map((player,index)=>{const mine=player.id===currentUserId;return <Link href={`/profile/${player.id}`} key={player.id} className={`grid grid-cols-[3rem_1fr_auto] items-center gap-3 rounded-2xl border-2 p-4 shadow-sm transition active:scale-[.99] ${mine?'border-primary-purple bg-primary-purple/5':'border-accent-gray-200 bg-white'}`}><span className={`text-xl font-black ${index<3?'text-primary-purple':'text-accent-gray-500'}`}>#{index+1}</span><span className="min-w-0"><span className="block truncate font-black">{player.display_name}{mine&&<span className="ml-2 text-xs text-primary-purple">YOU</span>}</span><span className="text-sm text-accent-gray-500">{player.total_wins}-{player.total_losses} · {winRate(player)}% win rate</span></span><span className="text-right"><span className="block text-2xl font-black text-primary-purple">{player.current_elo}</span><span className="text-xs font-bold text-accent-gray-400">ELO</span></span></Link>;})}</div></div></main>;
}
