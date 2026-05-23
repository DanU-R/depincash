import { redirect } from 'next/navigation'
import Nav from '@/components/Nav'
import { currentUser } from '@/lib/auth'
import { getWallets, publicWallet, deleteWallets, deleteAllWallets } from '@/lib/blob'
import CopyPkButton from '@/components/CopyPkButton'

async function deleteOne(formData: FormData) {
  'use server'
  if (!(await currentUser())) redirect('/login')
  const label = String(formData.get('label') || '')
  if (label) await deleteWallets([label])
  redirect('/wallets')
}

async function deleteAll(formData: FormData) {
  'use server'
  if (!(await currentUser())) redirect('/login')
  const confirm = String(formData.get('confirm') || '')
  if (confirm === 'DELETE ALL') await deleteAllWallets()
  redirect('/wallets')
}

export default async function WalletsPage(){
  if (!(await currentUser())) redirect('/login')
  const wallets = (await getWallets()).map(publicWallet)
  return <main className="wrap grid"><Nav />
    <section className="card"><h2>Wallet Vault</h2><p className="muted">PK encrypted in Vercel Blob. Total: {wallets.length} wallets</p>
    <table><thead><tr><th>Label</th><th>Location</th><th>Wallet</th><th>Node ID</th><th>PK</th><th>Notes</th><th></th></tr></thead><tbody>{wallets.map(w=><tr key={w.label}><td>{w.label}</td><td>{w.location}</td><td className="mono">{w.wallet ? w.wallet.slice(0,12)+'...' : ''}</td><td className="mono">{w.node_id ? w.node_id.slice(0,8)+'...' : ''}</td><td>{w.has_private_key ? <CopyPkButton label={w.label}/> : <span className="muted">none</span>}</td><td>{w.notes}</td><td><form action={deleteOne}><input type="hidden" name="label" value={w.label}/><button className="btn danger" style={{padding:'2px 8px',fontSize:12}}>✕</button></form></td></tr>)}</tbody></table>
    </section>
    <section className="card" style={{border:'1px solid #a00'}}>
      <h3>Danger Zone</h3>
      <form action={deleteAll} className="grid" style={{gap:8}}>
        <p className="muted">Hapus semua wallet. Ketik <b>DELETE ALL</b> untuk konfirmasi.</p>
        <input className="input" name="confirm" placeholder="DELETE ALL" autoComplete="off"/>
        <button className="btn danger">Delete All Wallets</button>
      </form>
    </section>
  </main>
}
