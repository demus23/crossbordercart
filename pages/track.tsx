// pages/track.tsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

type TrackingEvent = {
  status: string;
  message?: string;
  location?: string;
  at?: string; // ISO date
};

type RawEvent = {
  time?: string;
  status?: string;
  location?: string | null;
  message?: string | null;
  trackingNo?: string;
  createdAt?: string;
};

type ApiOk = {
  ok: true;
  shipment?: any;          // new API shape
  package?: any;           // legacy support
  events?: RawEvent[];
};

type ApiErr = { ok: false; error: string };

export default function TrackPage() {
  const router = useRouter();
  const [trackingNo, setTrackingNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<TrackingEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pkgStatus, setPkgStatus] = useState<string | null>(null); // current package status badge
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const errorBox: React.CSSProperties = {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    background: "#fff4f4",
    border: "1px solid #ffd9d9",
    color: "#a33",
  };

  function clearPoll() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  async function fetchEvents(
    tNo: string,
    { silent = false }: { silent?: boolean } = {}
  ) {
    if (!tNo.trim()) return;
    if (!silent) {
      setLoading(true);
      setError(null);
      setEvents(null);
      setPkgStatus(null);
    }

    const ac = new AbortController();

    try {
      const res = await fetch(
        `/api/track?trackingNo=${encodeURIComponent(tNo)}&limit=50`,
        { headers: { Accept: "application/json" }, signal: ac.signal }
      );

      const text = await res.text();
      let json: any;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error(`Invalid JSON from server (${res.status})`);
      }

      // New API: { ok, shipment, events } OR legacy { ok, package, events }
      if ("ok" in json) {
        const data = json as ApiOk | ApiErr;

        if (!data.ok) {
          throw new Error((data as ApiErr).error || `Request failed (${res.status})`);
        }

        const ok = data as ApiOk;

        // Prefer explicit "package", otherwise use "shipment"
        const shipment = ok.package ?? ok.shipment;
        if (!shipment) {
          throw new Error("Not found");
        }

        // Use shipment.status for the badge
        setPkgStatus(shipment.status || "Pending");

        // Build raw events list from several possible sources
        let raw: RawEvent[] = [];

        if (Array.isArray(ok.events) && ok.events.length > 0) {
          raw = ok.events;
        } else if (Array.isArray(shipment.events) && shipment.events.length > 0) {
          raw = shipment.events as RawEvent[];
        } else if (Array.isArray(shipment.activity)) {
          // Convert activity[] into RawEvent[]
          raw = shipment.activity.map((a: any) => ({
            time: a.at,
            status: a.payload?.to ?? a.status ?? shipment.status,
            location: a.location ?? null,
            message:
              a.type === "status_change"
                ? `Status changed from ${a.payload?.from} to ${a.payload?.to}`
                : a.message ?? a.type,
          }));
        }

        const list: TrackingEvent[] = (raw || []).map((e: RawEvent) => ({
          status: e.status ?? "update",
          message: e.message ?? "",
          location: e.location ?? "",
          at: e.time ?? e.createdAt ?? undefined,
        }));

        list.sort(
          (a, b) =>
            new Date(b.at || 0).getTime() - new Date(a.at || 0).getTime()
        );

        setEvents(list);
      } else {
        // Really old legacy endpoint (without "ok") – we don't expect it now,
        // but keep a nice message instead of crashing.
        throw new Error("Unsupported response from server");
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
      setEvents(null);
    } finally {
      if (!silent) setLoading(false);
    }

    return () => ac.abort();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearPoll();
    await fetchEvents(trackingNo);
    // start 15s polling after a successful load
    pollRef.current = setInterval(
      () => fetchEvents(trackingNo, { silent: true }),
      15000
    );
  }

  // Seed from URL: /track?no=.. or ?id=.. or ?tracking=.. or ?trackingNo=..
  useEffect(() => {
    const q = router.query;
    const seed =
      (typeof q.no === "string" && q.no) ||
      (typeof q.id === "string" && q.id) ||
      (typeof q.tracking === "string" && q.tracking) ||
      (typeof q.trackingNo === "string" && q.trackingNo) ||
      "";
    if (seed) {
      setTrackingNo(seed);
      // Auto-run once when seeded
      setTimeout(() => {
        const fake = { preventDefault() {} } as unknown as React.FormEvent;
        onSubmit(fake);
      }, 0);
    }
    // Clear poll on unmount
    return () => clearPoll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    router.query.no,
    router.query.id,
    router.query.tracking,
    router.query.trackingNo,
  ]);

  const latest = useMemo(
    () => (events?.[0] ? events[0] : null),
    [events]
  );

  return (
    <>
      <Head>
        <title>Track your shipment | MyUS Delivery</title>
        <meta
          name="description"
          content="Track any MyUS Delivery shipment in real-time."
        />
        <meta name="robots" content="noindex" />
      </Head>

      <div
        style={{
          background: "#f7fafc",
          minHeight: "100vh",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        {/* Top bar */}
        <nav style={nav}>
          <div style={brand}>
            <span style={{ color: "#21d2b8" }}>MyUS</span> Delivery
          </div>
          {trackingNo && (
            <a
              href={`/track/${encodeURIComponent(trackingNo)}`}
              style={{
                color: "#cfe8ff",
                fontWeight: 800,
                textDecoration: "none",
              }}
              title="Open detailed tracking page"
            >
              View full details →
            </a>
          )}
        </nav>

        {/* Content */}
        <main
          style={{
            maxWidth: 980,
            margin: "0 auto",
            padding: "32px 20px 80px",
          }}
        >
          <h1 style={h1}>Track your shipment</h1>
          <p
            style={{
              color: "#4a5d83",
              marginTop: -8,
              marginBottom: 18,
            }}
          >
            Enter your tracking number to see live updates and delivery history.
          </p>

          <form onSubmit={onSubmit} style={formRow}>
            <input
              value={trackingNo}
              onChange={(e) => setTrackingNo(e.target.value)}
              placeholder="e.g. DHL123456 or AB23456"
              style={input}
              aria-label="Tracking number"
            />
            <button type="submit" style={button} disabled={loading}>
              {loading ? "Searching..." : "Track"}
            </button>
          </form>

          {/* Helper */}
          {trackingNo ? (
            <div
              style={{
                marginTop: 8,
                fontSize: 13,
                color: "#6a7aa0",
              }}
            >
              Tracking #: <code style={code}>{trackingNo}</code>{" "}
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(trackingNo)}
                style={copyBtn}
                title="Copy tracking number"
              >
                Copy
              </button>
            </div>
          ) : null}

          {/* Error */}
          {error ? (
            <div style={errorBox}>
              <strong>Couldn’t fetch tracking:</strong> {error}
            </div>
          ) : null}

          {/* Results */}
          {events && (
            <>
              <section style={summaryCard}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <StatusBadge status={pkgStatus ?? latest?.status} />
                  <div
                    style={{
                      fontWeight: 900,
                      color: "#1b2a46",
                      fontSize: 18,
                    }}
                  >
                    {prettyStatus(pkgStatus ?? latest?.status)}{" "}
                    <span
                      style={{
                        color: "#6b7ba4",
                        fontWeight: 700,
                      }}
                    >
                      &middot;
                    </span>{" "}
                    <span
                      style={{
                        color: "#6b7ba4",
                        fontWeight: 600,
                      }}
                    >
                      {latest?.at
                        ? new Date(latest.at).toLocaleString()
                        : "—"}
                    </span>
                  </div>
                </div>
                {latest?.location ? (
                  <div
                    style={{
                      color: "#6b7ba4",
                      marginTop: 6,
                    }}
                  >
                    Last location: {latest.location}
                  </div>
                ) : null}
                {latest?.message ? (
                  <div
                    style={{
                      color: "#334769",
                      marginTop: 8,
                    }}
                  >
                    {latest.message}
                  </div>
                ) : null}
              </section>

              <h2 style={{ ...h2, marginTop: 28 }}>History</h2>
              <ol style={timeline}>
                {events.map((e, i) => (
                  <li key={i} style={timelineItem}>
                    <div style={dot} />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          flexWrap: "wrap",
                        }}
                      >
                        <StatusBadge status={e.status} />
                        <div
                          style={{
                            fontWeight: 800,
                            color: "#1b2a46",
                          }}
                        >
                          {prettyStatus(e.status)}
                        </div>
                        <div
                          style={{
                            color: "#7083ad",
                          }}
                        >
                          {e.at
                            ? new Date(e.at).toLocaleString()
                            : "—"}
                        </div>
                      </div>
                      {e.location ? (
                        <div
                          style={{
                            color: "#5c6f98",
                            marginTop: 4,
                          }}
                        >
                          Location: {e.location}
                        </div>
                      ) : null}
                      {e.message ? (
                        <div
                          style={{
                            color: "#2a3958",
                            marginTop: 6,
                          }}
                        >
                          {e.message}
                        </div>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </>
          )}

          {/* Empty state */}
          {!events && !error && !loading && (
            <div style={emptyCard}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>🔎</div>
              Enter a tracking number to get started.
            </div>
          )}
        </main>
      </div>

      <style jsx>{`
        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        @media (max-width: 720px) {
          h1 {
            font-size: 30px !important;
          }
          .row {
            flex-direction: column !important;
          }
        }
      `}</style>
    </>
  );
}

/* --- components --- */
function StatusBadge({ status }: { status?: string | null }) {
  const s = (status || "").toLowerCase();
  let bg = "#eef3ff",
    fg = "#2160e0",
    border = "#dbe6ff";
  if (s.includes("out") || s.includes("transit")) {
    bg = "#ecfff8";
    fg = "#1b9a84";
    border = "#bff4e5";
  }
  if (
    s.includes("failed") ||
    s.includes("exception") ||
    s.includes("return") ||
    s.includes("problem")
  ) {
    bg = "#fff1f1";
    fg = "#c0392b";
    border = "#ffd7d7";
  }
  if (s.includes("delivered")) {
    bg = "#eefdff";
    fg = "#0c8ea6";
    border = "#c7f5ff";
  }
  return (
    <span
      style={{
        background: bg,
        color: fg,
        border: `1px solid ${border}`,
        fontWeight: 800,
        fontSize: 12,
        letterSpacing: 0.3,
        padding: "6px 10px",
        borderRadius: 999,
        textTransform: "uppercase",
      }}
    >
      {prettyStatus(status || undefined)}
    </span>
  );
}

/* --- helpers --- */
function prettyStatus(s?: string) {
  if (!s) return "Update";
  return s.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

/* --- styles --- */
const nav: React.CSSProperties = {
  background: "linear-gradient(180deg, #0e1e36 0%, #132844 100%)",
  color: "#fff",
  padding: "14px 22px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  boxShadow: "0 8px 28px rgba(9, 32, 58, 0.28)",
};
const brand: React.CSSProperties = {
  fontWeight: 900,
  fontSize: 24,
  letterSpacing: 0.5,
};
const h1: React.CSSProperties = {
  fontWeight: 900,
  fontSize: 36,
  color: "#1b2a46",
  marginTop: 12,
};
const h2: React.CSSProperties = {
  fontWeight: 900,
  fontSize: 20,
  color: "#1b2a46",
};

const formRow: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  marginBottom: 10,
  flexWrap: "wrap",
};
const input: React.CSSProperties = {
  flex: "1 1 360px",
  minWidth: 260,
  height: 46,
  borderRadius: 10,
  border: "1px solid #dbe4f2",
  background: "#fff",
  padding: "0 14px",
  fontSize: 16,
  outline: "none",
  boxShadow: "0 1px 6px rgba(18, 33, 55, 0.04)",
};
const button: React.CSSProperties = {
  height: 46,
  padding: "0 18px",
  borderRadius: 10,
  border: "none",
  background: "#2179e8",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 10px 24px rgba(33, 121, 232, 0.25)",
};
const copyBtn: React.CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#2179e8",
  fontWeight: 800,
  cursor: "pointer",
  padding: 0,
};
const code: React.CSSProperties = {
  background: "#f0f4fb",
  border: "1px solid #e3eaf6",
  borderRadius: 6,
  padding: "2px 6px",
};

const summaryCard: React.CSSProperties = {
  marginTop: 18,
  background: "#fff",
  borderRadius: 14,
  border: "1px solid #e8eef7",
  boxShadow: "0 8px 22px rgba(26, 42, 68, 0.08)",
  padding: 16,
};
const timeline: React.CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: "12px 0 0 0",
};
const timelineItem: React.CSSProperties = {
  display: "flex",
  gap: 14,
  padding: "12px 8px 12px 0",
  borderBottom: "1px dashed #e7eefa",
};
const dot: React.CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: 999,
  background: "#21d2b8",
  marginTop: 10,
  boxShadow: "0 0 0 3px #c8f6ee",
};
const emptyCard: React.CSSProperties = {
  marginTop: 28,
  background: "#fff",
  borderRadius: 14,
  border: "1px solid #e8eef7",
  padding: 22,
  textAlign: "center",
  color: "#4a5d83",
};
