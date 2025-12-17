import Head from "next/head";
import Link from "next/link";

export default function PoliciesIndexPage() {
  return (
    <>
      <Head>
        <title>Policies | CrossBorderCart</title>
      </Head>

      <main className="page page--light">
        <section className="hero hero--small">
          <h1>Policies</h1>
          <p className="hero__subtitle">
            Learn how we handle your data, shipments, payments and refunds.
          </p>
        </section>

        <section className="section">
          <div className="grid grid--2">
            <Link href="/policies/privacy" className="card card--link">
              <h2>Privacy Policy</h2>
              <p>How we collect, use and protect your information.</p>
            </Link>
            <Link href="/policies/terms" className="card card--link">
              <h2>Terms &amp; Conditions</h2>
              <p>The rules for using CrossBorderCart services.</p>
            </Link>
            <Link href="/policies/shipping" className="card card--link">
              <h2>Shipping Policy</h2>
              <p>Processing times, transit, customs and delivery.</p>
            </Link>
            <Link href="/policies/refunds" className="card card--link">
              <h2>Refund Policy</h2>
              <p>When and how refunds are handled.</p>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
