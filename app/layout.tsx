import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const editorial = Cormorant_Garamond({ variable: "--font-editorial", subsets: ["latin"], weight: ["400", "500"], style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: "LUNE — Quiet Forms for Modern Life",
  description: "Considered essentials shaped with restraint. Discover LUNE's timeless clothing, crafted from exceptional natural materials.",
  keywords: ["premium fashion", "minimalist clothing", "Copenhagen fashion", "quiet luxury"],
  openGraph: { title: "LUNE — Quiet Forms for Modern Life", description: "A wardrobe shaped with restraint, crafted to endure.", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${inter.variable} ${editorial.variable}`}>{children}</body></html>;
}
