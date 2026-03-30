import { z } from "zod";

const WHATSAPP_REGEX = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;

export const clientSchema = z.object({
  nome: z.string().min(1, "nome é obrigatório"),
  whatsapp: z.string().regex(WHATSAPP_REGEX, "whatsapp deve estar no formato (XX) XXXXX-XXXX"),
  email: z.string().email("email inválido").nullish(),
  empresa: z.string().nullish(),
  instagram: z.string().nullish(),
  notas: z.string().nullish(),
});

export type ClientInput = z.infer<typeof clientSchema>;
