import { z } from "zod";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const createBookingSchema = z.object({
  influencer_id: z.string().regex(UUID_REGEX, "influencer_id deve ser um UUID válido"),
  service_id: z.string().regex(UUID_REGEX, "service_id deve ser um UUID válido"),
  data_agendada: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "data_agendada deve estar no formato YYYY-MM-DD"),
  descricao_produto: z.string().min(1, "descricao_produto é obrigatório"),
  link_negocio: z.string().url("link_negocio deve ser uma URL válida").nullish(),
  material_url: z.array(z.string().url()).nullish(),
  observacoes: z.string().nullish(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
