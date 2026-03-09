
-- Enum types
CREATE TYPE public.influencer_status AS ENUM ('em_analise', 'ativa', 'suspensa', 'rejeitada');
CREATE TYPE public.client_status AS ENUM ('ativo', 'espera', 'bloqueado');
CREATE TYPE public.client_origin AS ENUM ('cadastro_manual', 'site', 'whatsapp');
CREATE TYPE public.waitlist_status AS ENUM ('aguardando', 'contatado', 'aprovado', 'rejeitado');
CREATE TYPE public.service_type AS ENUM ('stories', 'reels', 'reels_stories', 'feed', 'presencial');
CREATE TYPE public.service_format AS ENUM ('online', 'presencial');
CREATE TYPE public.booking_status AS ENUM ('pendente', 'confirmado', 'concluido', 'cancelado');
CREATE TYPE public.analysis_result AS ENUM ('aprovado', 'rejeitado', 'pendente');
CREATE TYPE public.app_role AS ENUM ('admin', 'influencer', 'client');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Influencers table
CREATE TABLE public.influencers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  bio TEXT,
  foto_url TEXT,
  nicho TEXT,
  seguidores TEXT,
  instagram_url TEXT,
  whatsapp TEXT,
  status public.influencer_status NOT NULL DEFAULT 'em_analise',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  aprovado_em TIMESTAMPTZ,
  observacoes_admin TEXT
);
ALTER TABLE public.influencers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles visible when active" ON public.influencers
  FOR SELECT USING (status = 'ativa' OR auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Influencers can update own profile" ON public.influencers
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own influencer profile" ON public.influencers
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update any influencer" ON public.influencers
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Clients table
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID REFERENCES public.influencers(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT,
  empresa TEXT,
  instagram TEXT,
  notas TEXT,
  status public.client_status NOT NULL DEFAULT 'ativo',
  origem public.client_origin NOT NULL DEFAULT 'site',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Influencers can view own clients" ON public.clients
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.influencers WHERE id = influencer_id AND user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Influencers can manage own clients" ON public.clients
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.influencers WHERE id = influencer_id AND user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

-- Waitlist table
CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT,
  empresa TEXT,
  mensagem TEXT,
  influencer_id UUID REFERENCES public.influencers(id) ON DELETE SET NULL,
  status public.waitlist_status NOT NULL DEFAULT 'aguardando',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert into waitlist" ON public.waitlist
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Influencers can view own waitlist" ON public.waitlist
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.influencers WHERE id = influencer_id AND user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Influencers can update own waitlist" ON public.waitlist
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.influencers WHERE id = influencer_id AND user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

-- Services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID REFERENCES public.influencers(id) ON DELETE CASCADE NOT NULL,
  tipo public.service_type NOT NULL,
  formato public.service_format NOT NULL DEFAULT 'online',
  preco DECIMAL(10,2) NOT NULL,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  max_por_dia INTEGER DEFAULT 1
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public services visible for active influencers" ON public.services
  FOR SELECT USING (
    ativo = true AND EXISTS (SELECT 1 FROM public.influencers WHERE id = influencer_id AND status = 'ativa')
    OR EXISTS (SELECT 1 FROM public.influencers WHERE id = influencer_id AND user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Influencers can manage own services" ON public.services
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.influencers WHERE id = influencer_id AND user_id = auth.uid())
  );

-- Availability table
CREATE TABLE public.availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID REFERENCES public.influencers(id) ON DELETE CASCADE NOT NULL,
  data DATE NOT NULL,
  slots_disponiveis INTEGER NOT NULL DEFAULT 1,
  bloqueado BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (influencer_id, data)
);
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public availability for active influencers" ON public.availability
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.influencers WHERE id = influencer_id AND status = 'ativa')
    OR EXISTS (SELECT 1 FROM public.influencers WHERE id = influencer_id AND user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Influencers can manage own availability" ON public.availability
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.influencers WHERE id = influencer_id AND user_id = auth.uid())
  );

-- Bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID REFERENCES public.influencers(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  data_agendada DATE NOT NULL,
  status public.booking_status NOT NULL DEFAULT 'pendente',
  codigo_confirmacao TEXT NOT NULL,
  descricao_produto TEXT,
  link_negocio TEXT,
  material_url TEXT,
  observacoes TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Influencers can view own bookings" ON public.bookings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.influencers WHERE id = influencer_id AND user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Influencers can manage own bookings" ON public.bookings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.influencers WHERE id = influencer_id AND user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Clients can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (true);

-- Influencer analysis table
CREATE TABLE public.influencer_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID REFERENCES public.influencers(id) ON DELETE CASCADE NOT NULL,
  checklist JSONB DEFAULT '{}',
  aprovado_por UUID REFERENCES auth.users(id),
  data_analise TIMESTAMPTZ DEFAULT now(),
  notas TEXT,
  resultado public.analysis_result NOT NULL DEFAULT 'pendente'
);
ALTER TABLE public.influencer_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage analysis" ON public.influencer_analysis
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Influencers can view own analysis" ON public.influencer_analysis
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.influencers WHERE id = influencer_id AND user_id = auth.uid())
  );

-- Booking code generation function
CREATE OR REPLACE FUNCTION public.generate_booking_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  seq_num INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO seq_num FROM public.bookings
    WHERE EXTRACT(YEAR FROM criado_em) = EXTRACT(YEAR FROM now());
  NEW.codigo_confirmacao := 'AI-' || EXTRACT(YEAR FROM now())::TEXT || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_booking_code
  BEFORE INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_booking_code();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-assign influencer role on influencer profile creation
CREATE OR REPLACE FUNCTION public.handle_new_influencer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.user_id, 'influencer')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_influencer_created
  AFTER INSERT ON public.influencers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_influencer();

-- Storage bucket for materials
INSERT INTO storage.buckets (id, name, public) VALUES ('materials', 'materials', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Anyone can view materials" ON storage.objects
  FOR SELECT USING (bucket_id IN ('materials', 'avatars'));
CREATE POLICY "Authenticated users can upload materials" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id IN ('materials', 'avatars') AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own uploads" ON storage.objects
  FOR UPDATE USING (bucket_id IN ('materials', 'avatars') AND auth.uid()::text = (storage.foldername(name))[1]);
