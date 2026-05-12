import { z } from "zod";

export const createWaitlistSchema = z.object({
  nome: z.string().min(1, "nome é obrigatório"),
  whatsapp: z.string().min(10, "whatsapp deve ter pelo menos 10 caracteres"),
  influencer_id: z.string().uuid("influencer_id deve ser um UUID válido").nullish(),
  email: z.string().email("email inválido").nullish(),
  empresa: z.string().nullish(),
  mensagem: z.string().nullish(),
});

export type CreateWaitlistInput = z.infer<typeof createWaitlistSchema>;
