import "../styles/globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import { ErrorBoundary } from "../components/shared/ErrorBoundary";
import { OfflineIndicator } from "../components/shared/OfflineIndicator";
import { ServiceWorkerProvider } from "../components/desktop/pwa/ServiceWorkerProvider";
import { PWAInstallPrompt } from "../components/desktop/pwa/PWAInstallPrompt";

export const metadata: Metadata = {
  title: "StorySphere",
  description: "Multi-platform novel reader",
  manifest: "/pwa/manifest.json",
  themeColor: "#38bdf8",
  icons: {
    icon: "/pwa/icons/icon-192x192.png",
    apple: "/pwa/icons/icon-192x192.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ErrorBoundary>
          <ServiceWorkerProvider>
            <Providers>
              {children}
              <OfflineIndicator />
              <PWAInstallPrompt />
            </Providers>
          </ServiceWorkerProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
