import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";

import "./globals.css";

export const metadata: Metadata = {
  title: "EuphoriaLens - Euphoria On-Chain Analysis",
  description:
    "On-chain analytics dashboard for Euphoria Mainnet activity. Track public Euphoria Mainnet volume, taps, trading accounts, estimated Net PNL, win rate, and concentration.",
  metadataBase: new URL("https://euphorialens.vercel.app"),
  openGraph: {
    title: "EuphoriaLens - Euphoria On-Chain Analysis",
    description: "On-chain analytics dashboard for Euphoria Mainnet activity.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EuphoriaLens - Euphoria On-Chain Analysis",
    description: "Public on-chain analytics for Euphoria Mainnet activity.",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
