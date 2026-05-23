'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { apiFetch } from '@/lib/apiFetch'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import type { Tables } from '@/integrations/supabase/types'

export type BookingWithRelations = Tables<'bookings'> & {
  clients: Tables<'clients'> | null
  services: Tables<'services'> | null
}

// ── Bookings ─────────────────────────────────────────────────────────────────

export function useBookings(params?: { status?: string; data_inicio?: string; data_fim?: string }) {
  const { influencer } = useAuth()
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: async () => {
      const qs = new URLSearchParams()
      if (params?.status) qs.set('status', params.status)
      if (params?.data_inicio) qs.set('data_inicio', params.data_inicio)
      if (params?.data_fim) qs.set('data_fim', params.data_fim)
      const { data } = await apiFetch('/api/bookings?' + qs.toString())
      return (data || []) as BookingWithRelations[]
    },
    enabled: !!influencer,
    staleTime: 30_000,
  })
}

export function useUpdateBookingStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiFetch('/api/bookings/' + id + '/status', { method: 'PATCH', body: JSON.stringify({ status }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  })
}

export function useCompleteBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch('/api/bookings/' + id + '/complete', { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  })
}

// ── Services ──────────────────────────────────────────────────────────────────

export function useServices() {
  const { influencer } = useAuth()
  return useQuery({
    queryKey: ['services', influencer?.id],
    queryFn: async () => {
      const { data } = await apiFetch('/api/services?influencer_id=' + influencer!.id)
      return (data || []) as Tables<'services'>[]
    },
    enabled: !!influencer,
    staleTime: 60_000,
  })
}

export function useSaveService() {
  const qc = useQueryClient()
  const { influencer } = useAuth()
  return useMutation({
    mutationFn: (payload: { id?: string; tipo: string; formato: string; preco: number; descricao: string; max_por_dia: number }) => {
      const { id, ...body } = payload
      if (id) return apiFetch('/api/services/' + id, { method: 'PATCH', body: JSON.stringify(body) })
      return apiFetch('/api/services', { method: 'POST', body: JSON.stringify({ ...body, influencer_id: influencer?.id }) })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }),
  })
}

export function useDeleteService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiFetch('/api/services/' + id, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }),
  })
}

// ── Clients ───────────────────────────────────────────────────────────────────

export function useClients() {
  const { influencer } = useAuth()
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data } = await apiFetch('/api/clients')
      return (data || []) as Tables<'clients'>[]
    },
    enabled: !!influencer,
    staleTime: 60_000,
  })
}

export function useAddClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { nome: string; whatsapp: string; email?: string | null; empresa?: string | null; notas?: string | null }) =>
      apiFetch('/api/clients', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  })
}

export function useUpdateClientStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiFetch('/api/clients/' + id + '/status', { method: 'PATCH', body: JSON.stringify({ status }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  })
}

// ── Waitlist ──────────────────────────────────────────────────────────────────

export function useWaitlist() {
  const { influencer } = useAuth()
  return useQuery({
    queryKey: ['waitlist'],
    queryFn: async () => {
      const { data } = await apiFetch('/api/waitlist')
      return (data || []) as Tables<'waitlist'>[]
    },
    enabled: !!influencer,
    staleTime: 30_000,
  })
}

export function useUpdateWaitlistStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, motivo }: { id: string; status: string; motivo?: string }) =>
      apiFetch('/api/waitlist/' + id + '/status', { method: 'PATCH', body: JSON.stringify({ status, motivo }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['waitlist'] })
      qc.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}

// ── Calendário ────────────────────────────────────────────────────────────────

export function useCalendario(currentMonth: Date) {
  const { influencer } = useAuth()
  const mes = format(currentMonth, 'yyyy-MM')
  return useQuery({
    queryKey: ['calendario', mes],
    queryFn: async () => {
      const [avData, bkData] = await Promise.all([
        apiFetch('/api/availability?mes=' + mes),
        apiFetch('/api/bookings?data_inicio=' + format(startOfMonth(currentMonth), 'yyyy-MM-dd') + '&data_fim=' + format(endOfMonth(currentMonth), 'yyyy-MM-dd')),
      ])
      return {
        availability: (avData.data || []) as Tables<'availability'>[],
        bookings: (bkData.data || []) as BookingWithRelations[],
      }
    },
    enabled: !!influencer,
    staleTime: 30_000,
  })
}

export function useSaveAvailability() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { data: string; bloqueado: boolean; slots_disponiveis: number }) =>
      apiFetch('/api/availability', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['calendario'] }),
  })
}
