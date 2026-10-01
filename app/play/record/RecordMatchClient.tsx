'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Profile } from '@/lib/types';
import { validateMatchScore } from '@/lib/match-result';
import ScoreStepper from '@/components/ScoreStepper';

interface Props { user: Profile; players: Profile[]; recentIds: string[]; initialOpponentId: string | null }

export default function RecordMatchClient({ user, players, recentIds, initialOpponentId }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(initialOpponentId ? 2 : 1);
  const [query, setQuery] = useState('');
  const [opponentId, setOpponentId] = useState(initialOpponentId || '');
  const [winnerId, setWinnerId] = useState(user.id);
  const [myScore, setMyScore] = useState(11);
  const [theirScore, setTheirScore] = useState(9);
  const [requestId] = useState(() => crypto.randomUUID());
  const [loading, setLoading] = useState(false);
  const [duplicateId, setDuplicateId] = useState<string | null>(null);
  const opponent = players.find((player) => player.id === opponentId);
  const ordered = useMemo(() => [...players].sort((a, b) => {
    const ai = recentIds.indexOf(a.id), bi = recentIds.indexOf(b.id);
    if (ai >= 0 || bi >= 0) return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
    return b.current_elo - a.current_elo;
  }).filter((player) => player.display_name.toLowerCase().includes(query.toLowerCase())), [players, query, recentIds]);

  const submit = async (allowDuplicate = false) => {
    if (!opponent) return;
    const winnerScore = winnerId === user.id ? myScore : theirScore;
    const loserScore = winnerId === user.id ? theirScore : myScore;
    const error = validateMatchScore(myScore, theirScore);
    if (error) return toast.error(error);
    if (winnerScore <= loserScore) return toast.error('The selected winner must have the higher score');
    setLoading(true);
    try {
      const response = await fetch('/api/matches', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opponent_id: opponent.id, winner_id: winnerId, winner_score: winnerScore,
          loser_score: loserScore, request_id: requestId, allow_duplicate: allowDuplicate }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not record match');
      if (result.potential_duplicate) { setDuplicateId(result.existing_match_id); return; }
      toast.success(result.status === 'confirmed' ? 'Match confirmed!' : 'Result sent for confirmation');
      router.push(`/match/${result.match_id}`); router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not record match'); }
    finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen bg-accent-gray-50 px-4 py-6">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex items-center justify-between"><Link href={step === 1 ? '/play' : '#'} onClick={(e) => { if (step > 1) { e.preventDefault(); setStep(step - 1); } }} className="rounded-full bg-white px-4 py-2 font-bold text-accent-gray-700">← Back</Link><span className="text-sm font-bold text-primary-purple">Step {step} of 3</span></div>
        {step === 1 && <section><h1 className="text-3xl font-black">Who did you play?</h1><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search players" autoFocus className="mt-5 h-14 w-full rounded-2xl border-2 border-accent-gray-200 bg-white px-5 text-lg focus:border-primary-purple focus:outline-none" /><div className="mt-4 space-y-3">{ordered.map((player) => <button key={player.id} onClick={() => { setOpponentId(player.id); setStep(2); }} className="flex min-h-16 w-full items-center justify-between rounded-2xl border-2 border-accent-gray-200 bg-white p-4 text-left active:scale-[.99]"><span><span className="block font-black">{player.display_name}</span><span className="text-sm text-accent-gray-500">{player.current_elo} ELO · {player.total_wins}-{player.total_losses}</span></span>{recentIds.includes(player.id) && <span className="rounded-full bg-primary-purple/10 px-3 py-1 text-xs font-bold text-primary-purple">Recent</span>}</button>)}</div></section>}
        {step === 2 && opponent && <section><h1 className="text-3xl font-black">Who won?</h1><p className="mt-2 text-accent-gray-600">Choose the winner of your match.</p><div className="mt-6 grid grid-cols-2 gap-4">{[{ id: user.id, name: 'Me' }, { id: opponent.id, name: opponent.display_name }].map((choice) => <button key={choice.id} onClick={() => { setWinnerId(choice.id); setStep(3); }} className={`min-h-36 rounded-3xl border-2 p-5 text-xl font-black ${winnerId === choice.id ? 'border-primary-purple bg-primary-purple/10 text-primary-purple' : 'border-accent-gray-200 bg-white'}`}>{choice.id === user.id ? '🙋' : '🏓'}<span className="mt-3 block">{choice.name}</span></button>)}</div></section>}
        {step === 3 && opponent && <section><h1 className="text-3xl font-black">Final score</h1><p className="mt-2 text-accent-gray-600">First to 11, win by two.</p><div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"><ScoreStepper label="You" value={myScore} onChange={setMyScore} /><ScoreStepper label={opponent.display_name} value={theirScore} onChange={setTheirScore} /></div><div className="mt-5 rounded-2xl bg-primary-purple/5 p-4 text-center font-bold"><span className="text-primary-purple">{winnerId === user.id ? 'You' : opponent.display_name}</span> won {Math.max(myScore, theirScore)}–{Math.min(myScore, theirScore)}</div><button onClick={() => submit()} disabled={loading} className="mt-5 min-h-14 w-full rounded-2xl gradient-purple text-lg font-black text-white shadow-lg disabled:opacity-50">{loading ? 'Submitting…' : 'Submit Result'}</button></section>}
        {duplicateId && <div role="dialog" aria-modal="true" className="fixed inset-0 z-[60] flex items-end bg-black/40 p-4 sm:items-center sm:justify-center"><div className="w-full max-w-md rounded-3xl bg-white p-6"><h2 className="text-2xl font-black">Possible duplicate</h2><p className="mt-2 text-accent-gray-600">This looks like a result recorded in the last five minutes.</p><div className="mt-5 space-y-3"><Link href={`/match/${duplicateId}`} className="block min-h-12 rounded-xl bg-accent-gray-100 p-3 text-center font-bold">View existing match</Link><button onClick={() => { setDuplicateId(null); submit(true); }} className="min-h-12 w-full rounded-xl bg-primary-purple text-white font-bold">Record another match</button><button onClick={() => setDuplicateId(null)} className="min-h-12 w-full font-bold text-accent-gray-500">Cancel</button></div></div></div>}
      </div>
    </main>
  );
}
