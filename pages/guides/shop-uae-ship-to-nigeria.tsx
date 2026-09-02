// pages/guides/shop-uae-ship-to-nigeria.tsx
import Link from "next/link";
import GuideLayout, { MidCTA } from "@/components/GuideLayout";

export default function Guide() {
  return (
    <GuideLayout
      slug="shop-uae-ship-to-nigeria"
      category="Shopping Guides"
      categoryHref="/guides"
      title="How to Shop Online in the UAE and Ship to Nigeria"
      dek="A practical walkthrough for shopping UAE stores from Nigeria — from getting a Dubai address to receiving your package at home."
      metaDescription="Step-by-step guide to shopping UAE online stores and shipping your purchases to Nigeria using a Dubai forwarding address."
    >
      <p>
        Many UAE retailers stock brands and products that are hard to find or expensive locally in Nigeria. The catch is that most of these stores only deliver within the UAE. A package forwarding address solves that by giving you a UAE delivery point that then ships onward to Nigeria.
      </p>

      <h2>The basic idea</h2>
      <p>
        You sign up for a free forwarding address in Dubai, use it at checkout on any UAE store, and the retailer ships your order there like any normal domestic delivery. The forwarding company then repackages and ships your order internationally to your address in Nigeria.
      </p>

      <h2>Step by step</h2>
      <ol>
        <li><strong>Get your free Dubai address.</strong> Sign up with a forwarding service — this takes a few minutes.</li>
        <li><strong>Shop UAE stores normally.</strong> Use your forwarding address at checkout instead of a Nigerian one.</li>
        <li><strong>Check your package arrived.</strong> Look for photo confirmation once it reaches the Dubai warehouse.</li>
        <li><strong>Combine orders if you have more than one.</strong> Consolidation can combine multiple packages into a single shipment before it heads to Nigeria.</li>
        <li><strong>Get a real quote and ship.</strong> Pricing is based on your package's actual weight and size — pay and track it from there.</li>
      </ol>

      <MidCTA />

      <h2>Things worth knowing before you order</h2>
      <ul>
        <li><strong>Not everything can be forwarded.</strong> Some products face carrier or customs restrictions — check first if you're ordering electronics, batteries, or anything unusual.</li>
        <li><strong>Nigerian customs may apply duties</strong> on imported goods depending on the item and declared value — this is separate from the shipping fee itself.</li>
        <li><strong>Buy sizes you're sure of.</strong> Once your order leaves the UAE, returning it to the original store is far more difficult than a local return would be.</li>
      </ul>

      <div className="callout">
        CBC provides a free UAE address, photographs every package on arrival, and can consolidate eligible orders before shipping to Nigeria. <Link className="inline-link" href="/ship-to/nigeria">See supported destinations →</Link>
      </div>

      <h2>Starting with a small order</h2>
      <p>
        If you haven't used a forwarding service before, start with one order you're confident about rather than several at once. That gives you a feel for how the warehouse notifies you, how consolidation works, and what the real shipping cost looks like — before you commit to anything bigger.
      </p>
    </GuideLayout>
  );
}