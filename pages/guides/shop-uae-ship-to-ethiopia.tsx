// pages/guides/shop-uae-ship-to-ethiopia.tsx
import Link from "next/link";
import GuideLayout, { MidCTA } from "@/components/GuideLayout";

export default function Guide() {
  return (
    <GuideLayout
      slug="shop-uae-ship-to-ethiopia"
      category="Shopping Guides"
      categoryHref="/guides"
      title="How to Shop Online in the UAE and Ship to Ethiopia"
      dek="A practical walkthrough for shopping UAE stores like Amazon.ae and Noon from Ethiopia — from getting a Dubai address to receiving your package at home."
      metaDescription="Step-by-step guide to shopping UAE online stores and shipping your purchases to Ethiopia using a Dubai forwarding address."
    >
      <p>
        UAE online stores carry a huge range of products — often at better prices or wider selection than what's available locally in Ethiopia. The problem is simple: most UAE retailers only ship within the UAE. This guide walks through how to get around that using a Dubai forwarding address.
      </p>

      <h2>The basic idea</h2>
      <p>
        A package forwarding service gives you a real street address in Dubai. You use that address when you check out at a UAE store, the store ships to Dubai as normal, and the forwarding company then ships your package onward to you in Ethiopia. From the retailer's point of view, it's just a domestic UAE delivery.
      </p>

      <h2>Step by step</h2>
      <ol>
        <li><strong>Create a free account</strong> with a UAE forwarding service and get your personal Dubai address.</li>
        <li><strong>Shop as normal</strong> on any UAE store — enter your forwarding address as the delivery address at checkout.</li>
        <li><strong>Wait for arrival confirmation.</strong> A good service will notify you and show photos once your package reaches their warehouse.</li>
        <li><strong>Decide what to ship, and how.</strong> If you've ordered from more than one store, you can usually request consolidation to combine packages before international shipping.</li>
        <li><strong>Get a shipping quote</strong> based on the actual weight and dimensions of your package, then pay and track it to Ethiopia.</li>
      </ol>

      <MidCTA />

      <h2>What to check before you order</h2>
      <ul>
        <li><strong>Restricted items.</strong> Not everything can be shipped internationally — check before ordering anything unusual, especially electronics or batteries.</li>
        <li><strong>Customs duties.</strong> Ethiopian customs may apply duties depending on the item and its declared value. This is separate from your shipping cost.</li>
        <li><strong>Sizing and returns.</strong> Once a package is forwarded internationally, returning it to the original UAE store becomes much harder — buy sizes and specs you're confident about.</li>
      </ul>

      <div className="callout">
        CBC gives you a free UAE address, photographs every package that arrives, and lets you consolidate eligible orders before shipping to Ethiopia. <Link className="inline-link" href="/destinations/ethiopia">See the full Ethiopia shipping page →</Link>
      </div>

      <h2>A realistic first order</h2>
      <p>
        If this is your first time using a forwarding address, it's worth starting small — order one item you're confident about, watch it arrive at the warehouse, and get a shipping quote before scaling up to bigger or multiple orders. That way you understand the full process, including actual shipping cost, before committing to something larger.
      </p>
    </GuideLayout>
  );
}