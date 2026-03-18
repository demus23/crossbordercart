import "../styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "react-toastify/dist/ReactToastify.css";

import type { AppProps } from "next/app";
import Head from "next/head";
import { SessionProvider } from "next-auth/react";
import { MantineProvider } from "@mantine/core";
import { ToastContainer } from "react-toastify";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Cross Border Cart</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Browser tab icon */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <MantineProvider>
        <SessionProvider session={pageProps.session}>
          <Component {...pageProps} />
          <ToastContainer position="top-right" autoClose={3000} />
        </SessionProvider>
      </MantineProvider>
    </>
  );
}