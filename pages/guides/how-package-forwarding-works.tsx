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
      dek="A plain-language explanation of how a Dubai forwarding address works — from shopping online and receiving packages in the UAE to consolidation and international shipping."
      metaDescription="Learn how package forwarding from Dubai works: get a UAE delivery address, receive online orders, consolidate eligible packages and ship internationally."
    >
      <p>
        Package forwarding from Dubai gives international shoppers a UAE
        delivery address they can use when shopping online. Your purchases
        are delivered to that address first and then forwarded internationally
        to your destination.
      </p>

      <p>
        The idea is simple: instead of asking every online store to ship
        directly to your country, you receive your purchases at one UAE
        address and arrange international shipping from there.
      </p>

      <h2>How package forwarding from Dubai works</h2>

      <h3>1. You get a UAE delivery address</h3>

      <p>
        After creating an account with a package forwarding service, you
        receive a warehouse delivery address in the UAE. Your account or
        customer details allow incoming packages to be matched to you when
        they arrive.
      </p>

      <h3>2. You shop online using your Dubai address</h3>

      <p>
        When shopping at an eligible UAE online store, you enter your
        forwarding address as the delivery address at checkout. The retailer
        then sends the order to the UAE warehouse as a domestic delivery.
      </p>

      <h3>3. Your package arrives at the warehouse</h3>

      <p>
        Once the parcel arrives, the forwarding service records it. Depending
        on the service, you may receive details such as package photos,
        weight and dimensions before arranging international shipping.
      </p>

      <h3>4. You decide what to ship</h3>

      <p>
        You can arrange shipment of an eligible package or wait for additional
        online orders to arrive. If you have several eligible packages,
        consolidation may allow them to be combined before international
        shipping.
      </p>

      <h3>5. You receive international shipping options</h3>

      <p>
        The shipping price can depend on the destination, carrier and the
        package's actual or volumetric weight. Once the available option is
        selected and paid for, the package can be dispatched internationally.
      </p>

      <MidCTA />

      <h2>What is a UAE package forwarding address?</h2>

      <p>
        A UAE package forwarding address is a delivery address used to receive
        online purchases on your behalf before they are shipped to another
        country.
      </p>

      <p>
        This is particularly useful when an online retailer delivers within
        the UAE but does not offer direct international delivery to your
        destination.
      </p>

      <h2>Why use package forwarding from Dubai?</h2>

      <ul>
        <li>
          Access UAE online stores that may not ship directly to your country.
        </li>

        <li>
          Shop products or brands that may be difficult to find locally.
        </li>

        <li>
          Receive purchases from several online stores at one UAE address.
        </li>

        <li>
          Consolidate eligible packages before international shipping.
        </li>

        <li>
          Review package information before arranging onward delivery.
        </li>
      </ul>

      <h2>How package consolidation works</h2>

      <p>
        If you buy from several stores, your purchases may arrive at the
        warehouse as separate parcels. Eligible packages can sometimes be
        consolidated before international shipping.
      </p>

      <p>
        Consolidation can make multiple purchases easier to manage, but it
        does not automatically guarantee a lower shipping price. Final cost
        still depends on factors such as actual weight, volumetric weight,
        destination and carrier pricing.
      </p>

      <p>
        <Link className="inline-link" href="/consolidation">
          Learn how CBC package consolidation works →
        </Link>
      </p>

      <h2>How is international shipping cost calculated?</h2>

      <p>
        International shipping is not determined only by the number of items
        in your package. Carriers may compare the package's actual weight with
        its volumetric weight, which reflects how much space the parcel takes
        up during transport.
      </p>

      <p>
        This means a large but lightweight box can sometimes be charged at a
        higher weight than the number shown on a scale.
      </p>

      <p>
        <Link
          className="inline-link"
          href="/guides/actual-vs-volumetric-weight"
        >
          Learn about actual vs volumetric weight →
        </Link>
      </p>

      <h2>Where can packages be forwarded?</h2>

      <p>
        Available destinations depend on the forwarding service and carrier
        network. CBC focuses on forwarding eligible purchases from the UAE to
        supported destinations across Africa.
      </p>

      <p>
        <Link className="inline-link" href="/ship-to">
          See CBC shipping destinations →
        </Link>
      </p>

      <h2>What package forwarding does not do</h2>

      <p>
        Package forwarding does not remove customs requirements. The
        destination country's customs authority may apply import rules,
        duties or taxes depending on the shipment.
      </p>

      <p>
        It also does not mean every product can be shipped internationally.
        Batteries, liquids and other regulated or restricted products may
        require special handling or may not be accepted by particular
        carriers or destinations.
      </p>

      <div className="callout">
        CBC gives customers a UAE delivery address, records packages when
        they arrive and allows eligible purchases to be consolidated before
        international forwarding.{" "}
        <Link className="inline-link" href="/how-it-works">
          See how CBC works →
        </Link>
      </div>

      <h2>Ready to get your UAE delivery address?</h2>

      <p>
        Create your CBC account and get your Dubai delivery address for
        eligible online purchases. Once your packages arrive, you can review
        them and arrange international forwarding.
      </p>

      <p>
        <Link className="inline-link" href="/signup">
          Create your free CBC account →
        </Link>
      </p>
    </GuideLayout>
  );
}