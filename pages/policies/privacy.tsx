import Head from "next/head";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Head>
        <title>Privacy Policy | CrossBorderCart</title>
      </Head>

      <main className="page page--light">
        <section className="hero hero--small">
          <h1>Privacy Policy</h1>
          <p className="hero__subtitle">
            How we collect, use and protect your information when you use
            CrossBorderCart.
          </p>
        </section>

        <section className="section policy">
          <h2>1. Who we are</h2>
          <p>
            CrossBorderCart (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;)
            provides cross-border shipping and consolidation services from the
            United Arab Emirates to customers around the world.
          </p>

          <h2>2. Information we collect</h2>
          <ul>
            <li>
              <strong>Account information</strong> – name, email address, phone
              number, password and billing details.
            </li>
            <li>
              <strong>Shipment information</strong> – package contents,
              tracking numbers, values, photos and delivery addresses.
            </li>
            <li>
              <strong>Usage data</strong> – IP address, device details and basic
              analytics about how you use our website.
            </li>
          </ul>

          <h2>3. How we use your information</h2>
          <ul>
            <li>To provide and manage your CrossBorderCart account.</li>
            <li>
              To receive, store, consolidate and ship your packages to the
              correct address.
            </li>
            <li>To process payments and prevent fraud.</li>
            <li>To communicate with you about shipments, invoices and support.</li>
            <li>
              To improve our services and comply with legal or regulatory
              requirements.
            </li>
          </ul>

          <h2>4. Sharing of information</h2>
          <p>We may share your information with:</p>
          <ul>
            <li>Shipping carriers and logistics partners.</li>
            <li>
              Payment providers and financial institutions that process
              transactions.
            </li>
            <li>
              Service providers that help us operate our website and customer
              support.
            </li>
            <li>
              Government or customs authorities when required by applicable law.
            </li>
          </ul>

          <h2>5. Data retention</h2>
          <p>
            We keep your account and shipment data for as long as needed to
            provide our service and for a reasonable period afterwards for
            accounting and legal purposes.
          </p>

          <h2>6. Your rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you.</li>
            <li>Request correction of inaccurate information.</li>
            <li>Request deletion of your account where legally possible.</li>
          </ul>

          <h2>7. Contact</h2>
          <p>
            For privacy questions, please contact us at{" "}
            <a href="mailto:privacy@crossbordercart.com">
              privacy@crossbordercart.com
            </a>
            .
          </p>

          <p className="policy__note">
            This Privacy Policy is a general template and does not replace legal
            advice. Please review with your legal advisor before publishing.
          </p>
        </section>
      </main>
    </>
  );
}
