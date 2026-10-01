'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Profile } from '@/lib/types';
import { useDatabaseRefresh } from '@/lib/use-database-refresh';

export default function PlayersClient({ players, currentUserId }: { players: Profile[]; currentUserId: string }) {
  useDatabaseRefresh('players-list');
  const [query, setQuery] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const filtered = players.filter((player) => player.id !== currentUserId && player.display_name.toLowerCase().includes(query.toLowerCase()));
  const challenge = async (opponentId: string) => {
    setLoadingId(opponentId);
    try {
      const response = await fetch('/api/challenges', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ opponent_id: opponentId }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Could not send challenge');
      toast.success('Challenge sent!');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not send challenge'); }
    finally { setLoadingId(null); }
  };
  return <main className="min-h-screen bg-accent-gray-50 px-4 py-7"><div className="mx-auto max-w-3xl"><h1 className="text-4xl font-black">Players</h1><p className="mt-1 text-accent-gray-600">Find your next opponent.</p><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search club members" className="mt-6 h-14 w-full rounded-2xl border-2 border-accent-gray-200 bg-white px-5 text-lg focus:border-primary-purple focus:outline-none"/><div className="mt-5 space-y-3">{filtered.map((player) => { const rank=players.findIndex((p)=>p.id===player.id)+1; return <article key={player.id} className="rounded-2xl border-2 border-accent-gray-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><Link href={`/profile/${player.id}`} className="min-w-0"><p className="truncate text-lg font-black">{player.display_name}</p><p className="text-sm text-accent-gray-500">#{rank} · {player.current_elo} ELO · {player.total_wins}-{player.total_losses}</p></Link><span className="ml-3 rounded-full bg-primary-purple/10 px-3 py-1 text-sm font-black text-primary-purple">#{rank}</span></div><div className="mt-4 grid grid-cols-2 gap-3"><Link href={`/play/record?opponent=${player.id}`} className="flex min-h-12 items-center justify-center rounded-xl border-2 border-primary-purple font-bold text-primary-purple">Record Match</Link><button onClick={() => challenge(player.id)} disabled={loadingId===player.id} className="min-h-12 rounded-xl gradient-purple font-bold text-white disabled:opacity-50">{loadingId===player.id?'Sending…':'Challenge'}</button></div></article>; })}{filtered.length===0&&<div className="rounded-2xl bg-white p-10 text-center text-accent-gray-500">No players found.</div>}</div></div></main>;
}
