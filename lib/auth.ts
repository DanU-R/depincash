import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

const COOKIE = 'dz_session'

function secret() {
  const s = process.env.JWT_SECRET || ''
  if (s.length < 32) throw new Error('JWT_SECRET must be at least 32 chars')
  return new TextEncoder().encode(s)
}

export async function verifyLogin(user: string, pass: string) {
  if (user !== process.env.ADMIN_USER) return false
  const hash = process.env.ADMIN_PASS_HASH || ''
  return bcrypt.compare(pass, hash)
}

export async function createSession(user: string) {
  const token = await new SignJWT({ user }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('7d').sign(secret())
  ;(await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 60*60*24*7 })
}

export async function clearSession() {
  ;(await cookies()).delete(COOKIE)
}

export async function currentUser() {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return null
  try {
    const res = await jwtVerify(token, secret())
    return (res.payload.user as string) || null
  } catch { return null }
}

export async function requireUser() {
  const u = await currentUser()
  if (!u) throw new Error('unauthorized')
  return u
}
