import type { NodeRow, WalletItem } from './types'

function age(ts?: string) {
  if (!ts) return '—'
  const t = Date.parse(ts)
  if (!Number.isFinite(t)) return ts
  const sec = Math.max(0, Math.floor((Date.now() - t) / 1000))
  if (sec < 60) return `${sec}s ago`
  if (sec < 3600) return `${Math.floor(sec/60)}m ago`
  return `${Math.floor(sec/3600)}h ${Math.floor((sec%3600)/60)}m ago`
}

export async function fetchVps(): Promise<NodeRow[]> {
  const url = process.env.VPS_STATUS_URL
  if (!url) return []
  try {
    const r = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(10000) })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const j = await r.json()
    return (j.nodes || []).map((n: any) => ({
      label: n.label, location: 'vps', status: n.data?.status || 'unknown', points: n.data?.points || 0,
      height: n.data?.last_height || '—', last_proof: age(n.data?.last_proof_at), wallet: n.wallet, node_id: n.id,
    }))
  } catch (e:any) { return [{ label:'VPS API', location:'vps', status:'error', points:0, height:'—', last_proof:'—', wallet:'—', node_id:'—', error:e.message }] }
}

async function fetchNode(w: WalletItem): Promise<NodeRow> {
  try {
    const api = process.env.DEPINZCASH_API || 'https://api.zcashdepin.com'
    const r = await fetch(`${api}/api/nodes/${w.node_id}`, { cache: 'no-store', signal: AbortSignal.timeout(10000) })
    if (!r.ok) throw new Error(`HTTP ${r.status}: ${await r.text()}`)
    const n = await r.json()
    return { label:w.label, location:w.location, status:n.status || 'unknown', points:n.points || 0, height:n.last_height || '—', last_proof:age(n.last_proof_at), wallet:w.wallet, node_id:w.node_id }
  } catch (e:any) {
    return { label:w.label, location:w.location, status:'error', points:0, height:'—', last_proof:'—', wallet:w.wallet, node_id:w.node_id, error:e.message }
  }
}

export async function fetchWalletNodes(wallets: WalletItem[]): Promise<NodeRow[]> {
  const targets = wallets.filter(w => w.node_id)
  const out: NodeRow[] = []
  for (let i=0;i<targets.length;i+=8) {
    out.push(...await Promise.all(targets.slice(i,i+8).map(fetchNode)))
  }
  return out
}
