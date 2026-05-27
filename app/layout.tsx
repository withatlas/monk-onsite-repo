import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Monk Cash Application",
  description: "Cash application sandbox for onsite interviews.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
