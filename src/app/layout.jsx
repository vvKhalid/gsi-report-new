// src/app/layout.jsx
"use client";
import Link from "next/link";

export default function RootLayout({ children }) {
  return (
    <html lang="ar">
      <body>
        <nav style={{ padding: 16, borderBottom: "1px solid #eee" }}>
          <Link href="/">الرئيسية</Link>{" | "}
          <Link href="/last-reports">Last Reports</Link>
        </nav>
        <main style={{ padding: 24 }}>{children}</main>
      </body>
    </html>
  );
}
