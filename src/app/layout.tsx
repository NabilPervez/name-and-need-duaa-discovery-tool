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
  title: "Duaa Connect | Find Your Supplication",
  description: "A spiritual companion connecting your needs to the specific Names of Allah. Find peace, healing, and guidance.",
  keywords: ["Duaa", "Allah Names", "Supplication", "Islam", "Prayer", "Healing", "Guidance"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Duaa",
  },
  openGraph: {
    title: "Duaa Connect",
    description: "Connect your goals to the specific Names of Allah.",
    url: "https://duaa-connect.com",
    siteName: "Duaa Connect",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Duaa Connect",
    description: "Connect your goals to the specific Names of Allah.",
  },
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
