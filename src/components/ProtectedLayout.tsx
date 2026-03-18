'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedLayoutProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'influencer' | 'client'
}

export function ProtectedLayout({ children, requiredRole }: ProtectedLayoutProps) {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push('/login')
      return
    }
    if (requiredRole === 'admin' && !isAdmin) {
      router.push('/')
    }
  }, [user, loading, isAdmin, requiredRole, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    )
  }

  if (!user) return null
  if (requiredRole === 'admin' && !isAdmin) return null

  return <>{children}</>
}
