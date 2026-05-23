import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'DePINZcash Monitor', description: 'VPS + HF wallet monitor' }

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="id"><body>{children}</body></html>
}
