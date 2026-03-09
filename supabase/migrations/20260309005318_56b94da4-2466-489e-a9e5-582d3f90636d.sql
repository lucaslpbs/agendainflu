-- Drop all existing RESTRICTIVE policies and recreate as PERMISSIVE

-- user_roles
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- influencers
DROP POLICY IF EXISTS "Public profiles visible when active" ON public.influencers;
DROP POLICY IF EXISTS "Users can insert own influencer profile" ON public.influencers;
DROP POLICY IF EXISTS "Influencers can update own profile" ON public.influencers;
DROP POLICY IF EXISTS "Admins can update any influencer" ON public.influencers;

CREATE POLICY "Public profiles visible when active" ON public.influencers
  FOR SELECT USING (status = 'ativa' OR auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own influencer profile" ON public.influencers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Influencers can update own profile" ON public.influencers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any influencer" ON public.influencers
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- services
DROP POLICY IF EXISTS "Public services visible for active influencers" ON public.services;
DROP POLICY IF EXISTS "Influencers can manage own services" ON public.services;

CREATE POLICY "Public services visible for active influencers" ON public.services
  FOR SELECT USING (
    (ativo = true AND EXISTS (SELECT 1 FROM influencers WHERE influencers.id = services.influencer_id AND influencers.status = 'ativa'))
    OR EXISTS (SELECT 1 FROM influencers WHERE influencers.id = services.influencer_id AND influencers.user_id = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Influencers can manage own services" ON public.services
  FOR ALL USING (EXISTS (SELECT 1 FROM influencers WHERE influencers.id = services.influencer_id AND influencers.user_id = auth.uid()));

-- clients
DROP POLICY IF EXISTS "Influencers can view own clients" ON public.clients;
DROP POLICY IF EXISTS "Influencers can manage own clients" ON public.clients;

CREATE POLICY "Influencers can view own clients" ON public.clients
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM influencers WHERE influencers.id = clients.influencer_id AND influencers.user_id = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Influencers can manage own clients" ON public.clients
  FOR ALL USING (
    EXISTS (SELECT 1 FROM influencers WHERE influencers.id = clients.influencer_id AND influencers.user_id = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

-- bookings
DROP POLICY IF EXISTS "Influencers can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Influencers can manage own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Authenticated users can create bookings" ON public.bookings;

CREATE POLICY "Influencers can view own bookings" ON public.bookings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM influencers WHERE influencers.id = bookings.influencer_id AND influencers.user_id = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Influencers can manage own bookings" ON public.bookings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM influencers WHERE influencers.id = bookings.influencer_id AND influencers.user_id = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Authenticated users can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- availability
DROP POLICY IF EXISTS "Public availability for active influencers" ON public.availability;
DROP POLICY IF EXISTS "Influencers can manage own availability" ON public.availability;

CREATE POLICY "Public availability for active influencers" ON public.availability
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM influencers WHERE influencers.id = availability.influencer_id AND influencers.status = 'ativa')
    OR EXISTS (SELECT 1 FROM influencers WHERE influencers.id = availability.influencer_id AND influencers.user_id = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Influencers can manage own availability" ON public.availability
  FOR ALL USING (EXISTS (SELECT 1 FROM influencers WHERE influencers.id = availability.influencer_id AND influencers.user_id = auth.uid()));

-- waitlist
DROP POLICY IF EXISTS "Anyone can insert into waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Influencers can view own waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Influencers can update own waitlist" ON public.waitlist;

CREATE POLICY "Anyone can insert into waitlist" ON public.waitlist
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Influencers can view own waitlist" ON public.waitlist
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM influencers WHERE influencers.id = waitlist.influencer_id AND influencers.user_id = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Influencers can update own waitlist" ON public.waitlist
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM influencers WHERE influencers.id = waitlist.influencer_id AND influencers.user_id = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

-- influencer_analysis
DROP POLICY IF EXISTS "Influencers can view own analysis" ON public.influencer_analysis;
DROP POLICY IF EXISTS "Admins can manage analysis" ON public.influencer_analysis;

CREATE POLICY "Influencers can view own analysis" ON public.influencer_analysis
  FOR SELECT USING (EXISTS (SELECT 1 FROM influencers WHERE influencers.id = influencer_analysis.influencer_id AND influencers.user_id = auth.uid()));

CREATE POLICY "Admins can manage analysis" ON public.influencer_analysis
  FOR ALL USING (has_role(auth.uid(), 'admin'));