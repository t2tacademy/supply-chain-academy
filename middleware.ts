import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const authHeader = request.headers.get('authorization')

  if (authHeader?.startsWith('Basic ')) {
    const base64 = authHeader.slice(6)
    const decoded = Buffer.from(base64, 'base64').toString('utf-8')
    const colon = decoded.indexOf(':')
    const user = decoded.slice(0, colon)
    const pass = decoded.slice(colon + 1)

    const expectedUser = process.env.ADMIN_USER
    const expectedPass = process.env.ADMIN_PASS

    if (expectedUser && expectedPass && safeEqual(user, expectedUser) && safeEqual(pass, expectedPass)) {
      return NextResponse.next()
    }
  }

  return new NextResponse('Acceso no autorizado', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="T2T Admin"',
    },
  })
}

// Comparación en tiempo constante para no filtrar la contraseña por timing
function safeEqual(a: string, b: string) {
  let diff = a.length ^ b.length
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0)
  }
  return diff === 0
}

export const config = {
  matcher: '/admin/:path*',
}
