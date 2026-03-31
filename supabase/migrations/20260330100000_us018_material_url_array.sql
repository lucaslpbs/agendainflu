-- US-018: Migrate material_url from TEXT to TEXT[]
-- This allows storing multiple URLs as a proper Postgres array instead of comma-separated string

ALTER TABLE bookings
  ALTER COLUMN material_url TYPE TEXT[]
  USING CASE
    WHEN material_url IS NULL THEN NULL
    ELSE string_to_array(material_url, ',')
  END;

-- Update create_booking_atomic to accept TEXT[] instead of TEXT
CREATE OR REPLACE FUNCTION public.create_booking_atomic(
  p_influencer_id UUID,
  p_client_id UUID,
  p_service_id UUID,
  p_data_agendada DATE,
  p_codigo_confirmacao TEXT,
  p_descricao_produto TEXT DEFAULT NULL,
  p_link_negocio TEXT DEFAULT NULL,
  p_material_url TEXT[] DEFAULT NULL,
  p_observacoes TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'pendente'
) RETURNS JSON AS $$
DECLARE
  v_slots INT;
  v_bloqueado BOOLEAN;
  v_ocupados INT;
  v_service RECORD;
  v_booking RECORD;
BEGIN
  -- Validate service exists, is active, and belongs to the influencer
  SELECT id, tipo, formato, preco INTO v_service
  FROM services
  WHERE id = p_service_id AND ativo = true AND influencer_id = p_influencer_id;

  IF v_service.id IS NULL THEN
    RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  -- Lock the availability row to prevent concurrent reads
  SELECT slots_disponiveis, bloqueado INTO v_slots, v_bloqueado
  FROM availability
  WHERE influencer_id = p_influencer_id AND data = p_data_agendada
  FOR UPDATE;

  v_slots := COALESCE(v_slots, 3);
  v_bloqueado := COALESCE(v_bloqueado, false);

  IF v_bloqueado THEN
    RAISE EXCEPTION 'DATE_UNAVAILABLE' USING ERRCODE = 'P0001';
  END IF;

  -- Count existing active bookings for this date+service (lock rows to prevent concurrent inserts)
  SELECT COUNT(*) INTO v_ocupados
  FROM bookings
  WHERE influencer_id = p_influencer_id
    AND service_id = p_service_id
    AND data_agendada = p_data_agendada
    AND status IN ('pendente', 'confirmado')
  FOR UPDATE;

  IF v_ocupados >= v_slots THEN
    RAISE EXCEPTION 'DATE_UNAVAILABLE' USING ERRCODE = 'P0001';
  END IF;

  -- Insert the booking
  INSERT INTO bookings (
    influencer_id, client_id, service_id, data_agendada,
    codigo_confirmacao, descricao_produto, link_negocio,
    material_url, observacoes, status
  ) VALUES (
    p_influencer_id, p_client_id, p_service_id, p_data_agendada,
    p_codigo_confirmacao, p_descricao_produto, p_link_negocio,
    p_material_url, p_observacoes, p_status::booking_status
  ) RETURNING * INTO v_booking;

  RETURN json_build_object(
    'id', v_booking.id,
    'codigo_confirmacao', v_booking.codigo_confirmacao,
    'status', v_booking.status,
    'data_agendada', v_booking.data_agendada,
    'service_tipo', v_service.tipo,
    'service_formato', v_service.formato,
    'service_preco', v_service.preco
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
