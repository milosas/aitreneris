import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Fitness Treneris",
  description: "Tavo asmeninis AI fitness treneris - treniruotės, pratimai, mityba",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="lt">
      <body className="antialiased bg-gray-900">{children}</body>
    </html>
  );
}
