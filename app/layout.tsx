import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "RAG Chat - AI Document Assistant",
  description: "Upload documents and chat with AI to get intelligent answers from your content. Powered by advanced RAG (Retrieval Augmented Generation) technology.",
  keywords: ["RAG", "AI", "document chat", "artificial intelligence", "document assistant", "Q&A"],
  authors: [{ name: "RAG Chat" }],
  openGraph: {
    title: "RAG Chat - AI Document Assistant",
    description: "Upload documents and chat with AI to get intelligent answers from your content.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "RAG Chat - AI Document Assistant",
    description: "Upload documents and chat with AI to get intelligent answers from your content.",
  },
  robots: "index, follow",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
