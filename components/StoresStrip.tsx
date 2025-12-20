// components/StoresStrip.tsx
import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import styles from "./StoresStrip.module.css";

export type StoreLink = {
  name: string;
  url: string;
  logo: string; // e.g. "/stores/amazon.png"
};

export default function StoresStrip({ stores }: { stores: StoreLink[] }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = (direction: "left" | "right") => {
    const node = scrollerRef.current;
    if (!node) return;
    const scrollAmount = node.clientWidth * 0.9;
    node.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  if (!stores || stores.length === 0) return null;

  return (
    <section className={styles.wrapper}>
      <div className={styles.inner}>
        {/* Heading like your previous design */}
        <header className={styles.header}>
          <p className={styles.kicker}>Popular UAE stores</p>
          <h2 className={styles.title}>
            Shop your favourite stores with Cross Border Cart
          </h2>
          <p className={styles.subtitle}>
            If a store can ship to a UAE address, you can usually use it with
            Cross Border Cart. Here are some popular examples.
          </p>
        </header>

        {/* Slider controls */}
        <div className={styles.topRow}>
          <div className={styles.spacer} />
          <div className={styles.controls}>
            <button
              type="button"
              className={styles.arrowBtn}
              onClick={() => handleScroll("left")}
              aria-label="Previous stores"
            >
              ‹
            </button>
            <button
              type="button"
              className={styles.arrowBtn}
              onClick={() => handleScroll("right")}
              aria-label="Next stores"
            >
              ›
            </button>
          </div>
        </div>

        {/* Cards strip */}
        <div className={styles.scroller} ref={scrollerRef}>
          <div className={styles.track}>
            {stores.map((store) => (
              <Link
                key={store.name}
                href={store.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.card}
              >
                <div className={styles.logoShell}>
                  <div className={styles.logoCircle}>
                    <Image
                      src={store.logo}
                      alt={store.name}
                      fill
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                </div>
                <div className={styles.cardText}>
                  <div className={styles.storeName}>{store.name}</div>
                  <div className={styles.storeSub}>
                    Compatible with Cross Border Cart
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
