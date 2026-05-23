import { redirect } from 'next/navigation'
import Nav from '@/components/Nav'
import { currentUser } from '@/lib/auth'
import { mergeWallets } from '@/lib/blob'

type RawItem = { label?: string; sk?: string; keypair_b58?: string; wallet?: string; node_id?: string; id?: string; location?: string; keypair?: { keypair_b58?: string; sk?: string } }
type Raw = Record<string, RawItem> | RawItem[]

async function importWallets(formData: FormData) {
  'use server'
  if (!(await currentUser())) redirect('/login')
  const text = String(formData.get('json') || '')
  const loc = String(formData.get('location') || 'hf') as any
  const overwrite = formData.get('overwrite') === 'on'
  const raw: Raw = JSON.parse(text)

  let items: Array<{ label: string; location: string; wallet: string; node_id: string; private_key: string; notes: string }>

  if (Array.isArray(raw)) {
    // Array format: [{label, keypair/sk/keypair_b58, node_id, wallet, source}]
    items = raw.map((v: any) => ({
      label: v.label || '',
      location: v.location || v.source || loc,
      wallet: v.wallet || '',
      node_id: v.node_id || v.id || '',
      private_key: v.sk || v.keypair_b58 || v.keypair?.sk || v.keypair?.keypair_b58 || '',
      notes: v.notes || '',
    }))
  } else {
    // Object format: {"relay-31": {sk, node_id, wallet}, ...}
    items = Object.entries(raw).map(([label, v]: [string, any]) => ({
      label,
      location: v.location || loc,
      wallet: v.wallet || '',
      node_id: v.node_id || v.id || '',
      private_key: v.sk || v.keypair_b58 || v.keypair?.sk || v.keypair?.keypair_b58 || '',
      notes: v.notes || '',
    }))
  }

  const result = await mergeWallets(items, overwrite)
  redirect('/wallets?imported=' + result.length)
}

export default async function ImportPage(){
  if (!(await currentUser())) redirect('/login')
  return <main className="wrap grid"><Nav />
    <form action={importWallets} className="card grid"><h2>Import Wallets</h2><p className="muted">Paste JSON — supports both formats:</p>
      <pre className="mono" style={{fontSize:11,background:'#0a0a1a',padding:8,borderRadius:6,overflow:'auto'}}>{`// Object format:
{"relay-31":{"sk":"base58key","node_id":"uuid","wallet":"addr"},...}

// Array format:
[{"label":"relay-31","keypair_b58":"base58key","node_id":"uuid","wallet":"addr"},...]`}</pre>
      <select className="input" name="location" defaultValue="hf"><option value="hf">HF</option><option value="vps">VPS</option><option value="other">Other</option></select>
      <textarea className="input textarea mono" name="json" rows={8} placeholder='Paste wallet JSON here...' />
      <label className="row"><input type="checkbox" name="overwrite"/> overwrite existing PK</label>
      <button className="btn">Import / Merge</button>
    </form>
  </main>
}
