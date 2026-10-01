import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function PlayPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-accent-gray-50 to-primary-purple/5 px-4 py-7 sm:py-12">
      <div className="mx-auto max-w-xl">
        <p className="text-sm font-bold uppercase tracking-widest text-primary-purple">Ready to play?</p>
        <h1 className="mt-2 text-4xl font-black text-accent-black">Choose how to start</h1>
        <p className="mt-2 text-accent-gray-600">Record a game you just played or challenge someone for the next one.</p>
        <div className="mt-8 space-y-4">
          <Link href="/play/record" className="block rounded-3xl gradient-purple p-7 text-white shadow-xl transition active:scale-[.98]">
            <span className="text-4xl">🏓</span><h2 className="mt-4 text-2xl font-black">Record Match</h2>
            <p className="mt-1 text-white/85">Choose your opponent, winner, and score.</p>
          </Link>
          <Link href="/players" className="block rounded-3xl border-2 border-primary-purple/20 bg-white p-7 shadow-lg transition active:scale-[.98]">
            <span className="text-4xl">🎯</span><h2 className="mt-4 text-2xl font-black text-accent-black">Challenge Player</h2>
            <p className="mt-1 text-accent-gray-600">Find a club member and send a challenge.</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
