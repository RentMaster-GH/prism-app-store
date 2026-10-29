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
      <head>
        {/* KILL old Vite PWA service worker for all users */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for (let registration of registrations) {
                    registration.unregister();
                  }
                });
                if (window.caches) {
                  caches.keys().then(function(names) {
                    for (let name of names) caches.delete(name);
                  });
                }
              }
            `,
          }}
        />
      </head>
      <body style={{ margin: 0, background: '#0a0a0f' }}>{children}</body>
    </html>
  )
}