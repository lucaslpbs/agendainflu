-- US-005: Configure RLS policies for all tables
-- Adds missing client-facing policies and DELETE policies

-- 1. Clients can SELECT their own records via user_id
DROP POLICY IF EXISTS "Clients can view own client records" ON public.clients;
CREATE POLICY "Clients can view own client records" ON public.clients
  FOR SELECT USING (auth.uid() = user_id);

-- 2. Clients can SELECT their own bookings via client_id relationship
DROP POLICY IF EXISTS "Clients can view own bookings" ON public.bookings;
CREATE POLICY "Clients can view own bookings" ON public.bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = bookings.client_id
        AND clients.user_id = auth.uid()
    )
  );

-- 3. DELETE policy for influencers (own profile only)
DROP POLICY IF EXISTS "Influencers can delete own profile" ON public.influencers;
CREATE POLICY "Influencers can delete own profile" ON public.influencers
  FOR DELETE USING (auth.uid() = user_id);

-- 4. DELETE policy for influencers by admin
DROP POLICY IF EXISTS "Admins can delete influencers" ON public.influencers;
CREATE POLICY "Admins can delete influencers" ON public.influencers
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- 5. DELETE policy for services (already covered by FOR ALL, adding explicit for clarity)
DROP POLICY IF EXISTS "Influencers can delete own services" ON public.services;
CREATE POLICY "Influencers can delete own services" ON public.services
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.influencers
      WHERE influencers.id = services.influencer_id
        AND influencers.user_id = auth.uid()
    )
  );

-- 6. DELETE policy for availability (already covered by FOR ALL, adding explicit for clarity)
DROP POLICY IF EXISTS "Influencers can delete own availability" ON public.availability;
CREATE POLICY "Influencers can delete own availability" ON public.availability
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.influencers
      WHERE influencers.id = availability.influencer_id
        AND influencers.user_id = auth.uid()
    )
  );

-- 7. DELETE policy for client_profiles
DROP POLICY IF EXISTS "Users can delete own client profile" ON public.client_profiles;
CREATE POLICY "Users can delete own client profile" ON public.client_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- 8. Admin DELETE for client_profiles (already covered by FOR ALL, adding explicit for clarity)
DROP POLICY IF EXISTS "Admins can delete client profiles" ON public.client_profiles;
CREATE POLICY "Admins can delete client profiles" ON public.client_profiles
  FOR DELETE USING (has_role(auth.uid(), 'admin'));
