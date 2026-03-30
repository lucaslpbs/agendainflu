import { z } from "zod";

export const exchangeTokenSchema = z.object({
  supabase_token: z.string().min(1, "supabase_token é obrigatório"),
});

export const registerInfluencerSchema = z.object({
  user_id: z.string().uuid("user_id deve ser um UUID válido"),
  nome: z.string().min(1, "nome é obrigatório"),
  username: z.string().optional(),
  whatsapp: z.string().min(10, "whatsapp deve ter pelo menos 10 caracteres"),
  bio: z.string().nullish(),
  nicho: z.string().nullish(),
  seguidores: z.number().int().min(0).nullish(),
  instagram: z.string().nullish(),
  foto_url: z.string().url("foto_url deve ser uma URL válida").nullish(),
  email: z.string().email("email inválido").nullish(),
});

export const registerClientSchema = z.object({
  nome: z.string().min(1, "nome é obrigatório"),
  email: z.string().email("email inválido"),
  whatsapp: z.string().min(10, "whatsapp deve ter pelo menos 10 caracteres"),
  password: z.string().min(6, "senha deve ter pelo menos 6 caracteres"),
});

export type ExchangeTokenInput = z.infer<typeof exchangeTokenSchema>;
export type RegisterInfluencerInput = z.infer<typeof registerInfluencerSchema>;
export type RegisterClientInput = z.infer<typeof registerClientSchema>;
