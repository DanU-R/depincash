'use client'
import { useState } from 'react'

export default function CopyPkButton({ label }: { label: string }) {
  const [msg, setMsg] = useState('')
  async function copy() {
    setMsg('loading')
    const r = await fetch(`/api/wallets/${encodeURIComponent(label)}/pk`, { cache: 'no-store' })
    const j = await r.json()
    if (!r.ok) { setMsg(j.error || 'error'); return }
    await navigator.clipboard.writeText(j.private_key)
    setMsg('copied')
    setTimeout(()=>setMsg(''), 3000)
  }
  return <span className="row"><button className="btn secondary" onClick={copy}>Copy PK</button><span className="muted">{msg}</span></span>
}
