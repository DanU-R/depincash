import { NextResponse } from 'next/server'
import { currentUser } from '@/lib/auth'
import { decryptWalletPk, getWallets } from '@/lib/blob'

export async function GET(_: Request, { params }: { params: Promise<{label:string}> }) {
  if (!(await currentUser())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { label } = await params
  const wallets = await getWallets()
  const w = wallets.find(x => x.label === label)
  if (!w) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json({ label, private_key: decryptWalletPk(w) })
}
