// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { signJwt, verifyJwt } from '@/lib/auth'

describe('JWT auth helpers', () => {
  it('signs a token and verifies the payload', async () => {
    const token = await signJwt({ email: 'admin@test.com', role: 'admin' })
    const payload = await verifyJwt(token)
    expect(payload.email).toBe('admin@test.com')
    expect(payload.role).toBe('admin')
  })

  it('returns a valid 3-part JWT string', async () => {
    const token = await signJwt({ sub: 'test' })
    expect(typeof token).toBe('string')
    expect(token.split('.').length).toBe(3)
  })

  it('throws when verifying an invalid token', async () => {
    await expect(verifyJwt('not.a.valid.jwt')).rejects.toThrow()
  })

  it('throws when verifying a tampered token', async () => {
    const token = await signJwt({ email: 'admin@test.com' })
    const tampered = token.slice(0, -5) + 'XXXXX'
    await expect(verifyJwt(tampered)).rejects.toThrow()
  })
})
