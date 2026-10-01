-- This function should be set up as a Supabase Edge Function or Cron Job
-- To set up as a cron job in Supabase:
-- 1. Go to Database > Cron Jobs
-- 2. Create a new cron job with:
--    - Schedule: */5 * * * * (Every 5 minutes)
--    - Function: expire_old_challenges()

-- The function is already defined in schema.sql
-- This file is for reference/documentation

-- To manually trigger:
SELECT expire_old_challenges();
