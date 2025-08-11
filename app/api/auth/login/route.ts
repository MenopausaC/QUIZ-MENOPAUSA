import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SignJWT } from 'jose'

// Usuários do sistema
const users = [
  {
    id: '1',
    username: 'admin',
    password: 'Menopausa2025',
    role: 'admin',
    name: 'Administrador'
  },
  {
    id: '2',
    username: 'colaborador',
    password: 'Menopausa2025',
    role: 'colaborador',
    name: 'Colaborador'
  }
]

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'menopausa-cancelada-secret-key-2025'
)

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Validar dados de entrada
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Usuário e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar usuário
    const user = users.find(u => u.username === username && u.password === password)

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário ou senha incorretos' },
        { status: 401 }
      )
    }

    // Criar JWT token
    const token = await new SignJWT({
      userId: user.id,
      username: user.username,
      role: user.role,
      name: user.name
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret)

    // Configurar cookie
    const cookieStore = cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 horas
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name
      }
    })

  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
