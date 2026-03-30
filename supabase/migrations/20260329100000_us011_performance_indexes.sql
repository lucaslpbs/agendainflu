-- US-011: Create database indexes for performance
-- All indexes use IF NOT EXISTS for idempotency

-- clients indexes
CREATE INDEX IF NOT EXISTS idx_clients_influencer_id ON public.clients(influencer_id);
CREATE INDEX IF NOT EXISTS idx_clients_whatsapp_influencer_id ON public.clients(whatsapp, influencer_id);

-- UNIQUE constraint: one client per (influencer_id, whatsapp) pair
-- Using a unique index instead of ALTER TABLE to support IF NOT EXISTS
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_influencer_whatsapp_unique ON public.clients(influencer_id, whatsapp);

-- bookings indexes
CREATE INDEX IF NOT EXISTS idx_bookings_influencer_id ON public.bookings(influencer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON public.bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON public.bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_data_agendada ON public.bookings(data_agendada);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_influencer_data ON public.bookings(influencer_id, data_agendada);

-- services indexes
CREATE INDEX IF NOT EXISTS idx_services_influencer_id ON public.services(influencer_id);
CREATE INDEX IF NOT EXISTS idx_services_ativo ON public.services(ativo);

-- availability indexes
-- Note: UNIQUE(influencer_id, data) already exists from table creation, which covers this composite index

-- influencers indexes
CREATE INDEX IF NOT EXISTS idx_influencers_status ON public.influencers(status);

-- waitlist indexes
CREATE INDEX IF NOT EXISTS idx_waitlist_influencer_id ON public.waitlist(influencer_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON public.waitlist(status);

-- user_roles indexes
-- Note: UNIQUE(user_id, role) already exists, which covers user_id lookups
-- Adding a standalone user_id index for queries that only filter by user_id
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
