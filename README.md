# DePINZcash Vercel Dashboard

Dashboard monitoring VPS + HF + encrypted wallet vault using Vercel Blob.

## Features
- Admin login
- Monitor VPS nodes via `VPS_STATUS_URL`
- Monitor stored wallet node IDs via DePINZcash API
- Store private keys encrypted in Vercel Blob
- Copy PK per wallet after login
- Import/merge `WALLET_JSON` without overwriting old wallets by default

## Setup

```bash
npm install
node scripts/hash-password.mjs 'YOUR_ADMIN_PASSWORD'
```

Set Vercel env:

```env
ADMIN_USER=admin
ADMIN_PASS_HASH=<bcrypt output>
JWT_SECRET=<32+ random chars>
WALLET_MASTER_KEY=<32+ random chars>
BLOB_READ_WRITE_TOKEN=<from Vercel Blob>
VPS_STATUS_URL=http://202.155.90.236:8899/api/status
HF_SPACE_URL=https://Ringgo71-depinzcash-relay-hf.hf.space
DEPINZCASH_API=https://api.zcashdepin.com
```

Deploy:

```bash
vercel --prod
```

Import wallets:
- Open `/import`
- Paste `WALLET_JSON`
- Choose HF/VPS
- Leave overwrite unchecked to avoid overwriting existing wallet PKs.

Security note: PK is encrypted at rest, decrypted only server-side when clicking Copy PK.
