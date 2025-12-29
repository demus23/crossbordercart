// pages/_app.tsx
import "../styles/globals.css"; 
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { AppProps } from 'next/app';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SessionProvider } from 'next-auth/react';
import { MantineProvider } from '@mantine/core';
import Head from 'next/head';
import NavBar from "@/components/NavBar";

export default function MyApp({ Component, pageProps, router  }: AppProps) {
  const hideNav = router.pathname === "/"; // hide on home only
  return (
    <>
      {/* ✅ This fixes the mobile/tablet layout issue */}
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
      </Head>

      <MantineProvider>
        <SessionProvider session={pageProps.session}>
          <>
            {!hideNav && <NavBar />}
            <Component {...pageProps} />
            <ToastContainer position="top-right" autoClose={3000} />
          </>
        </SessionProvider>
      </MantineProvider>
    </>
  );
}
