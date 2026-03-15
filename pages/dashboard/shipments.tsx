// pages/dashboard/shipments.tsx
import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { getSession } from "next-auth/react";
import type { GetServerSideProps } from "next";
import { Modal, Button, Form } from "react-bootstrap";

// ✅ Server-side protection
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);

  // Not logged in → go login
  if (!session) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }

  // ✅ Only admin allowed
  // change this line if your admin flag is different
  const isAdmin =
    (session.user as any)?.role === "admin" ||
    (session.user as any)?.isAdmin === true;

  if (!isAdmin) {
    return {
      redirect: { destination: "/dashboard", permanent: false },
    };
  }

  return { props: {} };
};

type Address = {
  name?: string;
  line1: string;
  city: string;
  country: string;
};

type Shipment = {
  _id: string;
  from: Address;
  to: Address;
  speed?: string;
  carrier?: string;
  service?: string;
  priceAED?: number;
  currency?: string;
  status?: string;
  trackingNumber?: string;
  carrierSlug?: string;
  createdAt?: string;
  weightKg?: number;
  paymentStatus?: "paid" | "unpaid" | "partial" | "refunded" | null;

};

export default function DashboardShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [packageId, setPackageId] = useState(""); // optional: admin can paste package _id


  // Form state
  const [fromName, setFromName] = useState("Warehouse 1");
  const [fromLine1, setFromLine1] = useState("Dock 5");
  const [fromCity, setFromCity] = useState("Dubai");
  const [fromCountry, setFromCountry] = useState("AE");

  const [toName, setToName] = useState("John Doe");
  const [toLine1, setToLine1] = useState("Street 1");
  const [toCity, setToCity] = useState("Sharjah");
  const [toCountry, setToCountry] = useState("AE");

  const [weight, setWeight] = useState(0.8);
  const [length, setLength] = useState(20);
  const [width, setWidth] = useState(15);
  const [height, setHeight] = useState(10);

  const [speed, setSpeed] = useState("express");
  const [carrier, setCarrier] = useState("Aramex");
  const [service, setService] = useState("Express");
  const [priceAED, setPriceAED] = useState(25);
  const [currency, setCurrency] = useState("AED");
  
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [carrierSlug, setCarrierSlug] = useState("aramex"); // aftership slug style
  const [trackingNumber, setTrackingNumber] = useState("");



  // Load recent shipments
  const loadShipments = async () => {
    setLoadingList(true);
    setError(null);
    try {
      const res = await fetch("/api/shipments/list");
      const data = await res.json();
      if (!data.ok) {
        throw new Error(data.error || "Failed to load shipments");
      }
      setShipments(data.shipments || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Failed to load shipments");
    } finally {
      setLoadingList(false);
    }
  };

  const filteredShipments = shipments.filter((s) => {
  // status filter
  if (statusFilter !== "all" && s.status !== statusFilter) return false;

  // payment filter
  if (paymentFilter === "paid" && s.paymentStatus !== "paid") return false;
  if (paymentFilter === "unpaid" && s.paymentStatus !== "unpaid") return false;

  return true;
});


  useEffect(() => {
    loadShipments();
  }, []);

  const handleCreateShipment = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMessage(null);
    setError(null);

    try {
      const body = {
        from: {
          name: fromName,
          line1: fromLine1,
          city: fromCity,
          country: fromCountry,
        },
        to: {
          name: toName,
          line1: toLine1,
          city: toCity,
          country: toCountry,
        },
        parcel: {
          weight,
          length,
          width,
          height,
        },
        weightKg: weight,
        dims: {
          L: length,
          W: width,
          H: height,
        },
        speed,
        carrier,
        carrierSlug: carrierSlug || undefined,
        trackingNumber: trackingNumber || undefined,

        service,
        priceAED,
        currency,
        packageId: packageId || undefined,
      };

      const res = await fetch("/api/shipments/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to create shipment");
      }

      setMessage(`Shipment created: ${data.id}`);
      loadShipments();
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Failed to create shipment");
    } finally {
      setCreating(false);
    }
  };

   const openReviewModal = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setRating(5);
    setComment("");
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedShipment(null);
  };

  const submitReview = async () => {
    if (!selectedShipment) return;

    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipmentId: selectedShipment._id,
          rating,
          comment,
          // Optional: you can pass logged-in user details here later
          // customerName: session?.user?.name,
          // customerEmail: session?.user?.email,
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.message || "Failed to save review");
      }

      closeReviewModal();
      alert("Thanks for your review! 🙏");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Could not save review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleExportCsv = () => {
  // simplest: just go to the API URL → browser downloads file
  window.location.href = "/api/admin/shipments/export";
};

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>
        Dashboard – Shipments (Admin Only)
      </h1>


<div className="d-flex justify-content-between align-items-center mb-3">
  <h1 className="h3 mb-0">Shipments</h1>

  <button
    className="btn btn-outline-secondary btn-sm"
    onClick={() => {
      // simple open; later we can pass filters
      window.open("/api/admin/shipments/export", "_blank");
    }}
  >
    Export CSV
  </button>
</div>


      {/* STATUS MESSAGES */}
      {message && (
        <div
          style={{
            padding: "0.75rem 1rem",
            marginBottom: "1rem",
            borderRadius: 8,
            background: "#e6ffed",
            border: "1px solid #16a34a",
            color: "#166534",
          }}
        >
          {message}
        </div>
      )}
      {error && (
        <div
          style={{
            padding: "0.75rem 1rem",
            marginBottom: "1rem",
            borderRadius: 8,
            background: "#fef2f2",
            border: "1px solid #dc2626",
            color: "#b91c1c",
          }}
        >
          {error}
        </div>
      )}
<div className="d-flex flex-wrap align-items-center mb-3 gap-2">
  <div>
    <label className="form-label me-2 mb-0 small text-muted">Status</label>
    <select
      className="form-select form-select-sm"
      style={{ minWidth: 160 }}
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
    >
      <option value="all">All statuses</option>
      <option value="draft">Draft</option>
      <option value="rated">Rated</option>
      <option value="label_purchased">Label purchased</option>
      <option value="in_transit">In transit</option>
      <option value="out_for_delivery">Out for delivery</option>
      <option value="delivered">Delivered</option>
      <option value="exception">Exception</option>
      <option value="return_to_sender">Return to sender</option>
      <option value="cancelled">Cancelled</option>
    </select>
  </div>

  <div>
    <label className="form-label me-2 mb-0 small text-muted">Payment</label>
    <select
      className="form-select form-select-sm"
      style={{ minWidth: 160 }}
      value={paymentFilter}
      onChange={(e) => setPaymentFilter(e.target.value)}
    >
      <option value="all">All</option>
      <option value="paid">Paid only</option>
      <option value="unpaid">Unpaid only</option>
    </select>
  </div>
</div>

      {/* CREATE SHIPMENT FORM */}
      <section
        style={{
          marginBottom: "2.5rem",
          padding: "1.25rem 1rem",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
        }}
      >
        <h2 style={{ fontSize: "1.2rem", marginBottom: "0.75rem" }}>
          Create Test Shipment
        </h2>
        <form
          onSubmit={handleCreateShipment}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "0.75rem 1.5rem",
            alignItems: "flex-end",
          }}
        >
          {/* From */}
          <div>
            <label>From Name</label>
            <input value={fromName} onChange={(e) => setFromName(e.target.value)} required />
          </div>
          <div>
            <label>From Address</label>
            <input value={fromLine1} onChange={(e) => setFromLine1(e.target.value)} required />
          </div>
          <div>
            <label>From City</label>
            <input value={fromCity} onChange={(e) => setFromCity(e.target.value)} required />
          </div>
          <div>
            <label>From Country</label>
            <input value={fromCountry} onChange={(e) => setFromCountry(e.target.value)} required />
          </div>

          {/* To */}
          <div>
            <label>To Name</label>
            <input value={toName} onChange={(e) => setToName(e.target.value)} required />
          </div>
          <div>
            <label>To Address</label>
            <input value={toLine1} onChange={(e) => setToLine1(e.target.value)} required />
          </div>
          <div>
            <label>To City</label>
            <input value={toCity} onChange={(e) => setToCity(e.target.value)} required />
          </div>
          <div>
            <label>To Country</label>
            <input value={toCountry} onChange={(e) => setToCountry(e.target.value)} required />
          </div>

          {/* Parcel */}
          <div>
            <label>Weight (kg)</label>
            <input type="number" step="0.01" value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value))} required />
          </div>
          <div>
            <label>Length (cm)</label>
            <input type="number" value={length}
              onChange={(e) => setLength(parseFloat(e.target.value))} required />
          </div>
          <div>
            <label>Width (cm)</label>
            <input type="number" value={width}
              onChange={(e) => setWidth(parseFloat(e.target.value))} required />
          </div>
          <div>
            <label>Height (cm)</label>
            <input type="number" value={height}
              onChange={(e) => setHeight(parseFloat(e.target.value))} required />
          </div>

<div>
  <label>Package ID (optional)</label>
  <input
    value={packageId}
    onChange={(e) => setPackageId(e.target.value)}
    placeholder="Paste user package _id if shipment is for a package"
  />
</div>

          {/* Meta */}
          <div>
            <label>Speed</label>
            <input value={speed} onChange={(e) => setSpeed(e.target.value)} required />
          </div>
          <div>
            <label>Carrier</label>
            <input value={carrier} onChange={(e) => setCarrier(e.target.value)} required />
          </div>
          <div>
            <label>Service</label>
            <input value={service} onChange={(e) => setService(e.target.value)} required />
          </div>
          <div>
  <label>Carrier Slug (for tracking)</label>
  <input
    value={carrierSlug}
    onChange={(e) => setCarrierSlug(e.target.value)}
    placeholder="aramex / dhl / fedex"
  />
</div>

<div>
  <label>Tracking Number</label>
  <input
    value={trackingNumber}
    onChange={(e) => setTrackingNumber(e.target.value)}
    placeholder="Enter tracking number (optional for now)"
  />
</div>

          <div>
            <label>Price (AED)</label>
            <input type="number" step="0.01" value={priceAED}
              onChange={(e) => setPriceAED(parseFloat(e.target.value))} required />
          </div>
          <div>
            <label>Currency</label>
            <input value={currency} onChange={(e) => setCurrency(e.target.value)} required />
          </div>
                    <div>
            <label>Package ID (optional)</label>
            <input
              value={packageId}
              onChange={(e) => setPackageId(e.target.value)}
              placeholder="Paste Package _id from Admin › Packages"
            />
          </div>


          <div style={{ marginTop: "0.75rem" }}>
            <button
              type="submit"
              disabled={creating}
              style={{
                padding: "0.5rem 1.2rem",
                borderRadius: 999,
                border: "none",
                fontWeight: 600,
                cursor: creating ? "default" : "pointer",
                background: creating ? "#9ca3af" : "#0f766e",
                color: "white",
              }}
            >
              {creating ? "Creating..." : "Create Shipment"}
            </button>
          </div>
        </form>
      </section>

      {/* SHIPMENTS TABLE */}
      <section>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <h2 style={{ fontSize: "1.2rem" }}>Recent Shipments</h2>
          <button
            onClick={loadShipments}
            disabled={loadingList}
            style={{
              padding: "0.3rem 0.8rem",
              borderRadius: 999,
              border: "1px solid #d4d4d8",
              background: "#f9fafb",
              cursor: loadingList ? "default" : "pointer",
            }}
          >
            {loadingList ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Created</th>
                <th>From → To</th>
                <th>Carrier</th>
                <th>Weight</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {shipments.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: "0.75rem", textAlign: "center" }}>
                    No shipments yet.
                  </td>
                </tr>
              )}
              {filteredShipments.map((s) => (
                <tr key={s._id}>
                  <td style={{ padding: "0.4rem 0.5rem" }}>
                    <Link
                      href={`/dashboard/shipments/${s._id}`}
                      style={{ color: "#0f766e", textDecoration: "none", fontWeight: 500 }}
                    >
                      {s._id.slice(-6)}
                    </Link>
                  </td>
                  <td style={{ padding: "0.4rem 0.5rem" }}>
                    {s.createdAt ? new Date(s.createdAt).toLocaleString() : "—"}
                  </td>
                  <td style={{ padding: "0.4rem 0.5rem" }}>
                    {(s.from?.city || "?") + " → " + (s.to?.city || "?")}
                  </td>
                  <td style={{ padding: "0.4rem 0.5rem" }}>
                    {s.carrier || "—"} {s.service ? `(${s.service})` : ""}
                  </td>
                  <td style={{ padding: "0.4rem 0.5rem" }}>
                    {s.weightKg != null ? `${s.weightKg} kg` : "—"}
                  </td>
                  <td style={{ padding: "0.4rem 0.5rem" }}>
                    {s.priceAED != null
                      ? `${s.priceAED.toFixed(2)} ${s.currency || "AED"}`
                      : "—"}
                  </td>
                  <td style={{ padding: "0.4rem 0.5rem" }}>
                    {s.status || "created"}
                  </td>
                </tr>
                
              ))}
              

            </tbody>
          </table>
        </div>
      </section>

      <Modal show={showReviewModal} onHide={closeReviewModal} centered>
  <Modal.Header closeButton>
    <Modal.Title>Rate your shipment</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <p className="small text-muted mb-3">
      Tracking: <strong>{selectedShipment?.trackingNumber}</strong>
    </p>

    <Form.Group className="mb-3">
      <Form.Label>Rating</Form.Label>
      <div>
        {Array.from({ length: 5 }).map((_, index) => {
          const starValue = index + 1;
          const isActive = starValue <= rating;

          return (
            <Button
              key={starValue}
              type="button"
              className="me-1 mb-2"
              size="sm"
              variant={isActive ? "warning" : "outline-secondary"}
              onClick={() => setRating(starValue)}
            >
              ★
            </Button>
          );
        })}
      </div>
    </Form.Group>

    <Form.Group className="mb-3">
      <Form.Label>Comment (optional)</Form.Label>
      <Form.Control
        as="textarea"
        rows={3}
        placeholder="Tell us how the delivery went…"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
    </Form.Group>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={closeReviewModal}>
      Cancel
    </Button>
    <Button variant="primary" onClick={submitReview} disabled={submittingReview}>
      {submittingReview ? "Saving…" : "Submit review"}
    </Button>
  </Modal.Footer>
</Modal>


      <style jsx>{`
        label { display: block; font-size: 0.8rem; color: #4b5563; margin-bottom: 0.15rem; }
        input { width: 100%; border-radius: 0.5rem; border: 1px solid #d1d5db; padding: 0.35rem 0.5rem; font-size: 0.9rem; }
        th { text-align: left; padding: 0.4rem 0.5rem; border-bottom: 1px solid #e5e7eb; background: #f9fafb; font-weight: 600; white-space: nowrap; }
        td { border-bottom: 1px solid #f3f4f6; }
        tr:nth-child(even) td { background: #fafafa; }
      `}</style>
    </div>
  );
}
