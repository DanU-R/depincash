import { redirect } from 'next/navigation'
import Nav from '@/components/Nav'
import { currentUser } from '@/lib/auth'
import { mergeWallets, getWallets } from '@/lib/blob'

type RawItem = { label?: string; sk?: string; keypair_b58?: string; wallet?: string; node_id?: string; id?: string; location?: string; keypair?: { keypair_b58?: string; sk?: string } }
type Raw = Record<string, RawItem> | RawItem[]

async function importWallets(formData: FormData) {
  'use server'
  if (!(await currentUser())) redirect('/login')
  const text = String(formData.get('json') || '')
  const loc = String(formData.get('location') || 'hf') as any
  const overwrite = formData.get('overwrite') === 'on'

  if (!text.trim()) {
    redirect('/import?error=empty')
    return
  }

  let raw: Raw
  try {
    raw = JSON.parse(text)
  } catch (e: any) {
    redirect('/import?error=' + encodeURIComponent('JSON parse error: ' + (e?.message || 'invalid')))
    return
  }

  let items: Array<{ label: string; location: string; wallet: string; node_id: string; private_key: string; notes: string }>

  if (Array.isArray(raw)) {
    items = raw.map((v: any) => ({
      label: v.label || '',
      location: v.location || v.source || loc,
      wallet: v.wallet || '',
      node_id: v.node_id || v.id || '',
      private_key: v.sk || v.keypair_b58 || v.keypair?.sk || v.keypair?.keypair_b58 || '',
      notes: v.notes || '',
    }))
  } else {
    items = Object.entries(raw).map(([label, v]: [string, any]) => ({
      label,
      location: v.location || loc,
      wallet: v.wallet || '',
      node_id: v.node_id || v.id || '',
      private_key: v.sk || v.keypair_b58 || v.keypair?.sk || v.keypair?.keypair_b58 || '',
      notes: v.notes || '',
    }))
  }

  // filter out empty labels
  items = items.filter(i => i.label.trim())

  if (items.length === 0) {
    redirect('/import?error=no_valid_items')
    return
  }

  try {
    const result = await mergeWallets(items, overwrite)
    redirect('/wallets?imported=' + result.length)
  } catch (e: any) {
    redirect('/import?error=' + encodeURIComponent('Save failed: ' + (e?.message || 'unknown')))
  }
}

export default async function ImportPage({ searchParams }: { searchParams: Promise<{ error?: string; imported?: string }> }){
  if (!(await currentUser())) redirect('/login')
  const params = await searchParams
  const error = params.error ? decodeURIComponent(params.error) : ''
  const imported = params.imported || ''

  // check blob config
  let blobOk = true
  let walletCount = 0
  try {
    const wallets = await getWallets()
    walletCount = wallets.length
  } catch {
    blobOk = false
  }

  return <main className="wrap grid"><Nav />
    {!blobOk && <section className="card" style={{border:'1px solid #a00',background:'#200'}}>
      <h3>⚠️ Blob Storage Not Configured</h3>
      <p className="muted">Set <code>BLOB_READ_WRITE_TOKEN</code> in Vercel Environment Variables.</p>
      <p className="muted">Go to: Vercel → Storage → Create Blob → Connect to project</p>
    </section>}
    {error && <section className="card" style={{border:'1px solid #a00',background:'#200'}}>
      <h3>❌ Error</h3><p>{error}</p>
    </section>}
    {imported && <section className="card" style={{border:'1px solid #0a0',background:'#020'}}>
      <h3>✅ Import Success</h3><p>Total wallets now: {imported}</p>
    </section>}
    <section className="card">
      <h2>Import Wallets</h2><p className="muted">Current wallets in vault: {walletCount}</p>
      <pre className="mono" style={{fontSize:11,background:'#0a0a1a',padding:8,borderRadius:6,overflow:'auto'}}>{`// Object format:
{"relay-31":{"keypair_b58":"base58key","node_id":"uuid","wallet":"addr"},...}

// Array format:
[{"label":"relay-31","keypair_b58":"base58key","node_id":"uuid"},...]`}</pre>
    </section>
    <form action={importWallets} className="card grid">
      <select className="input" name="location" defaultValue="hf"><option value="hf">HF</option><option value="vps">VPS</option><option value="other">Other</option></select>
      <textarea className="input textarea mono" name="json" rows={10} placeholder='Paste wallet JSON here...' />
      <label className="row"><input type="checkbox" name="overwrite"/> overwrite existing PK</label>
      <button className="btn" type="submit">Import / Merge</button>
    </form>
  </main>
}
