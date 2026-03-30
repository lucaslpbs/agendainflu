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
  user_id: z.string().uuid("user_id deve ser um UUID válido"),
  tipo_pessoa: z.enum(["pf", "pj"], { required_error: "tipo_pessoa é obrigatório (pf ou pj)" }),
  nome: z.string().min(1, "nome é obrigatório"),
  email: z.string().email("email inválido").nullish(),
  whatsapp: z.string().min(10, "whatsapp deve ter pelo menos 10 caracteres"),
  cnpj: z.string().nullish(),
  razao_social: z.string().nullish(),
  cpf: z.string().nullish(),
  endereco: z.string().nullish(),
}).refine(
  (data) => data.tipo_pessoa !== "pj" || (data.cnpj && data.razao_social),
  { message: "Pessoa Jurídica requer cnpj e razao_social" }
).refine(
  (data) => data.tipo_pessoa !== "pf" || data.cpf,
  { message: "Pessoa Física requer cpf" }
);

export type ExchangeTokenInput = z.infer<typeof exchangeTokenSchema>;
export type RegisterInfluencerInput = z.infer<typeof registerInfluencerSchema>;
export type RegisterClientInput = z.infer<typeof registerClientSchema>;
