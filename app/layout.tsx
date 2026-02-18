import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hoodiz Tunisia - Premium Hoodies & Streetwear",
  description: "Premium hoodies and streetwear from Tunisia. Discover unique designs across anime, gaming, and urban styles. Quality clothing delivered across Tunisia.",
  keywords: ["hoodies tunisia", "streetwear tunisia", "anime hoodies", "gaming merch", "urban fashion", "clothing tunisia", "hoodies en ligne"],
  icons: {
    icon: '/favicon.ico',
    apple: '/logo.png',
  },
  openGraph: {
    title: "Hoodiz Tunisia - Premium Hoodies & Streetwear",
    description: "Premium hoodies and streetwear from Tunisia. Discover unique designs across anime, gaming, and urban styles.",
    type: "website",
    siteName: "Hoodiz Tunisia",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hoodiz Tunisia - Premium Hoodies & Streetwear",
    description: "Premium hoodies and streetwear from Tunisia. Discover unique designs across anime, gaming, and urban styles.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
