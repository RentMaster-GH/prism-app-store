import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Prism Store',
  description: 'Prism App Store',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(r=>r.forEach(reg=>reg.unregister()));caches.keys().then(n=>n.forEach(c=>caches.delete(c)));}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}