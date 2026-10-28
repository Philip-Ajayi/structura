import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Structura | Verifiable Industrial Property Intelligence",
  description: "Cryptographically binds engineering & environmental due diligence to ERC-3643 tokenized capital.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-slate-100 antialiased selection:bg-accent selection:text-black">
        {children}
      </body>
    </html>
  );
}
