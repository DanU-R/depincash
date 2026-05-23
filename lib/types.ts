export type WalletItem = {
  label: string
  location: 'vps' | 'hf' | 'other'
  wallet: string
  node_id: string
  private_key_enc?: string
  notes?: string
}

export type WalletPublic = Omit<WalletItem, 'private_key_enc'> & { has_private_key: boolean }

export type NodeRow = {
  label: string
  location: string
  status: string
  points: number
  height: number | string
  last_proof: string
  wallet: string
  node_id: string
  error?: string
}
