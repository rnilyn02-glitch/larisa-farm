import { NextResponse } from 'next/server'
import { signJwt } from '@/lib/auth'

export async function POST(request: Request) {
  const { email, password } = await request.json()

  if (
    email !== process.env.ADMIN_EMAIL ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = await signJwt({ email, role: 'admin' })

  const response = NextResponse.json({ ok: true })
  response.cookies.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  })

  return response
}
