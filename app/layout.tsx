import type { Metadata } from 'next'

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
      <body>{children}</body>
    </html>
  )
}