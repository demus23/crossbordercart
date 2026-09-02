import "../styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "react-toastify/dist/ReactToastify.css";

import type { AppProps } from "next/app";
import Head from "next/head";
import Script from "next/script";
import { SessionProvider } from "next-auth/react";
import { MantineProvider } from "@mantine/core";
import { ToastContainer } from "react-toastify";
import CapacitorNative from "../components/CapacitorNative";

const GA_MEASUREMENT_ID = "G-3H0471HBRN";
const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        {/* Default/fallback title.
            Individual public pages should override this. */}
        <title>Cross Border Cart</title>

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />

        <link
          rel="icon"
          href="/favicon.svg"
          type="image/svg+xml"
        />
      </Head>

      {/* Google Analytics (GA4) */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />

      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>

      {/* Microsoft Clarity (heatmaps + session recordings).
          No-ops until NEXT_PUBLIC_CLARITY_ID is set. */}
      {CLARITY_PROJECT_ID && (
        <Script id="clarity-init" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
          `}
        </Script>
      )}

      <MantineProvider>
        <SessionProvider session={pageProps.session}>
          <CapacitorNative />

          <Component {...pageProps} />

          <ToastContainer
            position="top-right"
            autoClose={3000}
          />
        </SessionProvider>
      </MantineProvider>
    </>
  );
}