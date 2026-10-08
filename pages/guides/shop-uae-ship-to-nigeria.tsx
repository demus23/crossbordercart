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
      dek="A practical guide to shopping UAE stores from Nigeria — from getting a Dubai delivery address to forwarding your packages to Nigeria."
      metaDescription="Learn how to shop UAE online stores from Nigeria using a Dubai forwarding address, consolidate eligible packages and ship your purchases to Nigeria."
    >
      <p>
        Many UAE retailers stock brands and products that can be difficult
        to find locally in Nigeria. But some UAE stores only deliver within
        the UAE. A package forwarding service gives you a Dubai delivery
        address so you can receive eligible purchases in the UAE and then
        forward them to Nigeria.
      </p>

      <h2>How to shop in the UAE and ship to Nigeria</h2>

      <p>
        You sign up for a forwarding address in Dubai and use that address
        when shopping online. The retailer delivers your purchase to the UAE
        address like a normal domestic order. Once the package arrives at the
        forwarding warehouse, you can arrange onward shipping to Nigeria.
      </p>

      <h2>Step by step</h2>

      <ol>
        <li>
          <strong>Get your Dubai address.</strong> Create your forwarding
          account and receive your UAE delivery address.
        </li>

        <li>
          <strong>Shop UAE stores.</strong> Use your Dubai forwarding address
          as the delivery address when checking out.
        </li>

        <li>
          <strong>Wait for your package to arrive.</strong> Once your order
          reaches the warehouse, you can review the package information
          before international shipping.
        </li>

        <li>
          <strong>Combine eligible orders if needed.</strong> If you ordered
          from several stores, package consolidation can combine eligible
          purchases before shipping to Nigeria.
        </li>

        <li>
          <strong>Get your shipping quote.</strong> International shipping
          cost can depend on the package's actual or volumetric weight,
          destination and available carrier options.
        </li>

        <li>
          <strong>Ship to Nigeria.</strong> Choose an available shipping
          option and track your package after dispatch.
        </li>
      </ol>

      <MidCTA />

      <h2>Can I shop from Dubai and deliver to Nigeria?</h2>

      <p>
        Yes, a UAE package forwarding address can be used when an eligible
        online store delivers within the UAE but does not offer direct
        delivery to Nigeria. Your order is delivered to your Dubai forwarding
        address first and then shipped internationally to Nigeria.
      </p>

      <h2>Why consolidate packages before shipping?</h2>

      <p>
        If you buy from several UAE stores, your purchases may arrive at
        different times and in separate packages. Eligible orders can be
        consolidated before international shipping, allowing you to manage
        multiple purchases as one shipment.
      </p>

      <p>
        Consolidation does not always mean a lower shipping price. The final
        cost still depends on factors such as actual weight, volumetric
        weight, destination and carrier pricing.
      </p>

      <h2>Things worth knowing before you order</h2>

      <ul>
        <li>
          <strong>Not everything can be forwarded.</strong> Some products
          have carrier, customs or transport restrictions. Check before
          ordering batteries, liquids or other regulated items.
        </li>

        <li>
          <strong>Nigerian customs may apply duties or taxes.</strong> These
          can depend on the product, declared value and applicable import
          rules and are separate from the forwarding charge.
        </li>

        <li>
          <strong>Actual vs volumetric weight matters.</strong> A lightweight
          but bulky package can sometimes be charged based on its dimensions
          rather than only its scale weight.
        </li>

        <li>
          <strong>Check sizes and specifications carefully.</strong>
          International returns can be more complicated than domestic
          returns.
        </li>
      </ul>

      <div className="callout">
        CBC provides a UAE delivery address, photographs packages on arrival,
        and allows eligible orders to be consolidated before shipping to
        Nigeria.{" "}
        <Link className="inline-link" href="/ship-to/nigeria">
          See shipping from UAE to Nigeria →
        </Link>
      </div>

      <h2>Starting with a small order</h2>

      <p>
        If you haven't used a forwarding service before, consider starting
        with one relatively small order. This lets you see how the warehouse
        receiving process works and understand the international shipping
        quote before placing larger or multiple orders.
      </p>

      <h2>Ready to shop UAE stores from Nigeria?</h2>

      <p>
        Create your CBC account, get your UAE delivery address and use it for
        eligible online purchases. Once your package arrives in Dubai, you
        can arrange forwarding to Nigeria.
      </p>

      <p>
        <Link className="inline-link" href="/signup">
          Create your free CBC account →
        </Link>
      </p>
    </GuideLayout>
  );
}