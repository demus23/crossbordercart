// pages/admin/dashboard.tsx
import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  Card,
  Spinner,
  Table,
  Row,
  Col,
  Button,
  Image,
  Alert,
  Modal,
  Form,
  InputGroup,
  Accordion,
} from "react-bootstrap";
import Link from "next/link";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import RecentPaymentActivityCard from "@/components/RecentPaymentActivityCard";
import FinanceSnapshot from "@/components/admin/FinanceSnapshot";
import TransactionHistoryCard from "@/components/admin/TransactionHistoryCard";
import ShippingCalcWidget from "@/components/ShippingCalcWidget";
import AdminShippingSettingsTable from "@/components/AdminShippingSettingsTable";
import ShippingQuoteSimple from "@/components/ShippingQuoteSimple";
import TrackingSearchCard from "@/components/tracking/TrackingSearchCard";
import dynamic from "next/dynamic";

type ShipmentKpis = {
  ok: true;
  totalShipments: number;
  inTransit: number;
  delivered: number;
  problems: number;
  unpaidCount: number;
  unpaidAmount: number;
  paidAmount: number;
};

const ShipmentsWidget = dynamic(() => import("@/components/admin/ShipmentsWidget"), { ssr: false });

Chart.register(ArcElement, Tooltip, Legend);

function prettyStatus(s?: string) {
  if (!s) return "";
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function fmt(dt?: string | number | null) {
  if (!dt) return "";
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return String(dt);
  }
}

function AIToolsModal({ show, onHide }: { show: boolean; onHide: () => void }) {
  const [tab, setTab] = useState<"chat" | "shipping" | "consolidation" | "product" | "translation">("chat");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult("");
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tab, input }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "ai", content: data.result || "No result." }]);
      setResult(data.result || "");
    } catch {
      setResult("AI error. Try again.");
    }
    setInput("");
    setLoading(false);
  };

  useEffect(() => {
    setInput("");
    setMessages([]);
    setResult("");
  }, [show, tab]);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-robot me-2" />
          AI Tools
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ minHeight: 380 }}>
        <div className="d-flex gap-2 mb-3 flex-wrap">
          {[
            ["chat", "primary", "Chat"],
            ["shipping", "success", "Shipping Cost"],
            ["consolidation", "warning", "Consolidate Packages"],
            ["product", "info", "Product Search"],
            ["translation", "secondary", "Translation"],
          ].map(([k, v, label]) => (
            <Button
              key={k}
              variant={tab === k ? (v as any) : (`outline-${v}` as any)}
              size="sm"
              onClick={() => setTab(k as any)}
            >
              {label}
            </Button>
          ))}
        </div>

        <div
          style={{
            maxHeight: 240,
            overflowY: "auto",
            marginBottom: 12,
            background: "#f7fafc",
            borderRadius: 10,
            padding: 10,
          }}
        >
          {messages.length === 0 && (
            <div className="text-muted text-center py-5">Ask anything related to {tab}…</div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className="mb-2" style={{ textAlign: msg.role === "user" ? "right" : "left" }}>
              <span
                className={`px-3 py-2 rounded-3 d-inline-block ${
                  msg.role === "user" ? "bg-primary text-white" : "bg-light border"
                }`}
              >
                {msg.content}
              </span>
            </div>
          ))}
        </div>

        <InputGroup>
          <Form.Control
            placeholder={
              tab === "chat"
                ? "Ask a general question…"
                : tab === "shipping"
                ? "Describe your shipment (origin, dest, weight)…"
                : tab === "consolidation"
                ? "List packages to consolidate…"
                : tab === "product"
                ? "Describe the product to search…"
                : "Enter text for translation…"
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
          />
          <Button onClick={handleSend} disabled={loading || !input.trim()} variant="primary">
            {loading ? <Spinner size="sm" /> : <i className="bi bi-send" />}
          </Button>
        </InputGroup>

        {result && (
          <Alert variant="info" className="mt-3">
            <strong>AI:</strong> {result}
          </Alert>
        )}
      </Modal.Body>
    </Modal>
  );
}

type AdminDoc = {
  userId: string;
  userEmail: string;
  suiteId?: string | null;
  docId: string;
  label: string;
  filename: string;
  url: string;
  uploadedAt: string;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [showChatbot, setShowChatbot] = useState(false);

  // tracking
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingResult, setTrackingResult] = useState<
    | { status?: string; location?: string; createdAt?: string; lastUpdate?: string }
    | string
    | null
  >(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  const [showAdminQuote, setShowAdminQuote] = useState(false);

  // docs
  const [latestDocs, setLatestDocs] = useState<AdminDoc[]>([]);
  const [docsLoading, setDocsLoading] = useState<boolean>(true);

  // shipment KPIs
  const [shipKpis, setShipKpis] = useState<ShipmentKpis | null>(null);
  const [shipKpisLoading, setShipKpisLoading] = useState(false);
  const [shipKpisError, setShipKpisError] = useState<string | null>(null);

  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/dashboard-stats");
        const data = await res.json();
        if (!canceled) setStats(data || {});
      } catch {
        if (!canceled) setStats({});
      } finally {
        if (!canceled) setLoading(false);
      }
    })();
    return () => {
      canceled = true;
    };
  }, []);

  useEffect(() => {
    const loadKpis = async () => {
      try {
        setShipKpisLoading(true);
        setShipKpisError(null);
        const res = await fetch("/api/admin/shipments/kpis");
        if (!res.ok) throw new Error("Failed to load shipment KPIs");
        const data = (await res.json()) as ShipmentKpis | { ok: false; error: string };
        if (!("ok" in data) || (data as any).ok === false) {
          throw new Error((data as any).error || "Failed to load shipment KPIs");
        }
        setShipKpis(data as ShipmentKpis);
      } catch (e: any) {
        setShipKpisError(e?.message || "Failed to load shipment KPIs");
      } finally {
        setShipKpisLoading(false);
      }
    };
    loadKpis();
  }, []);

  const loadDocs = async () => {
    setDocsLoading(true);
    try {
      const res = await fetch("/api/admin/documents?limit=20");
      const data = await res.json();
      setLatestDocs(Array.isArray(data.documents) ? data.documents : []);
    } catch {
      setLatestDocs([]);
    } finally {
      setDocsLoading(false);
    }
  };
  useEffect(() => {
    loadDocs();
  }, []);

  const handleDeleteDoc = async (docId: string) => {
    const ok = window.confirm("Delete this document?");
    if (!ok) return;
    const res = await fetch(`/api/admin/documents/${docId}`, { method: "DELETE" });
    if (res.ok) setLatestDocs((d) => d.filter((x) => x.docId !== docId));
    else alert("Failed to delete document.");
  };

  const handleTrackingSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const t = trackingNumber.trim();
    if (!t) return;

    setTrackingLoading(true);
    setTrackingResult(null);

    try {
      const res = await fetch(`/api/track?trackingNo=${encodeURIComponent(t)}&limit=1`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      if (data.ok === false) throw new Error(data.error || "Not found");

      const events = Array.isArray(data.events) ? data.events : [];
      const ev = events[0];

      if (!ev) {
        setTrackingResult("Not found");
      } else {
        setTrackingResult({
          status: ev.status ?? data.package?.status ?? "Pending",
          location: ev.location ?? data.package?.location ?? "",
          createdAt: data.package?.createdAt ?? ev.time ?? ev.createdAt ?? null,
          lastUpdate: data.package?.updatedAt ?? ev.time ?? ev.createdAt ?? null,
        });
      }
    } catch {
      setTrackingResult("Not found");
    } finally {
      setTrackingLoading(false);
    }
  };

  const packageChart = useMemo(() => {
    return {
      labels: ["Delivered", "Pending", "In Transit", "Problem"],
      datasets: [
        {
          data: [
            stats?.deliveredCount || 0,
            stats?.pendingCount || 0,
            stats?.inTransitCount || 0,
            stats?.problemCount || 0,
          ],
          backgroundColor: ["#16a34a", "#eab308", "#0ea5e9", "#dc2626"],
          borderWidth: 1,
        },
      ],
    };
  }, [stats]);

  const pieOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" as const } },
    };
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="d-flex justify-content-center align-items-center" style={{ height: 320 }}>
          <Spinner animation="border" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      {showAnnouncement && (
        <Alert variant="info" dismissible onClose={() => setShowAnnouncement(false)} className="mb-3">
          <strong>🚀 System Update:</strong> New AI-powered tools & analytics are available!
        </Alert>
      )}

      {/* Top row */}
      <Row className="g-3 mb-3">
        <Col lg={8}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <h5 className="fw-semibold mb-0">Quick Track</h5>
                <small className="text-muted">Search latest tracking update</small>
              </div>

              <Form onSubmit={handleTrackingSearch} className="mt-3">
                <Row className="g-2 align-items-center">
                  <Col xs={12} md="auto">
                    <Form.Label className="mb-0 fw-bold">Tracking #</Form.Label>
                  </Col>
                  <Col xs={12} md={6} lg={5}>
                    <Form.Control
                      placeholder="Enter Tracking #"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      required
                    />
                  </Col>
                  <Col xs={12} md="auto">
                    <Button type="submit" variant="secondary" disabled={trackingLoading} className="w-100 w-md-auto">
                      {trackingLoading ? <Spinner size="sm" /> : "Track"}
                    </Button>
                  </Col>
                </Row>

                {trackingResult && (
                  <div className="mt-3">
                    {typeof trackingResult === "string" ? (
                      <div className="text-muted">{trackingResult}</div>
                    ) : (
                      <div style={{ fontSize: 14 }}>
                        <strong>Status:</strong> {prettyStatus(trackingResult.status)}
                        {trackingResult.location ? (
                          <>
                            {" "}
                            • <strong>Location:</strong> {trackingResult.location}
                          </>
                        ) : null}
                        {trackingResult.lastUpdate ? (
                          <>
                            {" "}
                            • <strong>Updated:</strong> {fmt(trackingResult.lastUpdate)}
                          </>
                        ) : null}
                      </div>
                    )}
                  </div>
                )}
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <h5 className="fw-semibold mb-0">Shipping Calculator</h5>
                <Button variant="outline-primary" size="sm" onClick={() => setShowAdminQuote(true)}>
                  Full Form
                </Button>
              </div>

              <div className="mt-3">
                <ShippingCalcWidget />
              </div>

              <ShippingQuoteSimple show={showAdminQuote} onHide={() => setShowAdminQuote(false)} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Address + Stores */}
      <Row className="g-3 mb-3">
        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <h6 className="fw-bold mb-2">Main UAE Delivery Address</h6>
              <address className="mb-2">
                <strong>Warehouse</strong>
                <br />
                Suite 305, Business Bay, Dubai, UAE
                <br />
                +971-50-123-4567
              </address>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => navigator.clipboard.writeText("Suite 305, Business Bay, Dubai, UAE")}
              >
                Copy Address
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <h6 className="fw-bold mb-2">Shop From Top Online Stores</h6>
              <div className="d-flex gap-3 align-items-center flex-wrap">
                <a href="https://amazon.ae" target="_blank" rel="noopener noreferrer">
                  <Image src="/amazon.svg" alt="Amazon" height={30} />
                </a>
                <a href="https://ebay.com" target="_blank" rel="noopener noreferrer">
                  <Image src="/ebay.svg" alt="eBay" height={28} />
                </a>
                <a href="https://noon.com" target="_blank" rel="noopener noreferrer">
                  <Image src="/noon.svg" alt="Noon" height={28} />
                </a>
                <Link href="/stores" style={{ color: "#6c757d", textDecoration: "underline" }}>
                  and more…
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* KPI tiles */}
      <Row className="g-3 mb-3">
        {[
          { label: "Total Users", value: stats?.userCount ?? 0 },
          { label: "Total Packages", value: stats?.packageCount ?? 0 },
          { label: "Delivered", value: stats?.deliveredCount ?? 0 },
          { label: "Pending", value: stats?.pendingCount ?? 0 },
          { label: "Drivers", value: stats?.driverCount ?? 0 },
        ].map((k) => (
          <Col key={k.label} xs={6} lg={2} className="flex-grow-1">
            <Card className="shadow-sm text-center h-100">
              <Card.Body>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{k.value}</div>
                <div className="text-muted" style={{ fontSize: 13 }}>{k.label}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Shipment overview */}
      <Card className="shadow-sm mb-3">
        <Card.Body>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <h5 className="mb-0">Shipment Overview</h5>
            {shipKpisLoading ? <small className="text-muted">Loading…</small> : null}
          </div>

          {shipKpisError && <div className="alert alert-danger mt-3">{shipKpisError}</div>}

          <Row className="g-3 mt-1">
            {[
              { label: "Total Shipments", value: shipKpis?.totalShipments ?? 0 },
              { label: "In Transit", value: shipKpis?.inTransit ?? 0 },
              { label: "Delivered", value: shipKpis?.delivered ?? 0 },
              { label: "Problem/Returned", value: shipKpis?.problems ?? 0 },
              { label: "Unpaid Shipments", value: shipKpis?.unpaidCount ?? 0 },
              { label: "Unpaid Amount", value: `${shipKpis?.unpaidAmount ?? 0} AED` },
              { label: "Total Paid Amount", value: `${shipKpis?.paidAmount ?? 0} AED` },
            ].map((x) => (
              <Col key={x.label} xs={6} lg={3}>
                <div className="border rounded-3 p-3 bg-white">
                  <div className="small text-muted">{x.label}</div>
                  <div className="h5 mb-0">{x.value}</div>
                </div>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>

      {/* Desktop: show analytics row. Mobile: keep in accordion */}
      <div className="d-none d-lg-block">
        <Row className="g-3 mb-3">
          <Col lg={4}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                <h6 className="fw-bold mb-3">Packages by Status</h6>
                <div style={{ height: 320 }}>
                  <Pie data={packageChart} options={pieOptions} />
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                <h6 className="fw-bold mb-3">Transaction History</h6>
                <div className="table-responsive">
                  <Table size="sm" hover className="mb-0">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(stats?.transactions || []).map((tx: any) => (
                        <tr key={tx.id}>
                          <td>{tx.id}</td>
                          <td>{tx.amount} AED</td>
                          <td>{tx.method}</td>
                          <td style={{ fontWeight: 800 }}>{tx.status}</td>
                          <td>{tx.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                <h6 className="fw-bold mb-3">Latest Activity</h6>
                <div className="table-responsive">
                  <Table hover size="sm" className="mb-0">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Action</th>
                        <th>Entity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.activity?.length ? (
                        stats.activity.map((log: any) => (
                          <tr key={log._id}>
                            <td>{fmt(log.createdAt)}</td>
                            <td>{log.action}</td>
                            <td>{log.entity}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3}>No activity found.</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Mobile organization */}
      <div className="d-lg-none mb-3">
        <Accordion alwaysOpen>
          <Accordion.Item eventKey="analytics">
            <Accordion.Header>Analytics</Accordion.Header>
            <Accordion.Body>
              <Card className="shadow-sm mb-3">
                <Card.Body>
                  <h6 className="fw-bold mb-3">Packages by Status</h6>
                  <div style={{ height: 280 }}>
                    <Pie data={packageChart} options={pieOptions} />
                  </div>
                </Card.Body>
              </Card>

              <Card className="shadow-sm mb-3">
                <Card.Body>
                  <h6 className="fw-bold mb-3">Latest Activity</h6>
                  <div className="table-responsive">
                    <Table hover size="sm" className="mb-0">
                      <thead>
                        <tr>
                          <th>Time</th>
                          <th>Action</th>
                          <th>Entity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats?.activity?.length ? (
                          stats.activity.map((log: any) => (
                            <tr key={log._id}>
                              <td>{fmt(log.createdAt)}</td>
                              <td>{log.action}</td>
                              <td>{log.entity}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3}>No activity found.</td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="shipments">
            <Accordion.Header>Shipments Widget</Accordion.Header>
            <Accordion.Body>
              <ShipmentsWidget />
              <div className="mt-3">
                <TrackingSearchCard initialTrackingNo="AB23456" compact enablePolling pollMs={20000} />
              </div>
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="documents">
            <Accordion.Header>Latest User Documents</Accordion.Header>
            <Accordion.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <strong>Documents</strong>
                <Button size="sm" variant="outline-secondary" onClick={loadDocs}>
                  Refresh
                </Button>
              </div>

              <div className="table-responsive">
                <Table hover responsive size="sm" className="mb-0">
                  <thead>
                    <tr>
                      <th>Uploaded</th>
                      <th>Label</th>
                      <th>User</th>
                      <th>Suite</th>
                      <th>File</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {docsLoading ? (
                      <tr>
                        <td colSpan={6}>
                          <Spinner size="sm" /> Loading…
                        </td>
                      </tr>
                    ) : latestDocs.length === 0 ? (
                      <tr>
                        <td colSpan={6}>No documents found.</td>
                      </tr>
                    ) : (
                      latestDocs.map((d) => (
                        <tr key={d.docId}>
                          <td>{fmt(d.uploadedAt)}</td>
                          <td>{d.label || d.filename}</td>
                          <td>{d.userEmail}</td>
                          <td>{d.suiteId || "—"}</td>
                          <td>
                            {d.url ? (
                              <a href={d.url} target="_blank" rel="noreferrer">
                                Open
                              </a>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDeleteDoc(d.docId)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="shippingSettings">
            <Accordion.Header>Shipping Settings</Accordion.Header>
            <Accordion.Body>
              <AdminShippingSettingsTable embedded />
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="finance">
            <Accordion.Header>Finance</Accordion.Header>
            <Accordion.Body>
              <FinanceSnapshot />
              <div className="mt-3">
                <TransactionHistoryCard />
              </div>
              <div className="mt-3">
                <RecentPaymentActivityCard />
              </div>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>

      {/* Desktop extra blocks */}
      <div className="d-none d-lg-block">
        <Row className="g-3 mb-3">
          <Col lg={4}>
            <RecentPaymentActivityCard />
          </Col>
        </Row>

        <div className="mb-3">
          <TrackingSearchCard initialTrackingNo="AB23456" compact enablePolling pollMs={20000} />
        </div>

        <div className="mb-3">
          <ShipmentsWidget />
        </div>

        <Card className="shadow-sm mb-3">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="fw-bold mb-0">Latest User Documents</h6>
              <Button size="sm" variant="outline-secondary" onClick={loadDocs}>
                Refresh
              </Button>
            </div>

            <div className="table-responsive">
              <Table hover responsive size="sm" className="mb-0">
                <thead>
                  <tr>
                    <th>Uploaded</th>
                    <th>Label</th>
                    <th>User Email</th>
                    <th>Suite</th>
                    <th>File</th>
                    <th style={{ width: 110 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {docsLoading ? (
                    <tr>
                      <td colSpan={6}>
                        <Spinner size="sm" /> Loading…
                      </td>
                    </tr>
                  ) : latestDocs.length === 0 ? (
                    <tr>
                      <td colSpan={6}>No documents found.</td>
                    </tr>
                  ) : (
                    latestDocs.map((d) => (
                      <tr key={d.docId}>
                        <td>{fmt(d.uploadedAt)}</td>
                        <td>{d.label || d.filename}</td>
                        <td>{d.userEmail}</td>
                        <td>{d.suiteId || "—"}</td>
                        <td>
                          {d.url ? (
                            <a href={d.url} target="_blank" rel="noreferrer">
                              Open
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>
                          <Button size="sm" variant="outline-danger" onClick={() => handleDeleteDoc(d.docId)}>
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        <Card className="shadow-sm mb-3">
          <Card.Body>
            <h5 className="fw-semibold mb-3">Shipping Settings</h5>
            <AdminShippingSettingsTable embedded />
          </Card.Body>
        </Card>

        <h2 className="mb-3">Finance</h2>
        <FinanceSnapshot />
        <div className="mt-3">
          <TransactionHistoryCard />
        </div>
      </div>

      {/* Floating AI button */}
      <div className="ai-fab" aria-live="polite">
        <Button
          className="ai-fab-btn"
          title="Open AI Tools"
          aria-label="Open AI Tools"
          onClick={() => setShowChatbot(true)}
        >
          <i className="bi bi-robot" />
        </Button>
        <AIToolsModal show={showChatbot} onHide={() => setShowChatbot(false)} />
      </div>

      <style jsx global>{`
  .ai-fab {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 3000;
  }
  .ai-fab-btn {
    border-radius: 999px;
    width: 56px;
    height: 56px;
    background: linear-gradient(90deg, var(--lux-accent), var(--lux-accent2));
    border: 1px solid rgba(202,164,106,0.35);
    color: #1a1410;
    font-size: 22px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 18px 50px rgba(10,7,5,0.18);
  }
  @media (max-width: 576px) {
    .ai-fab {
      bottom: 14px;
      right: 14px;
    }
    .ai-fab-btn {
      width: 50px;
      height: 50px;
      font-size: 20px;
    }
  }
`}</style>

    </AdminLayout>
  );
}
