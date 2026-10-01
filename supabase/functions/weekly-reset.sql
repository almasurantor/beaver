-- This function should be set up as a Supabase Edge Function or Cron Job
-- To set up as a cron job in Supabase:
-- 1. Go to Database > Cron Jobs
-- 2. Create a new cron job with:
--    - Schedule: 0 0 * * 0 (Every Sunday at midnight UTC)
--    - Function: reset_weekly_stats()

-- The function is already defined in schema.sql
-- This file is for reference/documentation

-- To manually trigger the reset:
SELECT reset_weekly_stats();
