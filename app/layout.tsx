import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UNIVERSE 31 · 31号宇宙临时开放日",
  description: "一段只在今天开放的宇宙旅程。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
