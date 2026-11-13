import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { EVENT_DETAILS } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${EVENT_DETAILS.brand} – Live Public E-Sports Leaderboard`,
  description: `${EVENT_DETAILS.fullName} at ${EVENT_DETAILS.venue} on ${EVENT_DETAILS.dateFormatted}. Real-time verified standings for Free Fire, BGMI, FIFA, and MATIKS.`,
  keywords: [
    "CLUTCH",
    "NIAT",
    "Esports",
    "Mangalore",
    "Yenepoya University",
    "Free Fire",
    "BGMI",
    "FIFA",
    "MATIKS",
    "Leaderboards",
  ],
  authors: [{ name: "CLUTCH E-Sports Committee" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col bg-white text-slate-900`}>
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
