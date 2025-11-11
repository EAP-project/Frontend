import "./globals.css";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Automobile Service System</title>
        <meta
          name="description"
          content="Service time logging & appointment booking system"
        />
        {/* Favicon and meta to replace default Vercel icon in the browser tab */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <meta name="theme-color" content="#0ea5a4" />
      </head>
      <body className="antialiased bg-gray-50">{children}</body>
    </html>
  );
}
