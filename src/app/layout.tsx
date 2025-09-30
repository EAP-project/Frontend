import "./globals.css";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Automobile Service System</title>
        <meta name="description" content="Service time logging & appointment booking system" />
      </head>
      <body className="antialiased bg-gray-50">
        {children}
      </body>
    </html>
  );
}
