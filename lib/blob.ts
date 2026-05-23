import { put, list } from '@vercel/blob'
import { decryptText, encryptText } from './crypto'
import type { WalletItem, WalletPublic } from './types'

const WALLET_BLOB = 'wallets.json'

async function readBlobText(path: string): Promise<string | null> {
  const blobs = await list({ prefix: path, limit: 1 })
  const blob = blobs.blobs.find(b => b.pathname === path)
  if (!blob) return null
  const res = await fetch(blob.url, { cache: 'no-store' })
  if (!res.ok) return null
  return await res.text()
}

export async function getWallets(): Promise<WalletItem[]> {
  const text = await readBlobText(WALLET_BLOB)
  if (!text) return []
  return JSON.parse(text)
}

export async function saveWallets(wallets: WalletItem[]) {
  wallets.sort((a,b)=>a.label.localeCompare(b.label, undefined, { numeric: true }))
  await put(WALLET_BLOB, JSON.stringify(wallets, null, 2), { access: 'public', contentType: 'application/json', allowOverwrite: true })
}

export function publicWallet(w: WalletItem): WalletPublic {
  const { private_key_enc, ...rest } = w
  return { ...rest, has_private_key: !!private_key_enc }
}

export async function mergeWallets(input: Array<{label:string; location?: string; wallet?: string; node_id?: string; private_key?: string; sk?: string; notes?: string}>, overwrite=false) {
  const wallets = await getWallets()
  const map = new Map(wallets.map(w => [w.label, w]))
  for (const item of input) {
    const old = map.get(item.label)
    if (old && !overwrite) {
      map.set(item.label, {
        ...old,
        location: (item.location as any) || old.location,
        wallet: item.wallet || old.wallet,
        node_id: item.node_id || old.node_id,
        notes: item.notes ?? old.notes,
        private_key_enc: old.private_key_enc || (item.private_key || item.sk ? encryptText(item.private_key || item.sk || '') : undefined),
      })
    } else {
      map.set(item.label, {
        label: item.label,
        location: (item.location as any) || 'other',
        wallet: item.wallet || '',
        node_id: item.node_id || '',
        notes: item.notes || '',
        private_key_enc: item.private_key || item.sk ? encryptText(item.private_key || item.sk || '') : undefined,
      })
    }
  }
  const merged = Array.from(map.values())
  await saveWallets(merged)
  return merged
}

export function decryptWalletPk(w: WalletItem): string {
  if (!w.private_key_enc) throw new Error('No private key stored')
  return decryptText(w.private_key_enc)
}
