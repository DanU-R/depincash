import { redirect } from 'next/navigation'
import Nav from '@/components/Nav'
import { currentUser } from '@/lib/auth'
import { mergeWallets } from '@/lib/blob'

type Raw = Record<string, {sk?: string; keypair_b58?: string; wallet?: string; node_id?: string; id?: string; location?: string}>

async function importWallets(formData: FormData) {
  'use server'
  if (!(await currentUser())) redirect('/login')
  const text = String(formData.get('json') || '')
  const loc = String(formData.get('location') || 'hf') as any
  const overwrite = formData.get('overwrite') === 'on'
  const raw: Raw = JSON.parse(text)
  const items = Object.entries(raw).map(([label, v]) => ({ label, location: v.location || loc, wallet: v.wallet || '', node_id: v.node_id || v.id || '', private_key: v.sk || v.keypair_b58 || '' }))
  await mergeWallets(items, overwrite)
  redirect('/wallets')
}

export default async function ImportPage(){
  if (!(await currentUser())) redirect('/login')
  return <main className="wrap grid"><Nav />
    <form action={importWallets} className="card grid"><h2>Import WALLET_JSON</h2><p className="muted">Paste HF WALLET_JSON or object label → sk/node_id. Default merge tidak overwrite PK lama.</p>
      <select className="input" name="location" defaultValue="hf"><option value="hf">HF</option><option value="vps">VPS</option><option value="other">Other</option></select>
      <textarea className="input textarea mono" name="json" placeholder='{"relay-31":{"sk":"...","node_id":"...","wallet":"..."}}' />
      <label className="row"><input type="checkbox" name="overwrite"/> overwrite existing</label>
      <button className="btn">Import / Merge</button>
    </form>
  </main>
}
