import type { Metadata } from "next";
import { Figtree, Lora, Amiri } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-sans",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-serif",
  subsets: ["latin"],
});

const amiri = Amiri({
  weight: ["400", "700"],
  variable: "--font-arabic",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "Name & Need | Duaa & Allah Discovery Tool",
  description: "A spiritual companion connecting user's goals to the specific Names of Allah.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${figtree.variable} ${lora.variable} ${amiri.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
