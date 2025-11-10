export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, padding: 24 }}>
        <header style={{ marginBottom: 24 }}>
          <a href="/" style={{ fontWeight: 700, textDecoration: 'none', color: 'inherit' }}>GaragePro</a>
          <nav style={{ marginTop: 12, display: 'flex', gap: 12 }}>
            <a href="/payment/checkout">Pay</a>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
