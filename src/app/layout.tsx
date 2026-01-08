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
      <body className="antialiased bg-gray-900">
        {/* BlinGO Agency Header Banner */}
        <div className="bg-black py-2 px-4">
          <a
            href="http://www.blingo.lt"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-white text-sm hover:opacity-80 transition-opacity"
          >
            <span>Sukurta kartu su</span>
            <img
              src="/blingo-logo.png"
              alt="BlinGO Agency"
              className="h-6 invert"
            />
          </a>
        </div>
        {children}
      </body>
    </html>
  );
}
