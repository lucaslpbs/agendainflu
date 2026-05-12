'use client'

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface ReviewFormProps {
  bookingId: string
  influencerNome: string
  onSuccess: () => void
}

export function ReviewForm({ bookingId, influencerNome, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [texto, setTexto] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      toast.error("Selecione uma nota de 1 a 5 estrelas")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ booking_id: bookingId, rating, texto: texto || undefined }),
      })
      if (res.status === 409) {
        toast.error("Você já avaliou este agendamento")
        return
      }
      if (!res.ok) {
        toast.error("Erro ao enviar avaliação")
        return
      }
      toast.success("Avaliação enviada com sucesso!")
      onSuccess()
    } catch {
      toast.error("Erro ao enviar avaliação")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <p className="text-sm font-medium mb-2">
          Como foi sua experiência com {influencerNome}?
        </p>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const val = i + 1
            return (
              <button
                key={val}
                type="button"
                onClick={() => setRating(val)}
                onMouseEnter={() => setHovered(val)}
                onMouseLeave={() => setHovered(0)}
                className="focus:outline-none"
              >
                <Star
                  size={28}
                  className={
                    val <= (hovered || rating)
                      ? "fill-accent text-accent"
                      : "text-muted-foreground"
                  }
                />
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Comentário (opcional)</label>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          maxLength={1000}
          rows={4}
          placeholder="Conte como foi a experiência..."
          className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
        <p className="text-xs text-muted-foreground text-right mt-1">{texto.length}/1000</p>
      </div>

      <Button type="submit" variant="hero" className="w-full" disabled={loading}>
        {loading ? "Enviando..." : "Enviar avaliação"}
      </Button>
    </form>
  )
}
