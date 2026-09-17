import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { MotionRoot } from "@/components/motion/MotionRoot";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "We serve you, better.",
    template: "%s · XERV Project",
  },
  description:
    "XERV Project is a custom software agency delivering mobile applications, web development, custom solutions, UI/UX design, quality assurance and manpower as a service.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body>
        <Script src="/boot-bridge.js" strategy="beforeInteractive" />
        <GoogleAnalytics />
        <MotionRoot />
        {children}
      </body>
    </html>
  );
}
