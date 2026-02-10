import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RetroChat - Talk to Strangers",
  description: "Chat with random strangers in retro style. Inspired by Yahoo Messenger and AOL Instant Messenger.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/xp.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
