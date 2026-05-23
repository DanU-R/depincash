import Link from 'next/link'
import { clearSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

async function logout(){ 'use server'; await clearSession(); redirect('/login') }

export default function Nav(){ return <>
  <div className="row between"><div><h1>⚡ DePINZcash Monitor</h1><p className="muted">VPS + HF + wallet vault</p></div><form action={logout}><button className="btn secondary">Logout</button></form></div>
  <div className="tabs"><Link className="tab" href="/dashboard">Dashboard</Link><Link className="tab" href="/wallets">Wallets</Link><Link className="tab" href="/import">Import</Link></div>
</> }
