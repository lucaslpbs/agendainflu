'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Instagram, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface InstagramPost {
  id: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  media_url?: string
  thumbnail_url?: string
  permalink: string
  caption?: string
  timestamp: string
}

interface InstagramFeedProps {
  influencerId: string
  instagramUrl?: string | null
  instagramHandle?: string | null
}

const InstagramFeed = ({ influencerId, instagramUrl, instagramHandle }: InstagramFeedProps) => {
  const [posts, setPosts] = useState<InstagramPost[]>([])
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!influencerId) {
      setLoading(false)
      return
    }
    fetch(`/api/instagram/feed?influencer_id=${influencerId}`)
      .then((r) => r.json())
      .then((data) => {
        setPosts(data.posts ?? [])
        setConnected(data.connected ?? false)
      })
      .catch(() => { toast.error('Erro ao carregar feed do Instagram') })
      .finally(() => setLoading(false))
  }, [influencerId])

  const igLink =
    instagramUrl?.startsWith('http')
      ? instagramUrl
      : `https://instagram.com/${instagramHandle}`

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Instagram size={22} className="text-primary" />
          <h2 className="text-xl md:text-2xl font-bold font-display">Feed do Instagram</h2>
        </div>
        {(instagramUrl || instagramHandle) && connected && (
          <a href={igLink} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="flex items-center gap-1.5">
              <ExternalLink size={14} />
              Ver no Instagram
            </Button>
          </a>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : !connected || posts.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <Instagram size={32} className="mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-sm">
            Esta influenciadora ainda não conectou seu Instagram
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {posts.map((post) => (
            <a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-xl overflow-hidden bg-muted"
            >
              <Image
                src={post.media_type === 'VIDEO' ? (post.thumbnail_url ?? '') : (post.media_url ?? '')}
                alt={post.caption?.slice(0, 80) || 'Post do Instagram'}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <ExternalLink size={20} className="text-background" />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

export default InstagramFeed
