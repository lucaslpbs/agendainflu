'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedLayoutProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'influencer' | 'client'
}

export function ProtectedLayout({ children, requiredRole }: ProtectedLayoutProps) {
  const { user, loading, roles, isAdmin, isInfluencer } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push('/login')
      return
    }
    if (requiredRole === 'admin' && !isAdmin) {
      router.push('/')
      return
    }
    if (requiredRole === 'influencer' && !isInfluencer && !isAdmin) {
      router.push('/cliente')
      return
    }
    if (requiredRole === 'client' && (isInfluencer || isAdmin)) {
      router.push(isAdmin ? '/admin' : '/painel')
      return
    }
  }, [user, loading, roles, isAdmin, isInfluencer, requiredRole, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    )
  }

  if (!user) return null
  if (requiredRole === 'admin' && !isAdmin) return null
  if (requiredRole === 'influencer' && !isInfluencer && !isAdmin) return null
  if (requiredRole === 'client' && (isInfluencer || isAdmin)) return null

  return <>{children}</>
}
