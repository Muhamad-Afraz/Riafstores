import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/components/auth";
import { PageTransition } from "@/components/page-transition";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SmoothScroll } from "@/components/smooth-scroll";
import { StoreProvider } from "@/components/store";
import { Toast } from "@/components/toast";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "RIAF — Considered everyday things",
    template: "%s · RIAF",
  },
  description:
    "RIAF is a close edit of considered tech, fashion, accessories and home objects. Start with our flagship wireless earbuds and shop the full collection.",
  applicationName: "RIAF",
  keywords: [
    "RIAF",
    "wireless earbuds",
    "everyday essentials",
    "minimal marketplace",
    "home objects",
  ],
  openGraph: {
    title: "RIAF — Considered everyday things",
    description:
      "A close edit of considered tech, fashion, accessories and home objects.",
    type: "website",
    siteName: "RIAF",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f5f0",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <AuthProvider>
          <StoreProvider>
            <div className="flex min-h-screen flex-col">
              <SiteHeader />
              <main className="flex-1">
                <PageTransition>{children}</PageTransition>
              </main>
              <SiteFooter />
            </div>
            <Toast />
          </StoreProvider>
        </AuthProvider>
        <SmoothScroll />
      </body>
    </html>
  );
}
