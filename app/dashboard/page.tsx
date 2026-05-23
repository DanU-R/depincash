import { redirect } from 'next/navigation'
import Nav from '@/components/Nav'
import { currentUser } from '@/lib/auth'
import { getWallets } from '@/lib/blob'
import { fetchVps, fetchWalletNodes } from '@/lib/monitor'

export default async function Dashboard(){
  if (!(await currentUser())) redirect('/login')
  const wallets = await getWallets()
  const rows = [...await fetchVps(), ...await fetchWalletNodes(wallets.filter(w=>w.location !== 'vps'))]
  const total = rows.length, active = rows.filter(r=>r.status==='active').length, stale = rows.filter(r=>r.status==='stale').length, errors = rows.filter(r=>r.status==='error').length
  const points = rows.reduce((a,r)=>a+(r.points||0),0)
  return <main className="wrap grid"><Nav />
    <section className="grid grid4">
      <div className="card"><div className="muted">Nodes</div><h2>{total}</h2></div>
      <div className="card"><div className="muted">Active</div><h2>{active}</h2></div>
      <div className="card"><div className="muted">Stale</div><h2>{stale}</h2></div>
      <div className="card"><div className="muted">Points</div><h2>{points.toLocaleString()}</h2></div>
    </section>
    {errors>0 && <div className="card"><span className="pill error">{errors} error source/node</span></div>}
    <section className="card"><h2>All monitored nodes</h2><table><thead><tr><th>Label</th><th>Loc</th><th>Status</th><th>Points</th><th>Height</th><th>Last Proof</th><th>Wallet</th><th>Node ID</th><th>Error</th></tr></thead><tbody>{rows.map((r,i)=><tr key={i}><td>{r.label}</td><td>{r.location}</td><td><span className={`pill ${r.status}`}>{r.status}</span></td><td>{r.points}</td><td>{r.height}</td><td>{r.last_proof}</td><td className="mono">{r.wallet?.slice(0,8)}…{r.wallet?.slice(-4)}</td><td className="mono">{r.node_id?.slice(0,8)}…</td><td className="muted">{r.error}</td></tr>)}</tbody></table></section>
  </main>
}
