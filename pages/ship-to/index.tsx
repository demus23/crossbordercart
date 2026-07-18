// pages/ship-to/index.tsx
//
// Hub page listing every destination, grouped by region.
// Important for SEO: this is the internal-linking page that connects your
// homepage to every /ship-to/[country] page, helping Google discover and
// rank them all.

import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { getCountriesByRegion, Region } from "../../lib/africaShippingData";

const regionOrder: Region[] = [
  "East Africa",
  "Horn of Africa",
  "West Africa",
  "Southern Africa",
  "North Africa",
];

const ShipToIndex: NextPage = () => {
  const byRegion = getCountriesByRegion();

  return (
    <>
      <Head>
        <title>Shipping Destinations | UAE to Africa — CrossBorderCart</title>
        <meta
          name="description"
          content="See all countries CrossBorderCart ships to from the UAE, with express and economy rates, delivery times and customs info for each destination."
        />
        <link rel="canonical" href="https://crossbordercart.com/ship-to" />
      </Head>

      <main className="page">
        <section className="hero">
          <h1>Where do you want to ship to?</h1>
          <p>Tracked, door-to-door delivery from the UAE to destinations across Africa.</p>
        </section>

        {regionOrder
          .filter((region) => byRegion[region]?.length)
          .map((region) => (
            <section className="regionSection" key={region}>
              <h2>{region}</h2>
              <div className="grid">
                {byRegion[region].map((country) => (
                  <Link key={country.slug} href={`/ship-to/${country.slug}`} className="card">
                    <span className="flag">{country.flagEmoji}</span>
                    <span className="name">{country.name}</span>
                    <span className="arrow">→</span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
      </main>

      <style jsx>{`
        .page {
          background: #0b1220;
          color: #f6fbfb;
          min-height: 100vh;
          padding-bottom: 64px;
        }
        .hero {
          padding: 64px 24px 40px;
          text-align: center;
          background: radial-gradient(circle at top, #0b3f3e 0%, #0b1220 65%);
        }
        .hero h1 {
          font-size: clamp(26px, 5vw, 40px);
          margin-bottom: 12px;
        }
        .hero p {
          color: rgba(246, 251, 251, 0.75);
        }
        .regionSection {
          max-width: 960px;
          margin: 0 auto;
          padding: 32px 24px 0;
        }
        .regionSection h2 {
          font-size: 18px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #0ea5a2;
          margin-bottom: 16px;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 14px;
        }
        .card {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(14, 165, 162, 0.25);
          backdrop-filter: blur(10px);
          border-radius: 14px;
          padding: 16px 18px;
          text-decoration: none;
          color: #f6fbfb;
          transition: border-color 0.15s ease, transform 0.15s ease;
        }
        .card:hover {
          border-color: #00e5a0;
          transform: translateY(-2px);
        }
        .flag {
          font-size: 22px;
        }
        .name {
          flex: 1;
          font-weight: 500;
        }
        .arrow {
          color: #0ea5a2;
        }
      `}</style>
    </>
  );
};

export default ShipToIndex;