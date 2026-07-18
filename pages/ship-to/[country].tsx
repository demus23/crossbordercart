// pages/ship-to/[country].tsx
//
// Statically generated country landing page for SEO.
// Follows the same pattern as pages/track/[id].tsx (SSR/SSG, no login required).
//
// Design tokens match the existing CrossBorderCart system:
//   navy:      #0B1220
//   teal:      #0ea5a2
//   mint:      #00E5A0
//   teal-dark: #0b3f3e
//   light-bg:  #f6fbfb

import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import {
  africaShippingData,
  getAllCountrySlugs,
  getCountryBySlug,
  CountryShippingInfo,
} from "../../lib/africaShippingData";

interface Props {
  country: CountryShippingInfo;
}

const WHATSAPP_NUMBER = "971500000000"; // TODO: replace with your real WhatsApp business number

const CountryPage: NextPage<Props> = ({ country }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const canonicalUrl = `https://crossbordercart.com/ship-to/${country.slug}`;
  const waLink = `https://wa.me/${+971525350353}?text=${encodeURIComponent(
    `Hi! I'd like a shipping quote from UAE to ${country.name}.`
  )}`;

  // schema.org structured data: Service + FAQPage
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        serviceType: "Package forwarding and courier delivery",
        name: `UAE to ${country.name} Shipping`,
        areaServed: {
          "@type": "Country",
          name: country.name,
        },
        provider: {
          "@type": "Organization",
          name: "CrossBorderCart",
          url: "https://crossbordercart.com",
        },
        description: country.metaDescription,
      },
      {
        "@type": "FAQPage",
        mainEntity: country.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: f.a,
          },
        })),
      },
    ],
  };

  return (
    <>
      <Head>
        <title>{country.metaTitle}</title>
        <meta name="description" content={country.metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={country.metaTitle} />
        <meta property="og:description" content={country.metaDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <main className="page">
        {/* HERO */}
        <section className="hero">
          <div className="heroInner">
            <p className="eyebrow">
              <Link href="/ship-to">All destinations</Link> / {country.region}
            </p>
            <h1>
              <span className="flag">{country.flagEmoji}</span> Ship to {country.name} from the UAE
            </h1>
            <p className="heroBlurb">{country.heroBlurb}</p>
            <div className="heroCtas">
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="btnPrimary">
                Get a quote on WhatsApp
              </a>
              <Link href="/#calculator" className="btnGhost">
                Use shipping calculator
              </Link>
            </div>
          </div>
        </section>

        {/* PRICING TIERS */}
        <section className="section">
          <h2>Choose your service</h2>
          <div className="tierGrid">
            <div className="card">
              <span className="tierBadge express">Express</span>
              <p className="tierDays">{country.express.days}</p>
              <p className="tierPrice">
                {country.express.priceFromAED != null
                  ? `From AED ${country.express.priceFromAED}`
                  : "Get an instant quote"}
              </p>
              <p className="tierDesc">
                Fastest option. Best for urgent documents, business shipments and time-sensitive items.
              </p>
            </div>
            <div className="card">
              <span className="tierBadge economy">Economy</span>
              <p className="tierDays">{country.economy.days}</p>
              <p className="tierPrice">
                {country.economy.priceFromAED != null
                  ? `From AED ${country.economy.priceFromAED}`
                  : "Get an instant quote"}
              </p>
              <p className="tierDesc">
                Budget-friendly option for non-urgent items. A fraction of the cost of express.
              </p>
            </div>
          </div>
        </section>

        {/* WHAT PEOPLE SHIP */}
        <section className="section">
          <h2>What people commonly ship to {country.name}</h2>
          <ul className="chipList">
            {country.popularItems.map((item) => (
              <li key={item} className="chip">
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* CUSTOMS NOTES */}
        <section className="section">
          <h2>Customs &amp; delivery notes for {country.name}</h2>
          <ul className="notesList">
            {country.customsNotes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
          <p className="disclaimer">
            Customs rules change periodically — this is general guidance, not a guarantee of duty-free
            clearance. We'll confirm anything specific to your shipment before it ships.
          </p>
        </section>

        {/* FAQ */}
        <section className="section">
          <h2>Frequently asked questions</h2>
          <div className="faqList">
            {country.faqs.map((f, i) => (
              <div className="faqItem" key={i}>
                <button
                  className="faqQuestion"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  {f.q}
                  <span className="faqIcon">{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && <p className="faqAnswer">{f.a}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="finalCta">
          <h2>Ready to send your first shipment to {country.name}?</h2>
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="btnPrimary large">
            Chat with us on WhatsApp
          </a>
        </section>
      </main>

      <style jsx>{`
        .page {
          background: #0b1220;
          color: #f6fbfb;
          min-height: 100vh;
        }
        .hero {
          padding: 64px 24px 48px;
          background: radial-gradient(circle at top left, #0b3f3e 0%, #0b1220 60%);
          border-bottom: 1px solid rgba(14, 165, 162, 0.2);
        }
        .heroInner {
          max-width: 780px;
          margin: 0 auto;
        }
        .eyebrow {
          font-size: 13px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: #0ea5a2;
          margin-bottom: 16px;
        }
        .eyebrow :global(a) {
          color: #0ea5a2;
          text-decoration: underline;
        }
        h1 {
          font-size: clamp(28px, 5vw, 44px);
          line-height: 1.15;
          margin: 0 0 16px;
        }
        .flag {
          font-size: 0.9em;
        }
        .heroBlurb {
          font-size: 18px;
          color: rgba(246, 251, 251, 0.8);
          max-width: 60ch;
          margin-bottom: 32px;
        }
        .heroCtas {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }
        .btnPrimary {
          background: linear-gradient(135deg, #00e5a0, #0ea5a2);
          color: #0b1220;
          font-weight: 600;
          padding: 14px 28px;
          border-radius: 999px;
          text-decoration: none;
          display: inline-block;
        }
        .btnPrimary.large {
          padding: 18px 36px;
          font-size: 17px;
        }
        .btnGhost {
          border: 1px solid rgba(14, 165, 162, 0.5);
          color: #f6fbfb;
          padding: 14px 28px;
          border-radius: 999px;
          text-decoration: none;
          display: inline-block;
        }
        .section {
          max-width: 780px;
          margin: 0 auto;
          padding: 48px 24px;
        }
        .section h2 {
          font-size: 24px;
          margin-bottom: 24px;
        }
        .tierGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 640px) {
          .tierGrid {
            grid-template-columns: 1fr;
          }
        }
        .card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(14, 165, 162, 0.25);
          backdrop-filter: blur(12px);
          border-radius: 16px;
          padding: 24px;
        }
        .tierBadge {
          display: inline-block;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 999px;
          margin-bottom: 16px;
        }
        .tierBadge.express {
          background: rgba(0, 229, 160, 0.15);
          color: #00e5a0;
        }
        .tierBadge.economy {
          background: rgba(14, 165, 162, 0.15);
          color: #0ea5a2;
        }
        .tierDays {
          font-size: 15px;
          color: rgba(246, 251, 251, 0.7);
          margin-bottom: 8px;
        }
        .tierPrice {
          font-size: 26px;
          font-weight: 700;
          margin-bottom: 12px;
        }
        .tierDesc {
          font-size: 14px;
          color: rgba(246, 251, 251, 0.65);
        }
        .chipList {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .chip {
          background: rgba(14, 165, 162, 0.12);
          border: 1px solid rgba(14, 165, 162, 0.3);
          border-radius: 999px;
          padding: 8px 16px;
          font-size: 14px;
        }
        .notesList {
          padding-left: 20px;
          color: rgba(246, 251, 251, 0.85);
          line-height: 1.7;
        }
        .disclaimer {
          margin-top: 16px;
          font-size: 13px;
          color: rgba(246, 251, 251, 0.5);
        }
        .faqList {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .faqItem {
          border: 1px solid rgba(14, 165, 162, 0.2);
          border-radius: 12px;
          overflow: hidden;
        }
        .faqQuestion {
          width: 100%;
          text-align: left;
          background: rgba(255, 255, 255, 0.03);
          border: none;
          color: #f6fbfb;
          padding: 18px 20px;
          font-size: 15px;
          font-weight: 500;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
        }
        .faqIcon {
          color: #0ea5a2;
          font-size: 20px;
        }
        .faqAnswer {
          padding: 0 20px 18px;
          color: rgba(246, 251, 251, 0.75);
          line-height: 1.6;
        }
        .finalCta {
          text-align: center;
          padding: 64px 24px 96px;
          background: linear-gradient(180deg, transparent, rgba(11, 63, 62, 0.4));
        }
        .finalCta h2 {
          font-size: 26px;
          margin-bottom: 24px;
        }
      `}</style>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = getAllCountrySlugs().map((slug) => ({ params: { country: slug } }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = params?.country as string;
  const country = getCountryBySlug(slug);

  if (!country) {
    return { notFound: true };
  }

  return { props: { country } };
};

export default CountryPage;