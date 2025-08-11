import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'menopausa-cancelada-secret-key-2025'
)

export async function middleware(request: NextRequest) {
  // Rotas que precisam de autenticação
  const protectedPaths = ['/dashboard']
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  // Se não é uma rota protegida, continua
  if (!isProtectedPath) {
    return NextResponse.next()
  }

  // Verificar token
  const token = request.cookies.get('auth-token')

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    await jwtVerify(token.value, secret)
    return NextResponse.next()
  } catch (error) {
    console.error('Token inválido:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/dashboard/:path*']
}
