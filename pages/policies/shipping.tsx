import Head from "next/head";

export default function ShippingPolicyPage() {
  return (
    <>
      <Head>
        <title>Shipping Policy | CrossBorderCart</title>
      </Head>

      <main className="page page--light">
        <section className="hero hero--small">
          <h1>Shipping Policy</h1>
          <p className="hero__subtitle">
            Information about shipping methods, timelines and responsibilities.
          </p>
        </section>

        <section className="section policy">
          <h2>1. Processing time</h2>
          <p>
            Once your package is received at our warehouse and all charges are
            paid, we generally process and hand over to the carrier within 1–2
            working days.
          </p>

          <h2>2. Transit times</h2>
          <p>
            Transit times depend on the service you choose and the destination
            country:
          </p>
          <ul>
            <li>Express services: usually 3–7 working days.</li>
            <li>Economy services: usually 7–14 working days.</li>
          </ul>
          <p>
            These are estimates only. Delays may occur due to customs or carrier
            operations.
          </p>

          <h2>3. Tracking</h2>
          <p>
            Every shipment receives a tracking number visible in your dashboard
            and on our public tracking page. Tracking updates are provided by
            the carrier and may vary in frequency.
          </p>

          <h2>4. Customs clearance</h2>
          <p>
            Customs procedures are controlled by your country&apos;s authorities.
            We provide invoices and documentation, but we cannot control customs
            inspection times or decisions.
          </p>

          <h2>5. Address accuracy</h2>
          <p>
            You are responsible for entering a correct and complete delivery
            address. We are not responsible for shipments delayed or returned
            due to incorrect addresses.
          </p>

          <h2>6. Lost or damaged shipments</h2>
          <p>
            If your shipment appears lost or damaged, please contact us
            immediately. We will raise a claim with the carrier and assist you
            according to their policies and any optional insurance you
            purchased.
          </p>
        </section>
      </main>
    </>
  );
}
