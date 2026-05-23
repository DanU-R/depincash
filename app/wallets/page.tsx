import { redirect } from 'next/navigation'
import Nav from '@/components/Nav'
import { currentUser } from '@/lib/auth'
import { getWallets, publicWallet } from '@/lib/blob'
import CopyPkButton from '@/components/CopyPkButton'

export default async function Wallets(){
  if (!(await currentUser())) redirect('/login')
  const wallets = (await getWallets()).map(publicWallet)
  return <main className="wrap grid"><Nav />
    <section className="card"><h2>Wallet Vault</h2><p className="muted">PK encrypted in Vercel Blob. Copy PK available after login.</p>
    <table><thead><tr><th>Label</th><th>Location</th><th>Wallet</th><th>Node ID</th><th>PK</th><th>Notes</th></tr></thead><tbody>{wallets.map(w=><tr key={w.label}><td>{w.label}</td><td>{w.location}</td><td className="mono">{w.wallet}</td><td className="mono">{w.node_id}</td><td>{w.has_private_key ? <CopyPkButton label={w.label}/> : <span className="muted">none</span>}</td><td>{w.notes}</td></tr>)}</tbody></table></section>
  </main>
}
