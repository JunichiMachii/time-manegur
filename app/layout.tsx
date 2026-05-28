import type { Metadata, Viewport } from "next";
import { Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "./_components/ServiceWorkerRegister";

const zenKaku = Zen_Kaku_Gothic_New({
  variable: "--font-zen-kaku",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "時間管理アプリ",
  description: "今日やるべきことと決まった時間にやることを一画面で管理する",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "時間管理",
  },
  icons: {
    apple: "/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#C4634E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${zenKaku.variable} h-full antialiased`}>
      <body className="min-h-full">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
