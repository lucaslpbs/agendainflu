
-- Fix bookings insert policy to require authentication
DROP POLICY IF EXISTS "Clients can create bookings" ON public.bookings;
CREATE POLICY "Authenticated users can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
