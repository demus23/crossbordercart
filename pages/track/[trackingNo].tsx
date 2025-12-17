// pages/track/[trackingNo].tsx
import { useRouter } from "next/router";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  ListGroup,
  Spinner,
} from "react-bootstrap";

type TimelineItem = {
  time?: string; // ISO string
  status?: string;
  location?: string | null;
  message?: string | null;
  trackingNo?: string;
  createdAt?: string;
};

type PackageSummary = {
  tracking: string;
  courier: string | null;
  status: string;
  location: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  price?: number | null;
  currency?: string | null;
};

// New API shape: { ok, shipment, events }
type TrackApiOk = {
  ok: true;
  shipment?: any; // raw shipment from API
  package?: PackageSummary; // legacy support if backend ever returns "package"
  events?: TimelineItem[];
};

type TrackApiErr = { ok: false; error: string };

// Legacy shape fallback (older API)
type LegacyTrackResponse = {
  tracking: string;
  status: string;
  location?: string;
  lastUpdate?: string;
};

const STATUS_BG: Record<string, string> = {
  Delivered: "success",
  "In Transit": "info",
  Pending: "warning",
  Problem: "danger",
};

function formatWhen(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return String(iso);
  }
}

export default function TrackPage() {
  const router = useRouter();
  const trackingNo = Array.isArray(router.query.trackingNo)
    ? router.query.trackingNo[0]
    : router.query.trackingNo;

  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string>("");
  const [pkg, setPkg] = useState<PackageSummary | null>(null);
  const [events, setEvents] = useState<TimelineItem[]>([]);

  async function load() {
    if (!trackingNo) return;

    setLoading(true);
    setErr("");
    setPkg(null);
    setEvents([]);

    try {
      // API accepts both ?trackingNo= and ?tracking=
      const r = await fetch(
        `/api/track?trackingNo=${encodeURIComponent(trackingNo)}`
      );
      const text = await r.text();

      let json: any;
      try {
        json = JSON.parse(text);
      } catch {
        setErr("Failed to parse response");
        return;
      }

      // New API: { ok, shipment, events } or { ok, package, events }
      if ("ok" in json) {
        const data = json as TrackApiOk | TrackApiErr;

        if (!data.ok) {
          setErr((data as TrackApiErr).error || "Not found");
          return;
        }

        // Prefer explicit "package", else fall back to "shipment"
        const shipment = (data as TrackApiOk).package ?? (data as TrackApiOk).shipment;
        if (!shipment) {
          setErr("Not found");
          return;
        }

        const mappedPkg: PackageSummary = {
          tracking:
            shipment.trackingNo ||
            shipment.orderId ||
            shipment.tracking ||
            shipment._id,
          courier: shipment.carrier ?? null,
          status: shipment.status || "Pending",
          location:
            shipment.currentLocation ??
            shipment.location ??
            shipment.to?.city ??
            shipment.to?.line1 ??
            null,
          createdAt: shipment.createdAt ?? null,
          updatedAt: shipment.updatedAt ?? null,
          price: shipment.priceAED ?? shipment.price ?? null,
          currency: shipment.currency ?? null,
        };

        setPkg(mappedPkg);

        // Build timeline from events, shipment.events, or shipment.activity
        let timeline: TimelineItem[] = [];

        if (Array.isArray((data as TrackApiOk).events) && (data as TrackApiOk).events!.length > 0) {
          timeline = (data as TrackApiOk).events as TimelineItem[];
        } else if (Array.isArray(shipment.events) && shipment.events.length > 0) {
          timeline = shipment.events as TimelineItem[];
        } else if (Array.isArray(shipment.activity)) {
          timeline = shipment.activity.map((a: any) => ({
            time: a.at,
            status: a.payload?.to ?? a.status ?? mappedPkg.status,
            location: a.location ?? null,
            message:
              a.type === "status_change"
                ? `Status changed from ${a.payload?.from} to ${a.payload?.to}`
                : a.message ?? a.type,
          }));
        }

        setEvents(timeline);
        return;
      }

      // Legacy support (old endpoint)
      const legacy = json as LegacyTrackResponse;
      if (legacy && legacy.tracking) {
        setPkg({
          tracking: legacy.tracking,
          courier: null,
          status: legacy.status || "Pending",
          location: legacy.location ?? null,
          createdAt: legacy.lastUpdate ?? null,
          updatedAt: legacy.lastUpdate ?? null,
          price: null,
          currency: null,
        });
        setEvents([]);
      } else {
        setErr("Not found");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErr(msg || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (trackingNo) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackingNo]);

  const statusBadge = useMemo(() => {
    const label = pkg?.status || "Pending";
    const bg = STATUS_BG[label] ?? "secondary";
    return <Badge bg={bg}>{label}</Badge>;
  }, [pkg?.status]);

  const sortedEvents = useMemo(() => {
    const copy = [...events];
    copy.sort((a: TimelineItem, b: TimelineItem) => {
      const ta = new Date(a.time ?? a.createdAt ?? 0).getTime();
      const tb = new Date(b.time ?? b.createdAt ?? 0).getTime();
      return tb - ta;
    });
    return copy;
  }, [events]);

  return (
    <>
      <Head>
        <title>Track {trackingNo ? `#${trackingNo}` : ""} | Tracking</title>
      </Head>

      <Container className="py-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h3 className="mb-0">Tracking</h3>
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" onClick={() => router.back()}>
              Back
            </Button>
            <Button variant="outline-primary" onClick={load} disabled={loading}>
              {loading ? <Spinner size="sm" /> : "Reload"}
            </Button>
          </div>
        </div>

        {!trackingNo && (
          <Alert variant="warning">
            No tracking number provided in the URL.
          </Alert>
        )}

        {err && (
          <Alert variant="danger" className="mb-3">
            {err}
          </Alert>
        )}

        {loading ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: 240 }}
          >
            <Spinner animation="border" />
          </div>
        ) : pkg ? (
          <>
            {/* Price */}
            <div className="mb-2">
              <div className="text-muted small">Price</div>
              <div className="fs-6">
                {pkg.price != null
                  ? `${pkg.price} ${pkg.currency || "AED"}`
                  : "—"}
              </div>
            </div>

            {/* Summary */}
            <Card className="shadow-sm mb-3">
              <Card.Header style={{ background: "white" }}>
                <strong>Package Summary</strong>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap justify-content-between">
                  <div className="mb-2">
                    <div className="text-muted small">Tracking #</div>
                    <div className="fs-5 fw-bold">{pkg.tracking}</div>
                  </div>
                  <div className="mb-2">
                    <div className="text-muted small">Status</div>
                    <div className="fs-6">{statusBadge}</div>
                  </div>
                  <div className="mb-2">
                    <div className="text-muted small">Courier</div>
                    <div className="fs-6">{pkg.courier || "—"}</div>
                  </div>
                  <div className="mb-2">
                    <div className="text-muted small">Location</div>
                    <div className="fs-6">{pkg.location || "—"}</div>
                  </div>
                  <div className="mb-2">
                    <div className="text-muted small">Last Update</div>
                    <div className="fs-6">
                      {formatWhen(pkg.updatedAt || pkg.createdAt)}
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Timeline */}
            <Card className="shadow-sm">
              <Card.Header style={{ background: "white" }}>
                <strong>Tracking Timeline</strong>
              </Card.Header>
              <ListGroup variant="flush">
                {sortedEvents.length === 0 ? (
                  <ListGroup.Item className="text-muted">
                    No events yet.
                  </ListGroup.Item>
                ) : (
                  sortedEvents.map((e, idx) => (
                    <ListGroup.Item key={`${e.time || e.createdAt}-${idx}`}>
                      <div className="d-flex flex-wrap justify-content-between">
                        <div className="me-3">
                          <div className="fw-semibold">
                            {e.status || "Update"}
                            {e.location ? ` — ${e.location}` : ""}
                          </div>
                          {e.message && (
                            <div className="text-muted">{e.message}</div>
                          )}
                        </div>
                        <div className="text-muted small">
                          {formatWhen(e.time || e.createdAt)}
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))
                )}
              </ListGroup>
            </Card>
          </>
        ) : (
          !err && <Alert variant="warning">Package not found.</Alert>
        )}
      </Container>
    </>
  );
}
