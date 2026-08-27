// pages/guides/how-package-forwarding-works.tsx
import Link from "next/link";
import GuideLayout, { MidCTA } from "@/components/GuideLayout";

export default function Guide() {
  return (
    <GuideLayout
      slug="how-package-forwarding-works"
      category="Shipping Guides"
      categoryHref="/guides"
      title="How Package Forwarding from Dubai Works"
      dek="A plain-language explanation of what a forwarding address actually is, and what happens to your package between checkout and delivery."
      metaDescription="How package forwarding from Dubai works: getting a UAE address, receiving packages, consolidation, and international shipping explained simply."
    >
      <p>
        "Package forwarding" sounds more complicated than it actually is. At its core, it's a simple idea: you get a real address in a country you can't normally ship to yourself, and a company receives packages there on your behalf, then ships them onward to you.
      </p>

      <h2>The four parts of the process</h2>
      <h3>1. You get a UAE address</h3>
      <p>
        This isn't a P.O. box — it's a real warehouse address, usually with a unique suite or customer number attached so incoming packages can be matched to your account.
      </p>
      <h3>2. You shop like a UAE resident</h3>
      <p>
        Any UAE store that ships domestically will work. You simply enter your forwarding address instead of a home address at checkout. As far as the retailer is concerned, it's a normal local delivery.
      </p>
      <h3>3. The package arrives and is recorded</h3>
      <p>
        A good forwarding service logs the package, weighs it, and — ideally — photographs it, so you can confirm what arrived and in what condition before deciding what to do next.
      </p>
      <h3>4. You choose how it ships onward</h3>
      <p>
        From your dashboard, you typically get options: ship the package as-is, hold it while you wait for other orders to arrive, or request consolidation to combine multiple packages into one shipment.
      </p>

      <MidCTA />

      <h2>Why people use it</h2>
      <ul>
        <li>Access to UAE-only retailers and product ranges not available locally</li>
        <li>Often better pricing or selection than local equivalents</li>
        <li>The ability to combine multiple orders into fewer international shipments</li>
      </ul>

      <h2>What it isn't</h2>
      <p>
        Forwarding doesn't get around customs. Your destination country's customs authority still applies its own rules and any applicable duties — the forwarding service just handles the shipping and logistics side, not customs law. It also doesn't guarantee every product can be shipped; some items face restrictions regardless of the forwarder used.
      </p>

      <div className="callout">
        CBC handles this exact process for shoppers ordering from the UAE and shipping to destinations across Africa. <Link className="inline-link" href="/how-it-works">See how CBC's process works →</Link>
      </div>
    </GuideLayout>
  );
}