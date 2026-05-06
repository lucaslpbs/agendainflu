-- US-040: Create reviews table with RLS policies

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE UNIQUE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  texto TEXT,
  criado_em TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_reviews_influencer_id ON reviews(influencer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);

-- Public read access
DROP POLICY IF EXISTS "Anyone can read reviews" ON public.reviews;
CREATE POLICY "Anyone can read reviews" ON public.reviews
  FOR SELECT USING (true);

-- Clients can insert only for their own completed bookings
DROP POLICY IF EXISTS "Clients can insert reviews for own completed bookings" ON public.reviews;
CREATE POLICY "Clients can insert reviews for own completed bookings" ON public.reviews
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN clients c ON c.id = b.client_id
      WHERE b.id = booking_id
        AND b.status = 'concluido'
        AND c.user_id = auth.uid()
    )
  );
