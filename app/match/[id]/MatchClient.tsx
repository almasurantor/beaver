'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { validateMatchScore } from '@/lib/match-result';
import { Dispute, Match } from '@/lib/types';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import ScoreStepper from '@/components/ScoreStepper';
import { useDatabaseRefresh } from '@/lib/use-database-refresh';

interface Props { match: Match; dispute: Dispute | null; hasSubmitted: boolean; currentUserId: string }

export default function MatchClient({ match: initialMatch, dispute: initialDispute, hasSubmitted, currentUserId }: Props) {
  useDatabaseRefresh(`match-${initialMatch.id}`);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [match, setMatch] = useState(initialMatch);
  const [dispute, setDispute] = useState(initialDispute);
  const [winnerId, setWinnerId] = useState(currentUserId);
  const [myScore, setMyScore] = useState(11);
  const [theirScore, setTheirScore] = useState(9);
  const [mode, setMode] = useState<'view' | 'dispute'>('view');
  const [reason, setReason] = useState<'wrong_score' | 'wrong_winner'>('wrong_score');
  const [loading, setLoading] = useState(false);
  useEffect(() => { setMatch(initialMatch); setDispute(initialDispute); }, [initialDispute, initialMatch]);

  const isPlayerOne = currentUserId === match.player_one_id;
  const opponent = isPlayerOne ? match.player_two : match.player_one;
  const reporter = match.reported_by === match.player_one_id ? match.player_one : match.player_two;
  const isReporter = match.reported_by === currentUserId;
  const ready = ['ready', 'active'].includes(match.status);
  const reported = ['result_reported', 'pending_confirmation'].includes(match.status);
  const correction = ['correction_proposed', 'disputed'].includes(match.status);
  const mine = isPlayerOne ? match.player_one_score : match.player_two_score;
  const theirs = isPlayerOne ? match.player_two_score : match.player_one_score;

  useEffect(() => {
    if (mine != null && theirs != null) { setMyScore(mine); setTheirScore(theirs); setWinnerId(match.winner_id || (mine > theirs ? currentUserId : opponent?.id || currentUserId)); }
  }, [currentUserId, match.winner_id, mine, opponent?.id, theirs]);

  useEffect(() => {
    const channel = supabase.channel(`match-row-${match.id}`).on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id.eq.${match.id}` },
      (payload) => { const next=payload.new as Match; setMatch((current)=>({...current,...next})); if(next.status==='confirmed') toast.success('Match confirmed — ratings updated!',{icon:'🎉'}); })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [match.id, supabase]);

  const scorePayload = () => {
    const winnerScore = winnerId === currentUserId ? myScore : theirScore;
    const loserScore = winnerId === currentUserId ? theirScore : myScore;
    const error = validateMatchScore(myScore, theirScore);
    if (error) throw new Error(error);
    if (winnerScore <= loserScore) throw new Error('The selected winner must have the higher score');
    return { winner_id: winnerId, winner_score: winnerScore, loser_score: loserScore };
  };
  const call = async (url: string, body: object) => {
    setLoading(true);
    try { const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); const data=await response.json(); if(!response.ok) throw new Error(data.error||'Request failed'); router.refresh(); return data; }
    catch(error){ toast.error(error instanceof Error?error.message:'Request failed'); throw error; }
    finally{setLoading(false);}
  };
  const submitReport = async () => { try { const result=await call(`/api/matches/${match.id}/report`,scorePayload()); toast.success(result.status==='awaiting_independent_report'?'Report saved privately. Waiting for your opponent.':'Result sent for confirmation'); } catch {} };
  const confirm = async () => { try { const result=await call(`/api/matches/${match.id}/respond`,{action:'confirm'}); const change=isPlayerOne?result.player_one_change:result.player_two_change; toast.success(`Confirmed! ${change>=0?'+':''}${change} ELO`,{icon:'🎉'}); setTimeout(()=>router.push('/dashboard'),1000); } catch {} };
  const propose = async () => { try { await call(`/api/matches/${match.id}/respond`,{action:'dispute',reason,...scorePayload()}); toast.success('Correction sent to the reporter'); setMode('view'); } catch {} };
  const respondCorrection = async (action:'accept'|'reject') => { if(!dispute)return; try{await call(`/api/disputes/${dispute.id}/respond`,{action});toast.success(action==='accept'?'Correction accepted and match finalized':'Sent to an administrator for review');}catch{} };

  const Score = ({ one, two }: { one: number | null; two: number | null }) => <div className="grid grid-cols-2 gap-3 rounded-3xl bg-accent-gray-50 p-5 text-center"><div><p className="truncate text-sm font-bold text-accent-gray-500">{match.player_one?.display_name}</p><p className="text-5xl font-black text-primary-purple">{one}</p></div><div><p className="truncate text-sm font-bold text-accent-gray-500">{match.player_two?.display_name}</p><p className="text-5xl font-black text-primary-purple">{two}</p></div></div>;

  return <main className="min-h-screen bg-accent-gray-50 px-4 py-6"><div className="mx-auto max-w-xl"><header className="mb-6"><p className="text-sm font-bold text-primary-purple">Ranked match</p><h1 className="text-3xl font-black">You vs {opponent?.display_name}</h1></header>
    {match.status==='confirmed'&&<section className="rounded-3xl border-2 border-green-300 bg-white p-6 shadow-lg"><p className="font-black uppercase text-green-700">Result confirmed</p><div className="mt-4"><Score one={match.player_one_score} two={match.player_two_score}/></div><div className="mt-5 flex items-center justify-between rounded-2xl bg-green-50 p-4"><span className="font-bold">Your rating change</span><span className={`text-2xl font-black ${(isPlayerOne?match.player_one_elo_change:match.player_two_elo_change)!>=0?'text-green-600':'text-red-600'}`}>{(isPlayerOne?match.player_one_elo_change:match.player_two_elo_change)!>=0?'+':''}{isPlayerOne?match.player_one_elo_change:match.player_two_elo_change}</span></div></section>}
    {(ready || (match.status==='awaiting_independent_report'&&!hasSubmitted))&&<section><h2 className="text-2xl font-black">Report the result</h2>{match.verification_mode==='dual'&&<p className="mt-2 rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-800">Independent verification is required. Your opponent cannot see this report before submitting theirs.</p>}<div className="mt-5 grid grid-cols-2 gap-3">{[{id:currentUserId,label:'I won'},{id:opponent?.id||'',label:`${opponent?.display_name} won`}].map(c=><button key={c.id} onClick={()=>setWinnerId(c.id)} className={`min-h-14 rounded-2xl border-2 font-black ${winnerId===c.id?'border-primary-purple bg-primary-purple/10 text-primary-purple':'border-accent-gray-200 bg-white'}`}>{c.label}</button>)}</div><div className="mt-4 grid gap-3 sm:grid-cols-2"><ScoreStepper label="You" value={myScore} onChange={setMyScore}/><ScoreStepper label={opponent?.display_name||'Opponent'} value={theirScore} onChange={setTheirScore}/></div><button onClick={submitReport} disabled={loading} className="mt-5 min-h-14 w-full rounded-2xl gradient-purple text-lg font-black text-white disabled:opacity-50">{loading?'Submitting…':'Submit Result'}</button></section>}
    {match.status==='awaiting_independent_report'&&hasSubmitted&&<section className="rounded-3xl bg-white p-8 text-center shadow"><p className="text-4xl">🔒</p><h2 className="mt-3 text-2xl font-black">Report saved privately</h2><p className="mt-2 text-accent-gray-500">Waiting for {opponent?.display_name} to submit independently.</p></section>}
    {reported&&<section className="rounded-3xl bg-white p-6 shadow-lg"><p className="text-sm font-black uppercase text-primary-purple">{isReporter?'Waiting for confirmation':'Result needs your confirmation'}</p><p className="mt-2 text-accent-gray-600">{reporter?.display_name} reported:</p><div className="mt-4"><Score one={match.player_one_score} two={match.player_two_score}/></div>{isReporter?<p className="mt-5 rounded-2xl bg-blue-50 p-4 text-center font-bold text-blue-700">Waiting for {opponent?.display_name}</p>:mode==='view'?<div className="mt-5 space-y-3"><button onClick={confirm} disabled={loading} className="min-h-14 w-full rounded-2xl bg-green-600 text-lg font-black text-white disabled:opacity-50">{loading?'Confirming…':'Confirm Result'}</button><button onClick={()=>setMode('dispute')} className="min-h-12 w-full font-bold text-red-600">Dispute Result</button></div>:<div className="mt-5"><h2 className="text-xl font-black">What’s incorrect?</h2><div className="mt-3 grid grid-cols-2 gap-3"><button onClick={()=>setReason('wrong_score')} className={`min-h-12 rounded-xl border-2 font-bold ${reason==='wrong_score'?'border-red-500 bg-red-50 text-red-700':'border-accent-gray-200'}`}>Wrong score</button><button onClick={()=>setReason('wrong_winner')} className={`min-h-12 rounded-xl border-2 font-bold ${reason==='wrong_winner'?'border-red-500 bg-red-50 text-red-700':'border-accent-gray-200'}`}>Wrong winner</button></div><div className="mt-3 grid grid-cols-2 gap-3">{[{id:currentUserId,label:'I won'},{id:opponent?.id||'',label:`${opponent?.display_name} won`}].map(c=><button key={c.id} onClick={()=>setWinnerId(c.id)} className={`min-h-12 rounded-xl border-2 font-bold ${winnerId===c.id?'border-primary-purple bg-primary-purple/10':'border-accent-gray-200'}`}>{c.label}</button>)}</div><div className="mt-3 grid gap-3 sm:grid-cols-2"><ScoreStepper label="You" value={myScore} onChange={setMyScore}/><ScoreStepper label={opponent?.display_name||'Opponent'} value={theirScore} onChange={setTheirScore}/></div><button onClick={propose} disabled={loading} className="mt-4 min-h-14 w-full rounded-2xl bg-red-600 font-black text-white">Propose Correction</button><button onClick={()=>setMode('view')} className="min-h-12 w-full font-bold text-accent-gray-500">Cancel</button></div>}</section>}
    {correction&&dispute&&<section className="rounded-3xl bg-white p-6 shadow-lg"><p className="text-sm font-black uppercase text-amber-700">Correction proposed</p><div className="mt-4 space-y-4"><div><p className="mb-2 text-sm font-bold text-accent-gray-500">Original</p><Score one={dispute.original_player_one_score} two={dispute.original_player_two_score}/></div><div><p className="mb-2 text-sm font-bold text-accent-gray-500">Proposed</p><Score one={dispute.proposed_player_one_score} two={dispute.proposed_player_two_score}/></div></div>{isReporter?<div className="mt-5 space-y-3"><button onClick={()=>respondCorrection('accept')} disabled={loading} className="min-h-14 w-full rounded-2xl bg-green-600 font-black text-white">Accept Correction</button><button onClick={()=>respondCorrection('reject')} disabled={loading} className="min-h-12 w-full rounded-2xl border-2 border-red-400 font-bold text-red-600">Still Disagree</button></div>:<p className="mt-5 rounded-2xl bg-amber-50 p-4 text-center font-bold text-amber-800">Waiting for the original reporter.</p>}</section>}
    {match.status==='admin_review'&&<section className="rounded-3xl border-2 border-amber-300 bg-amber-50 p-7 text-center"><p className="text-4xl">⚖️</p><h2 className="mt-3 text-2xl font-black">Admin review</h2><p className="mt-2 text-amber-800">The result is frozen while a club administrator reviews both claims. No rating has changed.</p></section>}
    {['expired','auto_expired','voided'].includes(match.status)&&<section className="rounded-3xl bg-white p-7 text-center"><h2 className="text-2xl font-black">Match closed</h2><p className="mt-2 text-accent-gray-500">No rating or record changes were applied.</p></section>}
  </div></main>;
}
