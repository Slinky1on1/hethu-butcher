import type { Metadata, Viewport } from "next";
import "./globals.css";
import { businessConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: businessConfig.name,
  description: "Fresh quality meat — bulk packs, great prices. Mobile butcher, we come to you!",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: businessConfig.name,
  },
  icons: {
    icon: [{ url: "/icon.svg" }, { url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#c41e3a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
