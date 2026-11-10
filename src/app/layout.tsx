import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { AuthProvider } from "@/components/auth";
import { PageTransition } from "@/components/page-transition";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SmoothScroll } from "@/components/smooth-scroll";
import { StoreProvider } from "@/components/store";
import { Toast } from "@/components/toast";
import { assetRecoveryScript } from "@/lib/asset-recovery";
import "./globals.css";

// Self-hosted at build time: no render-blocking request to Google Fonts, so a
// slow or blocked font CDN can no longer leave the page unstyled.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

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
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${manrope.variable}`}
    >
      <head>
        <script
          id="asset-recovery"
          dangerouslySetInnerHTML={{ __html: assetRecoveryScript }}
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
