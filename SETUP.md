# Beaver Smash Setup Guide

## Prerequisites

- Node.js 18+ installed
- Supabase account and project

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

1. Create a new Supabase project at https://supabase.com
2. Go to Project Settings > API to get your credentials
3. Copy `.env.local.example` to `.env.local` and fill in:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Step 3: Database Setup and Rollout

For an existing Beaver Smash project:

1. Export `profiles`, `matches`, and `challenges` before changing the schema.
2. Run `supabase/migrations/20261001_01_expand_mobile_ranking.sql` in the Supabase SQL Editor.
3. Verify profile ratings/records and the confirmed-match count are unchanged.
4. Deploy this compatible application and smoke-test reporting, confirmation, leaderboard, profile, and admin reads.
5. Run `supabase/migrations/20261001_02_contract_mobile_ranking.sql` only after the compatible deployment is live.

The expand migration is retry-safe, keeps the legacy columns/statuses during rollout, creates audited opening-balance events, and bootstraps `almasurantor` using profile UUID `494357c8-607e-4605-980b-19260c8a2cfc` as the first administrator. The old `migration_single_reporter_match_flow.sql` is superseded and must not be applied.

For a brand-new project, provision the legacy base schema from `supabase/schema.sql`, then immediately apply both staged migrations before exposing the app to users.

## Step 4: Set Up Authentication

1. In Supabase Dashboard, go to Authentication > Providers
2. Enable Email provider
3. Enable Google OAuth (optional but recommended):
   - Add your Google OAuth credentials
   - Add authorized redirect URL: `http://localhost:3000/auth/callback` (for dev)
   - Add production URL when deploying

## Step 5: Schedule Expiration

Call `expire_mobile_ranking_items_v2()` from a trusted scheduled worker or Supabase Edge Function (for example, every five minutes). It expires stale challenges and unconfirmed results without changing ratings or trust. The live project does not currently have `pg_cron`, so scheduling is intentionally external.

Weekly records do not need a reset job. `weekly_player_stats` stores one row per player and New York club week.

## Step 6: Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Step 7: Create Your First User

1. Go to `/login`
2. Sign up with email/password or Google
3. Your profile will be automatically created

## Features

- ✅ ELO-based ranking system
- ✅ Challenge system with 24-hour expiration
- ✅ Single-player result reporting with opponent confirmation or dispute
- ✅ Daily ranked-match limit (20 per unordered pair)
- ✅ Calendar-week leaderboards without destructive resets
- ✅ Real-time updates via Supabase Realtime
- ✅ Match history tracking

## Notes

- Default ELO: 1000
- K-factor: 32
- Score margin does not affect ELO; one rounded winner delta is applied as the exact inverse to the loser
- Challenges and unconfirmed reports expire after 24 hours
- Native push delivery is not integrated; `domain_events` and `notifications` prepare the server-side delivery queue
