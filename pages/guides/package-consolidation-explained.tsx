// pages/guides/package-consolidation-explained.tsx
import Link from "next/link";
import GuideLayout, { MidCTA } from "@/components/GuideLayout";

export default function Guide() {
  return (
    <GuideLayout
      slug="package-consolidation-explained"
      category="Shipping Guides"
      categoryHref="/guides"
      title="Package Consolidation Explained: When Can It Save Shipping Costs?"
      dek="What consolidation actually means, when it helps, and why it doesn't always guarantee a lower shipping bill."
      metaDescription="How package consolidation works when forwarding from the UAE, and when it does — and doesn't — reduce your total shipping cost."
    >
      <p>
        If you've shopped from more than one UAE store, you've probably seen the word "consolidation" come up. It sounds like a guaranteed discount, but it's more nuanced than that — here's what it actually does.
      </p>

      <h2>What consolidation is</h2>
      <p>
        Consolidation means combining two or more separate packages that arrived at your forwarding address into a single shipment, rather than shipping each one individually. Instead of paying for three separate shipping charges, you pay for one.
      </p>

      <h2>Why it can reduce costs</h2>
      <p>
        International shipping is usually priced by weight — either the actual weight of the package, or its <Link className="inline-link" href="/guides/actual-vs-volumetric-weight">volumetric weight</Link>, whichever is higher. Each individual shipment also tends to carry its own base handling and packaging overhead. Combining packages can reduce that duplicated overhead and consolidate everything into fewer, sometimes better-optimized boxes.
      </p>

      <h2>Why it doesn't always save money</h2>
      <p>
        This is the part that's easy to overlook: shipping is still calculated on the final consolidated package's actual or volumetric weight, whichever is higher. If your combined shipment ends up bulky rather than dense, the volumetric calculation can offset — or even outweigh — the savings from combining boxes in the first place.
      </p>
      <p>
        In short: consolidation can reduce unnecessary packaging and simplify a multi-order purchase into one manageable shipment. Whether it actually lowers your total cost depends on the final weight and size of what you end up shipping.
      </p>

      <MidCTA />

      <h2>When consolidation makes the most sense</h2>
      <ul>
        <li>You're ordering multiple small, dense items (clothing, books, accessories) that pack down efficiently together</li>
        <li>You want one shipment to track instead of several</li>
        <li>Your items don't have conflicting handling requirements</li>
      </ul>

      <h2>When it might not</h2>
      <ul>
        <li>Your items are bulky or oversized — combining them may not reduce volumetric weight much</li>
        <li>Some items require separate handling (fragile, restricted, or specialized products)</li>
        <li>You're only shipping one package to begin with</li>
      </ul>

      <div className="callout">
        Not sure if consolidation makes sense for your specific order? <Link className="inline-link" href="/consolidation">Read how CBC's consolidation process works →</Link> or ask before you request it.
      </div>
    </GuideLayout>
  );
}