import { z } from "zod";

export const bookingStatusEnum = z.enum([
  "pendente",
  "confirmado",
  "concluido",
  "cancelado",
]);

export const clientStatusEnum = z.enum([
  "ativo",
  "espera",
  "bloqueado",
]);

export const influencerStatusEnum = z.enum([
  "em_analise",
  "ativa",
  "suspensa",
  "rejeitada",
]);

export const waitlistStatusEnum = z.enum([
  "aguardando",
  "contatado",
  "aprovado",
  "rejeitado",
]);

export const updateBookingStatusSchema = z.object({
  id: z.string().uuid("id deve ser um UUID válido"),
  status: bookingStatusEnum,
});

export const updateClientStatusSchema = z.object({
  status: clientStatusEnum,
});

export const updateWaitlistStatusSchema = z.object({
  id: z.string().uuid("id deve ser um UUID válido"),
  status: waitlistStatusEnum,
});

export type BookingStatus = z.infer<typeof bookingStatusEnum>;
export type ClientStatus = z.infer<typeof clientStatusEnum>;
export type InfluencerStatus = z.infer<typeof influencerStatusEnum>;
export type WaitlistStatus = z.infer<typeof waitlistStatusEnum>;
