'use client';

import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Challenge, Match, Profile, RatingEvent } from '@/lib/types';
import { useDatabaseRefresh } from '@/lib/use-database-refresh';

interface Props {
  user: Profile;
  rank: number;
  pendingChallenges: Challenge[];
  activeMatches: Match[];
  ratingEvents: RatingEvent[];
  isAdmin: boolean;
}

const actionable = new Set(['result_reported', 'pending_confirmation']);

export default function DashboardClient({ user, rank, pendingChallenges, activeMatches, ratingEvents, isAdmin }: Props) {
  useDatabaseRefresh('home-actions');
  const [loading, setLoading] = useState<string | null>(null);
  const respondChallenge = async (id: string, action: 'accept' | 'decline') => {
    setLoading(id + action);
    try {
      const response = await fetch(`/api/challenges/${id}/respond`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Could not update challenge');
      toast.success(action === 'accept' ? 'Challenge accepted!' : 'Challenge declined');
      if (result.match_id) window.location.href = `/match/${result.match_id}`; else window.location.reload();
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not update challenge'); }
    finally { setLoading(null); }
  };
  const opponentFor = (match: Match) => match.player_one_id === user.id ? match.player_two : match.player_one;
  const needsMyConfirmation = (match: Match) => actionable.has(match.status) && match.reported_by !== user.id;
  const corrections = activeMatches.filter((m) => ['correction_proposed', 'admin_review', 'disputed'].includes(m.status));
  const confirmations = activeMatches.filter(needsMyConfirmation);
  const incoming = pendingChallenges.filter((c) => c.opponent_id === user.id);
  const winRate = user.total_wins + user.total_losses ? Math.round(user.total_wins / (user.total_wins + user.total_losses) * 100) : 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-accent-gray-50 to-primary-purple/5 px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-5xl space-y-7">
        <header className="flex items-end justify-between"><div><p className="text-sm font-bold text-accent-gray-500">Welcome back</p><h1 className="text-3xl font-black sm:text-4xl">{user.display_name}</h1></div>{isAdmin&&<Link href="/admin" className="rounded-full bg-accent-black px-4 py-2 text-sm font-bold text-white">Admin</Link>}</header>

        <section className="rounded-3xl gradient-purple p-6 text-white shadow-xl">
          <div className="flex items-end justify-between"><div><p className="text-sm font-bold text-white/75">Current rank</p><p className="text-5xl font-black">#{rank}</p></div><div className="text-right"><p className="text-4xl font-black">{user.current_elo}</p><p className="text-sm font-bold text-white/75">ELO rating</p></div></div>
          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/20 pt-5 text-center"><div><p className="text-xl font-black">{user.total_wins}-{user.total_losses}</p><p className="text-xs text-white/70">Record</p></div><div><p className="text-xl font-black">{winRate}%</p><p className="text-xs text-white/70">Win rate</p></div><div><p className="text-xl font-black">{user.current_streak > 0 ? `W${user.current_streak}` : user.current_streak < 0 ? `L${Math.abs(user.current_streak)}` : '—'}</p><p className="text-xs text-white/70">Streak</p></div></div>
        </section>

        {(confirmations.length > 0 || corrections.length > 0 || incoming.length > 0) && <section><h2 className="mb-3 text-xl font-black">Needs your attention</h2><div className="space-y-3">
          {confirmations.map((match) => { const opponent=opponentFor(match); return <Link key={match.id} href={`/match/${match.id}`} className="block rounded-2xl border-2 border-green-300 bg-green-50 p-5 shadow-sm"><p className="text-sm font-black uppercase tracking-wide text-green-700">Result needs confirmation</p><p className="mt-2 text-lg font-black">{match.player_one?.display_name} {match.player_one_score} – {match.player_two_score} {match.player_two?.display_name}</p><p className="mt-1 text-sm text-green-700">Reported by {match.reported_by === opponent?.id ? opponent?.display_name : 'your opponent'}</p><span className="mt-4 flex min-h-12 items-center justify-center rounded-xl bg-green-600 font-black text-white">Review result</span></Link>; })}
          {corrections.map((match) => <Link key={match.id} href={`/match/${match.id}`} className="block rounded-2xl border-2 border-amber-300 bg-amber-50 p-5"><p className="text-sm font-black uppercase text-amber-700">{match.status === 'admin_review' ? 'Under admin review' : 'Correction requested'}</p><p className="mt-2 font-bold">Match vs {opponentFor(match)?.display_name}</p></Link>)}
          {incoming.map((challenge) => <article key={challenge.id} className="rounded-2xl border-2 border-primary-purple/25 bg-white p-5 shadow-sm"><p className="text-sm font-black uppercase text-primary-purple">New challenge</p><p className="mt-2 text-lg font-black">{challenge.challenger?.display_name} wants to play</p><div className="mt-4 grid grid-cols-2 gap-3"><button disabled={loading!==null} onClick={() => respondChallenge(challenge.id,'decline')} className="min-h-12 rounded-xl border-2 border-accent-gray-300 font-bold">Decline</button><button disabled={loading!==null} onClick={() => respondChallenge(challenge.id,'accept')} className="min-h-12 rounded-xl gradient-purple font-bold text-white">Accept</button></div></article>)}
        </div></section>}

        {confirmations.length===0&&corrections.length===0&&incoming.length===0&&<section className="rounded-2xl border-2 border-accent-gray-200 bg-white p-7 text-center"><p className="text-3xl">✓</p><h2 className="mt-2 text-xl font-black">You’re all caught up</h2><p className="mt-1 text-accent-gray-500">No results or challenges need your attention.</p></section>}

        <section className="grid grid-cols-2 gap-4"><Link href="/play/record" className="rounded-2xl gradient-purple p-5 text-white shadow-lg"><span className="text-3xl">🏓</span><p className="mt-3 text-lg font-black">Record Match</p></Link><Link href="/players" className="rounded-2xl border-2 border-primary-purple/20 bg-white p-5"><span className="text-3xl">🎯</span><p className="mt-3 text-lg font-black">Challenge</p></Link></section>

        <section><div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-black">Recent rating changes</h2><Link href={`/profile/${user.id}`} className="text-sm font-bold text-primary-purple">View profile</Link></div>{ratingEvents.length ? <div className="space-y-2">{ratingEvents.map((event) => <div key={event.id} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm"><div><p className="font-bold">{event.event_kind === 'match_result' ? 'Ranked match' : 'Rating history'}</p><p className="text-sm text-accent-gray-500">{event.rating_before} → {event.rating_after}</p></div><span className={`text-xl font-black ${event.rating_change>=0?'text-green-600':'text-red-600'}`}>{event.rating_change>=0?'+':''}{event.rating_change}</span></div>)}</div> : <div className="rounded-2xl bg-white p-6 text-center text-accent-gray-500">Play your first ranked match.</div>}</section>
      </div>
    </main>
  );
}
