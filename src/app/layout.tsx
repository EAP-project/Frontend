import "./globals.css";
import type { ReactNode } from "react";
import ClientProviders from "./ClientProviders";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Automobile Service System</title>
        <meta name="description" content="Service time logging & appointment booking system" />
      </head>
      <body className="antialiased bg-gray-50">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
