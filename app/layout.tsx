import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { LanguageRuntime } from "./language-runtime";
import { Footer } from "./components/Footer";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const editorial = Cormorant_Garamond({ variable: "--font-editorial", subsets: ["latin"], weight: ["400", "500"], style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: "LUNE — Тихие формы для современной жизни",
  description: "Продуманный гардероб сдержанного дизайна. Откройте для себя вневременную одежду LUNE из исключительных натуральных материалов.",
  keywords: ["премиальная одежда", "минималистичная мода", "LUNE", "тихая роскошь"],
  openGraph: { title: "LUNE — Тихие формы", description: "Гардероб, созданный сдержанно и рассчитанный на долгую жизнь.", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body className={`${inter.variable} ${editorial.variable}`}><LanguageRuntime />{children}<Footer /></body></html>;
}
