import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RideBuddy | Fastest & Safest University Ride-Sharing Platform for Students",
  description: "Join the exclusive campus mobility network. Book 2-wheeler rides, share your journey, and reduce your carbon footprint with RideBuddy—the most trusted student ride-sharing app.",
  keywords: ["university ride sharing", "student carpooling", "campus mobility", "RideBuddy", "safe student rides"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-slate-50 text-slate-900`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
