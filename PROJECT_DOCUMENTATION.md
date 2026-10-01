# Beaver Smash — Full Project Documentation

## 1. Project Purpose

Beaver Smash is a competitive table tennis club app built for the CCNY Table Tennis Club. Its purpose is to give members a structured, game-based ladder system where players can:

- create accounts and sign in
- challenge each other directly
- submit match results
- confirm or dispute reported results
- see live ELO rankings
- track weekly performance
- browse profiles and match history

At a high level, this is a club ladder app: it turns casual play into a measurable ranking system with rules, stats, and real-time feedback.

---

## 2. Product Summary

The app is a Next.js web application using Supabase for authentication, relational storage, and realtime updates. The main competitive mechanic is an ELO-based rating system. Players are ranked by total ELO, while a separate weekly leaderboard tracks wins and losses during the current week.

The project is designed around a club competition loop:

1. Player signs in
2. Player challenges another club member
3. Challenge is accepted and a match is created, or a player records a spontaneous match
4. One player reports the final score
5. The opponent confirms or disputes the reported result
6. A confirmed result updates ELO and records; a disputed result returns to the reporter for revision
7. Leaderboards and profiles refresh automatically

---

## 3. Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Supabase Auth + Postgres + Realtime
- Zustand for lightweight app state
- React Hot Toast for feedback

The project combines server-rendered Next.js pages with realtime client-side updates for a modern leaderboard feel.

### Installable web app

The App Router publishes `/manifest.webmanifest` with standalone display mode and Beaver Smash icons. Apple web-app metadata, `viewport-fit=cover`, Dynamic Island/home-indicator safe areas, and a fixed safe-area-aware mobile navigation make the Vercel-hosted site installable from iPhone Safari. A network-first service worker never caches authenticated match or ranking responses; when navigation is unavailable it shows a static reconnect screen.

---

## 4. Core Architecture

### Frontend

The app uses Next.js App Router under the [app](app) folder:

- [app/page.tsx](app/page.tsx) — landing page
- [app/dashboard/page.tsx](app/dashboard/page.tsx) and [app/dashboard/DashboardClient.tsx](app/dashboard/DashboardClient.tsx) — main power center for challenges and active matches
- [app/leaderboard/page.tsx](app/leaderboard/page.tsx) and [app/leaderboard/LeaderboardClient.tsx](app/leaderboard/LeaderboardClient.tsx) — global ELO ranking
- [app/weekly/page.tsx](app/weekly/page.tsx) and [app/weekly/WeeklyClient.tsx](app/weekly/WeeklyClient.tsx) — weekly leaderboard
- [app/match/[id]/page.tsx](app/match/[id]/page.tsx) and [app/match/[id]/MatchClient.tsx](app/match/[id]/MatchClient.tsx) — score submission and match-resolution flow
- [app/profile/[id]/page.tsx](app/profile/[id]/page.tsx) and [app/profile/[id]/ProfileClient.tsx](app/profile/[id]/ProfileClient.tsx) — player stats and match history
- [app/login/page.tsx](app/login/page.tsx) and [app/signup/page.tsx](app/signup/page.tsx) — auth UI

### Backend / Data layer

- [lib/supabase/server.ts](lib/supabase/server.ts) creates a server-side Supabase client
- [lib/supabase/client.ts](lib/supabase/client.ts) creates a browser client
- [lib/supabase/middleware.ts](lib/supabase/middleware.ts) protects routes and refreshes session cookies
- [middleware.ts](middleware.ts) applies session middleware across the app

### Business logic

- [lib/elo.ts](lib/elo.ts) contains ELO calculation logic
- [app/api/matches/[id]/report/route.ts](app/api/matches/[id]/report/route.ts) accepts a complete result from one participant
- [app/api/matches/[id]/respond/route.ts](app/api/matches/[id]/respond/route.ts) handles opponent confirmation or dispute
- [supabase/schema.sql](supabase/schema.sql) defines the database schema and SQL functions

### State management

- [store/useStore.ts](store/useStore.ts) stores the current user profile in Zustand

---

## 5. Data Model

The primary persistent entities are defined in [supabase/schema.sql](supabase/schema.sql) and represented in [lib/types.ts](lib/types.ts).

### profiles

This table extends Supabase auth users and stores per-player stats.

Key fields:

- id — UUID, linked to auth.users
- display_name — user-facing name
- current_elo — total rating, initial value 1000
- total_wins / total_losses — lifetime record
- weekly_wins / weekly_losses — this week’s record
- created_at / updated_at

### challenges

Players can send challenges to one another.

Fields:

- id
- challenger_id
- opponent_id
- status — pending, accepted, declined, expired, completed
- created_at
- expires_at

The schema enforces no self-challenge and a unique pending challenge pair between two players.

### matches

Matches are created when a challenge is accepted.

Fields include:

- id
- challenge_id
- player_one_id / player_two_id
- player_one_score / player_two_score
- status — ready, result_reported, awaiting_independent_report, correction_proposed, admin_review, confirmed, expired, voided
- source / ranked / winner_id / verification_mode / request_id / season_id
- reported_by / reported_at — the participant who entered both scores and when
- confirmed_by — the opponent who accepted the result
- disputed_by / disputed_at / dispute_reason — dispute audit information
- expires_at
- player_one_elo_before / player_two_elo_before
- player_one_elo_change / player_two_elo_change
- confirmed_at
- created_at

### match_history

This is a SQL view that exposes confirmed match results for easier history queries and profile pages.

---

## 6. Main Business Flow

### A. Authentication

Users sign up through [app/signup/page.tsx](app/signup/page.tsx) or log in through [app/login/page.tsx](app/login/page.tsx). The app uses Supabase Auth, and [app/auth/callback/route.ts](app/auth/callback/route.ts) handles OAuth redirect completion.

Route protection is enforced via [middleware.ts](middleware.ts) + [lib/supabase/middleware.ts](lib/supabase/middleware.ts): unauthenticated users are redirected to /login unless they are on the public home page or auth-related routes.

### B. Dashboard and challenge workflow

The dashboard in [app/dashboard/DashboardClient.tsx](app/dashboard/DashboardClient.tsx) is the center of the product.

From there, the user can:

- view all players ranking by ELO
- see pending challenges sent to or from them
- accept or decline incoming challenges
- cancel their own pending challenges
- see active matches in progress
- open any match page to submit a result

A challenge is inserted into the challenges table and the dashboard subscribes to realtime updates for challenge changes.

### C. Match submission and validation

The match screen in [app/match/[id]/MatchClient.tsx](app/match/[id]/MatchClient.tsx) allows either participant to report both players' final scores. For an accepted challenge, either player can report. A player may also create a spontaneous match from the dashboard without first creating a challenge.

The app enforces table tennis-style rules:

- at least one player must reach 11
- if both players are 10 or below, the match is invalid
- the winner must lead by at least two points
- after 10–10, play continues until one player leads by exactly 2
- no tied scores are allowed

Reporting stores the reporter identity and opens a confirmation window. Match fields are changed through role-aware database functions rather than direct browser updates.

### D. Confirmation and dispute handling

After a report, only the non-reporting opponent can respond. Confirming finalizes the stored score. A dispute must include a complete correction. The reporter can accept it or reject it into admin review. Players whose trust setting requires dual verification submit independently without seeing the other claim. An unresolved report can expire without changing either player's rating or record.

### E. Match confirmation and ELO update

When the opponent confirms a reported score, the database transaction:

1. loads both players’ profiles
2. calculates ELO gain/loss using [lib/elo.ts](lib/elo.ts)
3. stores the match result as confirmed
4. records player ELO before/after values and the actual rating delta
5. updates overall and weekly win/loss stats
6. marks the linked challenge complete, when one exists

The row and both player profiles are locked during finalization, so repeated requests cannot apply stats twice.

This is the point where the ladder actually updates.

---

## 7. ELO System

The ranking logic is implemented in [lib/elo.ts](lib/elo.ts).

### Standard ELO formula

The expected score for player A is:

$$
E_A = \frac{1}{1 + 10^{(R_B - R_A)/400}}
$$

Where:

- $R_A$ is player A’s current ELO
- $R_B$ is player B’s current ELO

The app then calculates the actual result as:

- 1 for a win
- 0 for a loss
- 0.5 for a draw

The formula is:

$$
\Delta R = K \times (S - E)
$$

where:

- $K = 32$
- $S$ = actual score result
- $E$ = expected score

The winner delta is rounded once and its exact inverse is applied to the loser, keeping every match zero-sum. Scores are retained for history and validation but never change the rating delta.

---

## 8. Weekly Leaderboard Logic

The weekly leaderboard is separate from the total ladder.

Lifetime totals remain on `profiles`. Weekly results are stored in `weekly_player_stats`, keyed by player and New York club-week, so history is preserved and no destructive reset is required. The weekly view is displayed in [app/weekly/WeeklyClient.tsx](app/weekly/WeeklyClient.tsx).

---

## 9. Realtime Behavior

Realtime is a key UX property of the app.

The dashboard and leaderboard subscribe to Supabase `postgres_changes` events and refresh their local data when records change. This is what makes the app feel live:

- new challenge appears immediately
- accepted challenge updates the active match list
- confirmed matches trigger ELO refresh
- leaderboard standings update without a manual reload

This is implemented in [app/dashboard/DashboardClient.tsx](app/dashboard/DashboardClient.tsx) and [app/leaderboard/LeaderboardClient.tsx](app/leaderboard/LeaderboardClient.tsx).

---

## 10. Database Functions and Rules

The SQL in [supabase/schema.sql](supabase/schema.sql) includes several important rules:

- `check_daily_match_limit` — prevents overplaying between the same two players in one day
- `create_challenge_v2` / `respond_challenge_v2` / `cancel_challenge_v2`
- `create_spontaneous_match_v2` / `submit_match_report_v2`
- `confirm_match_result_v2` — atomically confirms once and applies ELO/stats
- `propose_match_correction_v2` / `respond_match_correction_v2`
- `admin_resolve_dispute_v2` / `admin_set_player_integrity_v2`
- `expire_mobile_ranking_items_v2` — expires unresolved work without changing stats or trust

There are also indexes and unique constraints to prevent duplicate pending challenges and to support fast leaderboard queries.

---

## 11. Project Structure

### Root-level files

- [package.json](package.json) — app scripts and dependencies
- [README.md](README.md) — brief project intro
- [ENV_SETUP.md](ENV_SETUP.md) / [env.local.template](env.local.template) — environment config guidance
- [INSTALL_NODE.md](INSTALL_NODE.md) — installation notes
- [SETUP.md](SETUP.md) — setup steps

### App folders

- [app](app) — pages and route-driven UI
- [components](components) — shared UI pieces like navbar and animation
- [lib](lib) — shared logic and typed models
- [store](store) — Zustand state
- [public](public) — static files and club branding assets
- [supabase](supabase) — schema, migrations, SQL helpers

---

## 12. Current Product Experience

The product feels like a polished club competition app rather than a generic leaderboard. It includes strong UI touches:

- big gradient design
- animated table tennis graphics
- match cards with acceptance/decline actions
- live status banners for reported, disputed, and expired matches
- profile cards and leaderboards showing total and weekly statistics

This is a member-facing experience designed for quick competition and clear status updates.

---

## 13. What the App Is Trying to Solve

The core problem this project addresses is the lack of a clean, club-specific ranked system for table tennis matches. Without something like this, results are hard to track, disputes are messy, and there is no simple ladder or leaderboard to motivate continuous play.

Beaver Smash solves this by building a structured flow around:

- trustable match confirmation
- transparent ELO changes
- active challenge creation
- visible standings
- weekly bragging rights

---

## 14. Key Implementation Notes

A few important observations from reading the codebase:

- The app relies heavily on Supabase for both persistence and realtime behavior.
- ELO is recalculated on the server in the confirm API route, not in the client.
- The database stores authoritative match and stat data; the frontend acts as a display layer plus user-triggered update layer.
- The app is designed around a single-user challenge-and-match loop, not a full admin panel.
- There is a strong emphasis on club-style game flow and quick feedback, which explains the presence of cartoon UI and live notifications.

---

## 15. Risks / Gaps to Be Aware Of

As a codebase summary, a few product/engineering caveats are worth noting:

- There is no dedicated test suite in the repository at the moment.
- Some features rely on database SQL functions and cron jobs being configured correctly in Supabase.
- The app uses environment variables and expects a real Supabase project to be configured.
- A few flows depend on browser timing and states, so they should be tested in a real staging environment before production use.
- The app assumes a club environment where users are authenticated and trusted but still requires match-validation safeguards.

---

## 16. Final Overall Assessment

Beaver Smash is a full-stack club-ranking app for table tennis match competition. It is not just a leaderboard; it is a full lifecycle management system for challenges, match submissions, validation, ELO adjustment, and profile tracking.

The project’s central concept is simple and effective:

- challenge a player
- play a match
- submit scores
- confirm the result
- update ELO and rankings

It is a strong example of a lightweight sports ladder product built with modern web tooling and realtime database features.

---

## 17. Quick File Map

- [app/page.tsx](app/page.tsx) — landing page
- [app/dashboard/DashboardClient.tsx](app/dashboard/DashboardClient.tsx) — main challenge and active-match flow
- [app/leaderboard/LeaderboardClient.tsx](app/leaderboard/LeaderboardClient.tsx) — total ELO rankings
- [app/weekly/WeeklyClient.tsx](app/weekly/WeeklyClient.tsx) — weekly leaderboard
- [app/match/[id]/MatchClient.tsx](app/match/[id]/MatchClient.tsx) — match submission UI
- [app/api/matches/[id]/report/route.ts](app/api/matches/[id]/report/route.ts) — result reporting endpoint
- [app/api/matches/[id]/respond/route.ts](app/api/matches/[id]/respond/route.ts) — confirmation/dispute endpoint
- [lib/elo.ts](lib/elo.ts) — rating algorithm
- [supabase/schema.sql](supabase/schema.sql) — data model and SQL logic
- [store/useStore.ts](store/useStore.ts) — user profile state
- [lib/types.ts](lib/types.ts) — TypeScript interfaces

If you want, the next step can be a more opinionated “engineering deep dive” that focuses on startup flow, data pipelines, and the exact match lifecycle from challenge creation to final ELO update.
