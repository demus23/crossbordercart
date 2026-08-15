import type { CapacitorConfig } from "@capacitor/cli";

// Cross Border Cart — native shell config.
//
// This app does NOT bundle a local web build. It loads the live production
// site directly (server.url below), so the web app and the mobile app are
// always the same codebase/deploy — no separate mobile build to keep in
// sync. This is what lets us ship without a Next.js static-export rewrite,
// since the site relies on API routes / SSR that a static export can't serve.
const config: CapacitorConfig = {
  appId: "com.crossbordercart.app",
  appName: "Cross Border Cart",
  webDir: "www", // required by the CLI even though it's unused at runtime in remote-URL mode
  server: {
    url: "https://www.crossbordercart.com",
    cleartext: false,
    // Allow in-app navigation to stay inside the webview for our own domain;
    // everything else (WhatsApp, payment provider redirects, etc.) should be
    // routed through the in-app browser plugin instead of navigating away —
    // see src/externalLinks.ts.
    allowNavigation: ["www.crossbordercart.com", "crossbordercart.com"],
  },
  ios: {
    contentInset: "automatic",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      backgroundColor: "#0f766e",
      androidSplashResourceName: "splash",
      showSpinner: false,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
