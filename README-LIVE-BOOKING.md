# Art by 21 — live bookings

This version uses Supabase so booked times are shared between all visitors.

## Setup
1. Create a Supabase project.
2. Open SQL Editor and run `supabase.sql`.
3. In Supabase Project Settings > API, copy the Project URL and the anon/publishable key.
4. Open `script.js` and replace:
   - `YOUR_SUPABASE_URL`
   - `YOUR_SUPABASE_ANON_KEY`
5. Upload the updated files to the GitHub repository.

Booking times:
15:00, 17:00, 19:00, 21:00, every day, separately for Toma and Albert.

The database has a unique constraint on barber + date + time, so two people cannot successfully reserve the same slot at the same time.
