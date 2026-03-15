import Head from "next/head";

export default function TermsPage() {
  return (
    <>
      <Head>
        <title>Terms &amp; Conditions | CrossBorderCart</title>
      </Head>

      <main className="page page--light">
        <section className="hero hero--small">
          <h1>Terms &amp; Conditions</h1>
          <p className="hero__subtitle">
            Please read these terms carefully before using CrossBorderCart.
          </p>
        </section>

        <section className="section policy">
          <h2>1. Acceptance of terms</h2>
          <p>
            By creating an account or using our services, you agree to these
            Terms &amp; Conditions. If you do not agree, please do not use
            CrossBorderCart.
          </p>

          <h2>2. Service description</h2>
          <p>
            We provide a forwarding and consolidation service. We receive
            packages on your behalf at our warehouse, store them for a limited
            period and arrange shipment to your final address using third-party
            carriers.
          </p>

          <h2>3. Your responsibilities</h2>
          <ul>
            <li>
              Provide accurate contact and delivery information and keep it
              updated.
            </li>
            <li>
              Ensure that items you ship are legal and compliant with export and
              import regulations.
            </li>
            <li>
              Pay all applicable shipping charges, customs duties, taxes and
              other fees.
            </li>
          </ul>

          <h2>4. Prohibited items</h2>
          <p>
            You may not ship: illegal goods, dangerous goods, weapons,
            explosives, cash, counterfeit products or items restricted by the
            carrier or destination country. We may refuse or dispose of
            prohibited items.
          </p>

          <h2>5. Liability</h2>
          <p>
            We act as an intermediary between you and the carrier. While we take
            great care of your packages, our liability is limited to the amount
            permitted by applicable law and any optional insurance you have
            purchased.
          </p>

          <h2>6. Payments &amp; refunds</h2>
          <p>
            All charges must be paid before a shipment is released. Refunds, if
            applicable, are handled according to our{" "}
            <a href="/policies/refunds">Refund Policy</a>.
          </p>

          <h2>7. Changes to these terms</h2>
          <p>
            We may update these terms from time to time. The latest version will
            always be available on this page.
          </p>

          <h2>8. Contact</h2>
          <p>
            If you have questions about these terms, please contact us at{" "}
            <a href="mailto:support.crossbordercart@gmail.com">
              support.crossbordercart@gmail.com
            </a>
            .
          </p>

          <p className="policy__note">
            This document is a template and should be reviewed by a legal
            professional for your jurisdiction.
          </p>
        </section>
      </main>
    </>
  );
}
