
-- Create client_profiles table for registered client users
CREATE TABLE public.client_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  cpf TEXT,
  cnpj TEXT,
  razao_social TEXT,
  endereco TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read/update own profile
CREATE POLICY "Users can view own client profile"
  ON public.client_profiles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own client profile"
  ON public.client_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own client profile"
  ON public.client_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can manage all
CREATE POLICY "Admins can manage client profiles"
  ON public.client_profiles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Add user_id to clients table to link client-influencer relationship to auth user
ALTER TABLE public.clients ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Trigger to auto-assign client role on client_profiles insert
CREATE OR REPLACE FUNCTION public.handle_new_client()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.user_id, 'client')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_client_profile_created
  AFTER INSERT ON public.client_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_client();

-- Add payment confirmation fields to bookings
ALTER TABLE public.bookings ADD COLUMN pagamento_confirmado BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.bookings ADD COLUMN pagamento_confirmado_em TIMESTAMPTZ;
