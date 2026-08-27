// pages/guides/ship-electronics-from-dubai.tsx
import Link from "next/link";
import GuideLayout, { MidCTA } from "@/components/GuideLayout";

export default function Guide() {
  return (
    <GuideLayout
      slug="ship-electronics-from-dubai"
      category="Shipping Guides"
      categoryHref="/guides"
      title="Can I Ship Electronics from Dubai Internationally?"
      dek="What generally ships without issue, what needs extra care, and why the answer often depends on the specific item and destination."
      metaDescription="A guide to shipping electronics internationally from Dubai — what's generally fine, what requires extra care, and why to check first."
    >
      <p>
        Electronics are one of the most popular categories shoppers want to forward from the UAE — and one of the categories with the most variation in what's actually allowed. This guide covers the general picture, not a guarantee for any specific product.
      </p>

      <h2>Why electronics are different from clothing or books</h2>
      <p>
        Airlines, carriers, and customs authorities apply extra scrutiny to electronics for a few reasons: many contain lithium batteries (which have their own separate shipping regulations), some have import restrictions or licensing requirements in certain countries, and higher-value items may attract closer customs review.
      </p>

      <h2>Generally straightforward</h2>
      <ul>
        <li>Small personal electronics without built-in batteries removed from original packaging (accessories, cables, non-battery components)</li>
        <li>Items already commonly shipped internationally by major retailers</li>
      </ul>

      <h2>Usually fine, but worth checking</h2>
      <ul>
        <li><strong>Phones and laptops</strong> — generally shippable, but check your destination country's import rules for personal electronics, especially around declared value and duties</li>
        <li><strong>Devices with built-in lithium batteries</strong> — subject to specific carrier packaging and labeling requirements</li>
        <li><strong>Larger electronics</strong> (TVs, appliances) — may face size/weight-based restrictions or higher duties depending on destination</li>
      </ul>

      <h2>What can complicate things</h2>
      <ul>
        <li>Loose lithium batteries or battery packs shipped separately from a device</li>
        <li>Items requiring specific import licenses in the destination country</li>
        <li>High declared values that trigger closer customs review</li>
      </ul>

      <MidCTA />

      <div className="callout">
        This is general guidance, not a guarantee for any specific product or destination — carrier and customs rules vary and change. If you're planning to order something valuable or unusual, <Link className="inline-link" href="/guides#quote">ask before you buy</Link>, not after your package has already arrived.
      </div>

      <h2>A simple rule of thumb</h2>
      <p>
        If an item is small, doesn't contain a battery, and is something people commonly ship internationally already, it's usually straightforward. Anything larger, battery-powered, or unusually valuable is worth a quick check with your forwarding service before you place the order — not after.
      </p>
    </GuideLayout>
  );
}