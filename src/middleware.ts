import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/jwt'

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/cadastro-influenciadora',
  '/cadastro-cliente',
  '/lista-espera',
]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Rotas de API — deixar passar (têm autenticação própria)
  if (pathname.startsWith('/api/')) return NextResponse.next()

  // Rotas públicas exatas
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next()

  // Perfil público /[username] e /lista-espera/[username]
  if (
    pathname.match(/^\/[a-z0-9._-]+$/i) ||
    pathname.startsWith('/agendar/') ||
    pathname.startsWith('/lista-espera/')
  ) {
    return NextResponse.next()
  }

  // Rotas protegidas — verificar token no cookie
  const token = req.cookies.get('auth-token')?.value

  if (!token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    const payload = await verifyJWT(token)

    // [FIX P4] /painel só para influencer ou admin
    if (pathname.startsWith('/painel') && payload.role !== 'influencer' && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/cliente', req.url))
    }

    // /admin só para admin
    if (pathname.startsWith('/admin') && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // /cliente só para client ou admin
    if (pathname.startsWith('/cliente') && payload.role !== 'client' && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/painel', req.url))
    }

    return NextResponse.next()
  } catch {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    const res = NextResponse.redirect(loginUrl)
    res.cookies.delete('auth-token')
    return res
  }
}

export const config = {
  matcher: ['/painel/:path*', '/cliente/:path*', '/admin/:path*', '/agendar/:path*'],
}
