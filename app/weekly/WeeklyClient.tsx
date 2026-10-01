'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/lib/types';

export default function WeeklyClient({ players: initialPlayers, currentUserId }: { players: Profile[]; currentUserId: string }) {
  const supabase=useMemo(()=>createClient(),[]);const [players,setPlayers]=useState(initialPlayers);
  useEffect(()=>setPlayers(initialPlayers),[initialPlayers]);
  useEffect(()=>{const channel=supabase.channel('weekly-rankings').on('postgres_changes',{event:'*',schema:'public',table:'weekly_player_stats'},()=>window.location.reload()).subscribe();return()=>{void supabase.removeChannel(channel);};},[supabase]);
  const active=players.filter(p=>p.weekly_wins||p.weekly_losses);const start=new Date();start.setDate(start.getDate()-((start.getDay()+6)%7));
  return <main className="min-h-screen bg-accent-gray-50 px-4 py-7"><div className="mx-auto max-w-4xl"><div className="flex items-end justify-between"><div><h1 className="text-4xl font-black">This week</h1><p className="mt-1 text-accent-gray-600">Since {start.toLocaleDateString()}</p></div><Link href="/leaderboard" className="rounded-full bg-primary-purple/10 px-4 py-2 text-sm font-bold text-primary-purple">ELO ranking</Link></div><div className="mt-6 space-y-3">{active.map((p,index)=><Link href={`/profile/${p.id}`} key={p.id} className={`grid grid-cols-[3rem_1fr_auto] items-center gap-3 rounded-2xl border-2 p-4 ${p.id===currentUserId?'border-primary-purple bg-primary-purple/5':'border-accent-gray-200 bg-white'}`}><span className="text-xl font-black text-primary-purple">#{index+1}</span><span><span className="block font-black">{p.display_name}</span><span className="text-sm text-accent-gray-500">{p.current_elo} ELO</span></span><span className="text-right"><span className="block text-xl font-black">{p.weekly_wins}-{p.weekly_losses}</span><span className="text-xs text-accent-gray-400">WEEKLY</span></span></Link>)}{!active.length&&<div className="rounded-3xl bg-white p-12 text-center"><p className="text-4xl">🏓</p><h2 className="mt-3 text-xl font-black">No matches this week</h2><p className="mt-1 text-accent-gray-500">Play your first ranked match.</p></div>}</div></div></main>;
}
