import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LayoutProvider } from "@/contexts/LayoutContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tinkrkit.dev"),
  title: "tinkrkit.dev — Free Online Tools",
  description:
    "Free, fast, browser-based tools for developers and everyday users. JSON formatter, image compressor, PDF tools, and more. No login. No backend. 100% private.",
  keywords: "online tools, json formatter, image compressor, pdf tools, developer tools",
  icons: {
    icon: "/tinkrkit-icon.png",
    shortcut: "/tinkrkit-icon.png",
    apple: "/tinkrkit-icon.png",
  },
  openGraph: {
    title: "tinkrkit.dev — Free Online Tools",
    description: "Free browser-based tools for developers and everyday users.",
    url: "https://tinkrkit.dev",
    siteName: "tinkrkit.dev",
    type: "website",
    images: [
      {
        url: "/tinkrkit-og.png",
        width: 1200,
        height: 630,
        alt: "tinkrkit.dev — Free Online Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "tinkrkit.dev — Free Online Tools",
    description: "Free browser-based tools for developers and everyday users.",
    images: ["/tinkrkit-og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider><LayoutProvider>{children}</LayoutProvider></ThemeProvider>
      </body>
    </html>
  );
}
