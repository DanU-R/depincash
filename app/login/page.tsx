import { redirect } from 'next/navigation'
import { createSession, currentUser, verifyLogin } from '@/lib/auth'

async function login(formData: FormData) {
  'use server'
  const user = String(formData.get('user') || '')
  const pass = String(formData.get('pass') || '')
  if (!(await verifyLogin(user, pass))) redirect('/login?error=1')
  await createSession(user)
  redirect('/dashboard')
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{error?: string}> }) {
  if (await currentUser()) redirect('/dashboard')
  const sp = await searchParams
  return <main className="login"><form action={login} className="card grid">
    <h1>DePINZcash Monitor</h1>
    <p className="muted">Login admin</p>
    {sp.error && <div className="pill error">Username/password salah</div>}
    <input className="input" name="user" placeholder="Username" autoComplete="username" />
    <input className="input" name="pass" placeholder="Password" type="password" autoComplete="current-password" />
    <button className="btn">Login</button>
  </form></main>
}
