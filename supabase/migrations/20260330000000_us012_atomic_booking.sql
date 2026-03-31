-- US-012: Atomic functions to fix race conditions in booking creation

-- Function: Upsert client atomically (prevents duplicate clients)
CREATE OR REPLACE FUNCTION public.upsert_booking_client(
  p_influencer_id UUID,
  p_user_id UUID,
  p_nome TEXT,
  p_whatsapp TEXT,
  p_email TEXT,
  p_empresa TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'espera',
  p_origem TEXT DEFAULT 'site'
) RETURNS JSON AS $$
DECLARE
  v_client RECORD;
BEGIN
  -- Try to find existing client by user_id or whatsapp (with row lock)
  SELECT id, nome, empresa, status INTO v_client
  FROM clients
  WHERE influencer_id = p_influencer_id
    AND (user_id = p_user_id OR (p_whatsapp <> '' AND whatsapp = p_whatsapp AND status = 'ativo'))
  ORDER BY (user_id = p_user_id) DESC
  LIMIT 1
  FOR UPDATE;

  IF v_client.id IS NOT NULL THEN
    RETURN json_build_object('id', v_client.id, 'nome', v_client.nome, 'empresa', v_client.empresa, 'status', v_client.status);
  END IF;

  -- Insert new client; handle concurrent inserts with ON CONFLICT
  INSERT INTO clients (influencer_id, user_id, nome, whatsapp, email, empresa, status, origem)
  VALUES (p_influencer_id, p_user_id, p_nome, p_whatsapp, p_email, p_empresa, p_status::client_status, p_origem)
  ON CONFLICT (influencer_id, whatsapp) DO UPDATE SET user_id = EXCLUDED.user_id
  RETURNING id, nome, empresa, status INTO v_client;

  RETURN json_build_object('id', v_client.id, 'nome', v_client.nome, 'empresa', v_client.empresa, 'status', v_client.status);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Create booking atomically (prevents overbooking)
CREATE OR REPLACE FUNCTION public.create_booking_atomic(
  p_influencer_id UUID,
  p_client_id UUID,
  p_service_id UUID,
  p_data_agendada DATE,
  p_codigo_confirmacao TEXT,
  p_descricao_produto TEXT DEFAULT NULL,
  p_link_negocio TEXT DEFAULT NULL,
  p_material_url TEXT DEFAULT NULL,
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
