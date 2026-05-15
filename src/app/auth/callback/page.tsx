'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/integrations/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [message, setMessage] = useState('Verificando...')
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    const hash = window.location.hash
    const params = new URLSearchParams(hash.replace('#', ''))
    const error = params.get('error')
    const errorCode = params.get('error_code')

    if (error) {
      setIsError(true)
      if (errorCode === 'otp_expired') {
        setMessage('O link de acesso expirou. Solicite um novo link de login.')
      } else if (error === 'access_denied') {
        setMessage('Acesso negado. O link pode ter sido usado ou é inválido.')
      } else {
        setMessage('Erro ao autenticar. Tente novamente.')
      }
      setTimeout(() => router.push('/login'), 3500)
      return
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Verificar se usuário já tem role
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .maybeSingle()

          const role = roleData?.role

          // Usuário novo — não tem role ainda
          if (!role) {
            // Pegar o tipo passado na URL (cliente ou influencer)
            const tipo = searchParams.get('tipo') || 'cliente'
            router.push(`/completar-cadastro?tipo=${tipo}`)
            return
          }

          // Usuário existente — redirecionar normalmente
          if (role === 'admin') router.push('/admin')
          else if (role === 'influencer') router.push('/painel')
          else router.push('/cliente/explorar')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        {isError ? (
          <>
            <div className="text-4xl">⚠️</div>
            <p className="text-lg font-medium text-destructive">{message}</p>
            <p className="text-sm text-muted-foreground">
              Redirecionando para o login...
            </p>
          </>
        ) : (
          <>
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">{message}</p>
          </>
        )}
      </div>
    </div>
  )
}
