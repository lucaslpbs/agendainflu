import { z } from "zod";

export const serviceTipoEnum = z.enum([
  "stories",
  "reels",
  "reels_stories",
  "feed",
  "presencial",
]);

export const serviceFormatoEnum = z.enum(["online", "presencial"]);

export const createServiceSchema = z.object({
  tipo: serviceTipoEnum,
  formato: serviceFormatoEnum,
  preco: z.coerce.number().positive("preco deve ser maior que 0"),
  descricao: z.string().nullish(),
  max_por_dia: z.coerce.number().int().min(1, "max_por_dia deve ser pelo menos 1").default(1),
  ativo: z.boolean().default(true),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
