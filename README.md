# Beaver Smash - CCNY Table Tennis Club Ladder System

A ranked 1v1 ELO-based ladder system with weekly leaderboards for the CCNY Table Tennis Club.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Framer Motion
- Supabase (Auth + PostgreSQL + Realtime)
- Zustand

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
# Add your Supabase credentials
```

3. Set up the database using the staged instructions in `SETUP.md`. Existing installations must run the expand migration, deploy this application, and only then run the contract migration.

4. Run the development server:
```bash
npm run dev
```

## Features

- ELO-based ranking system
- Challenge system with expiration
- Single-player result reporting with opponent confirmation or dispute
- Spontaneous match recording without a challenge
- Calendar-week leaderboards backed by immutable weekly rows
- Real-time updates
- Match history tracking
- Disputes, admin review, rating-event history, and player trust controls

## Install on a phone

Beaver Smash includes an App Router web manifest, branded PWA icons, standalone display metadata, safe-area layout support, and a conservative service worker. Live Supabase pages are always network-first; only the static offline explanation and app icons are cached.

On iPhone, open the deployed HTTPS site in Safari, tap **Share**, choose **Add to Home Screen**, confirm the name **Beaver Smash**, and tap **Add**. Launching that icon opens the site in a standalone window. On supported Android browsers, use **Install App** or **Add to Home Screen** from the browser menu.

For Vercel, configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and add `https://YOUR_DOMAIN/auth/callback` to the Supabase Auth redirect allowlist. Verify `/manifest.webmanifest`, `/sw.js`, `/icon.png`, and `/apple-icon.png` after deployment.
