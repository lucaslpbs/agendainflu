'use client'

import { useEffect, useState } from "react"
import { Star } from "lucide-react"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { SkeletonCard } from "@/components/ui/SkeletonCard"

interface Review {
  rating: number
  texto: string | null
  criado_em: string
  clients: { nome: string } | null
}

interface ReviewListProps {
  influencerId: string
}

export function ReviewList({ influencerId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/reviews?influencer_id=${influencerId}`)
      .then((r) => r.json())
      .then((data) => {
        setReviews(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [influencerId])

  const avg =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <p className="text-muted-foreground">Seja o primeiro a avaliar!</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {avg && (
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{avg}</span>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={16}
                className={i < Math.round(Number(avg)) ? "fill-accent text-accent" : "text-muted-foreground"}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            baseado em {reviews.length} {reviews.length === 1 ? "avaliação" : "avaliações"}
          </span>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-5">
        {reviews.map((r, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow relative">
            <div className="absolute -top-3 left-6 bg-primary/10 text-primary text-lg px-2 rounded-md">"</div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 mt-2">
              {r.texto || "—"}
            </p>
            <div className="flex items-center gap-0.5 mb-3">
              {Array.from({ length: r.rating }).map((_, j) => (
                <Star key={j} size={12} className="fill-accent text-accent" />
              ))}
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-border">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-sm font-bold">
                {r.clients?.nome?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div>
                <p className="text-sm font-semibold">{r.clients?.nome || "Cliente"}</p>
                <p className="text-xs text-muted-foreground">
                  {format(parseISO(r.criado_em), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
