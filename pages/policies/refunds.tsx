import Head from "next/head";

export default function RefundPolicyPage() {
  return (
    <>
      <Head>
        <title>Refund Policy | CrossBorderCart</title>
      </Head>

      <main className="page page--light">
        <section className="hero hero--small">
          <h1>Refund Policy</h1>
          <p className="hero__subtitle">
            How we handle refunds for shipping charges and service fees.
          </p>
        </section>

        <section className="section policy">
          <h2>1. Shipping fees</h2>
          <p>
            Shipping fees are generally non-refundable once a shipment has been
            collected by the carrier, unless the shipment is cancelled before
            pickup.
          </p>

          <h2>2. Service fees</h2>
          <p>
            Warehouse handling, consolidation and special request fees are
            non-refundable once the service has been completed.
          </p>

          <h2>3. Lost shipments</h2>
          <p>
            If a shipment is confirmed lost by the carrier, compensation will be
            handled according to the carrier&apos;s policy and any optional
            insurance selected at the time of shipment.
          </p>

          <h2>4. Damaged items</h2>
          <p>
            If you receive damaged items, contact us within 48 hours with
            photos. We will help you open a claim with the carrier. Outcome
            depends on the carrier&apos;s investigation and insurance coverage.
          </p>

          <h2>5. How to request a refund</h2>
          <p>
            For any refund request, please email{" "}
            <a href="mailto:billing@crossbordercart.com">
              billing@crossbordercart.com
            </a>{" "}
            and include your shipment ID, tracking number and a clear
            explanation of the issue.
          </p>

          <p className="policy__note">
            This is a general template. Please adapt and confirm with your
            accountant / legal advisor.
          </p>
        </section>
      </main>
    </>
  );
}
