import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "next playground",
  description: "Ivem Kit next playground",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
