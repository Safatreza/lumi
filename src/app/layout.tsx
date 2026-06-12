import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WortLaut — exam access for blind & differently-abled students",
  description:
    "WortLaut helps schools and universities manage verified human support and assistive technology for exams, plus an exam-safe AI assistant that reads, transcribes, and audits — without giving academic help.",
};

export const viewport: Viewport = {
  themeColor: "#5b54e8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full">
        <div className="wl-bg" aria-hidden />
        {children}
      </body>
    </html>
  );
}
