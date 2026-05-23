'use client'
import { useState, useRef } from 'react'

export default function CopyPkButton({ label }: { label: string }) {
  const [msg, setMsg] = useState('')
  const [pk, setPk] = useState('')
  const [show, setShow] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function fetchPk() {
    if (pk && show) { setShow(false); return }
    setMsg('loading')
    try {
      const r = await fetch(`/api/wallets/${encodeURIComponent(label)}/pk`, {
        cache: 'no-store',
        credentials: 'include',
      })
      const j = await r.json()
      if (!r.ok) { setMsg(j.error || 'error'); return }
      setPk(j.private_key)
      setShow(true)
      setMsg('')
    } catch (e: any) {
      setMsg(e.message || 'fetch error')
    }
  }

  async function copyPk() {
    if (!pk) return
    try {
      await navigator.clipboard.writeText(pk)
      setMsg('copied!')
      setTimeout(() => setMsg(''), 3000)
    } catch {
      // fallback: select + execCommand
      if (inputRef.current) {
        inputRef.current.select()
        document.execCommand('copy')
        setMsg('copied!')
        setTimeout(() => setMsg(''), 3000)
      } else {
        setMsg('copy failed')
      }
    }
  }

  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 4, maxWidth: 320 }}>
      <span className="row" style={{ gap: 6 }}>
        <button className="btn secondary" onClick={fetchPk}>
          {show ? 'Hide PK' : 'Show PK'}
        </button>
        {show && <button className="btn secondary" onClick={copyPk}>Copy</button>}
        <span className="muted" style={{ fontSize: 12 }}>{msg}</span>
      </span>
      {show && pk && (
        <input
          ref={inputRef}
          readOnly
          value={pk}
          className="mono"
          style={{
            fontSize: 11,
            padding: '4px 6px',
            background: '#1a1a2e',
            color: '#0f0',
            border: '1px solid #333',
            borderRadius: 4,
            width: '100%',
            userSelect: 'all',
          }}
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
      )}
    </span>
  )
}
