import type { Metadata } from "next";
import { Calistoga, Schibsted_Grotesk } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

// Display face for headings and the wordmark. It has a single weight (400).
const calistoga = Calistoga({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-calistoga",
});

// Body and all admin UI.
const schibstedGrotesk = Schibsted_Grotesk({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-schibsted",
});

export const metadata: Metadata = {
  title: {
    default: "Mondays",
    template: "%s | Mondays",
  },
  description: "Easy on the face. Easy on the week. A fictional cosmetics store.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${calistoga.variable} ${schibstedGrotesk.variable}`}>
      <body className="flex min-h-dvh flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
