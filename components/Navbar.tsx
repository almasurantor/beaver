'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useStore } from '@/store/useStore';
import { useEffect, useMemo, useState } from 'react';
import { Profile } from '@/lib/types';

const icons: Record<string, React.ReactNode> = {
  home: <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10.5Z" />,
  leaderboard: <path d="M4 20V10h4v10H4Zm6 0V4h4v16h-4Zm6 0v-7h4v7h-4Z" />,
  play: <path d="m9 7 8 5-8 5V7Z" />,
  players: <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m7-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />,
  profile: <><circle cx="12" cy="8" r="4" /><path d="M4 22a8 8 0 0 1 16 0" /></>,
};

function NavIcon({ name }: { name: string }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icons[name]}</svg>;
}

export default function Navbar() {
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);
  const { user, setUser } = useStore();
  const [profile, setProfile] = useState<Profile | null>(user);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: row } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
      if (mounted && row) { setProfile(row as Profile); setUser(row as Profile); }
    });
    return () => { mounted = false; };
  }, [setUser, supabase]);

  const profileHref = profile ? `/profile/${profile.id}` : '/dashboard';
  const items = [
    { href: '/dashboard', label: 'Home', icon: 'home' },
    { href: '/leaderboard', label: 'Leaderboard', icon: 'leaderboard' },
    { href: '/play', label: 'Play', icon: 'play', primary: true },
    { href: '/players', label: 'Players', icon: 'players' },
    { href: profileHref, label: 'Profile', icon: 'profile' },
  ];
  const active = (href: string) => href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <>
      <nav className="glass-effect sticky top-0 z-40 hidden border-b border-accent-gray-200 sm:block">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/dashboard" className="flex items-center gap-1" aria-label="Beaver Smash home">
            <Image src="/beaver-logo.png" alt="" width={34} height={34} className="object-contain" priority />
            <span className="text-xl font-black gradient-text">SMASH</span>
          </Link>
          <div className="flex items-center gap-7">
            {items.map((item) => <Link key={item.label} href={item.href}
              className={`text-sm font-bold transition ${active(item.href) ? 'text-primary-purple' : 'text-accent-gray-600 hover:text-primary-purple'} ${item.primary ? 'rounded-full bg-primary-purple px-5 py-2.5 text-white hover:text-white' : ''}`}>
              {item.label}
            </Link>)}
          </div>
        </div>
      </nav>
      <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-50 border-t border-accent-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur sm:hidden">
        <div className="grid h-[4.5rem] grid-cols-5 items-end px-[max(0.25rem,env(safe-area-inset-left))] pr-[max(0.25rem,env(safe-area-inset-right))]">
          {items.map((item) => (
            <Link key={item.label} href={item.href} aria-current={active(item.href) ? 'page' : undefined}
              className={`relative flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-bold ${active(item.href) ? 'text-primary-purple' : 'text-accent-gray-500'} ${item.primary ? '-mt-5' : ''}`}>
              <span className={item.primary ? 'flex h-14 w-14 items-center justify-center rounded-full gradient-purple text-white shadow-purple-glow' : ''}><NavIcon name={item.icon} /></span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
