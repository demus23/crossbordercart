//pages\dashboard\shipments\[id].tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";

type ShipmentDetail = any; // if you want, you can copy the Shipment type here

export default function ShipmentDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [shipment, setShipment] = useState<ShipmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingStatusEmail, setSendingStatusEmail] = useState(false);
  const [statusEmailMessage, setStatusEmailMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchShipment = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/shipments/${id}`);
        const data = await res.json();

        // Try to be flexible with API response shape
        if (!res.ok || data.ok === false) {
          throw new Error(data.error || "Failed to load shipment");
        }

        const s = data.shipment ?? data; // some handlers return { ok, shipment }, some just the doc
        setShipment(s);
      } catch (err: any) {
        console.error(err);
        setError(err.message ?? "Failed to load shipment");
      } finally {
        setLoading(false);
      }
    };

    fetchShipment();
  }, [id]);

  const [updating, setUpdating] = useState(false);

async function handleStatusUpdate(newStatus: string) {
  if (!shipment?._id) return;

  const confirmMsg = `Mark this shipment as "${newStatus}"?`;
  if (!window.confirm(confirmMsg)) return;

  try {
    setUpdating(true);
    const res = await fetch("/api/shipments/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shipmentId: shipment._id,   // ✅ use shipmentId, not id
        status: newStatus,
      }),
    });

    const json = await res.json();
    if (!json.ok) {
      throw new Error(json.error || "Failed to update status");
    }

    alert("Status updated. Refresh this page to see the latest status & timeline.");
  } catch (err: any) {
    alert(err?.message || "Failed to update status");
  } finally {
    setUpdating(false);
  }
}

const handleSendLabelEmail = async () => {
  if (!shipment?._id) {
    alert("No shipment ID found.");
    return;
  }

  const defaultEmail =
    shipment.customerEmail ||
    shipment.to?.email ||
    "";

  const toEmail = window.prompt(
    "Enter email address to send the shipping label:",
    defaultEmail
  );

  if (!toEmail) return;

  try {
    const res = await fetch("/api/admin/shipments/send-label-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shipmentId: shipment._id,
        toEmail,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.ok === false) {
      console.error("Send label error:", data);
      alert(
        "Failed to send label email: " +
          (data?.error || res.statusText || "Unknown error")
      );
      return;
    }

    alert("Shipping label email sent successfully ✅");
  } catch (err) {
    console.error("Send label email error:", err);
    alert("Network error while sending label email.");
  }
};

const handleSendStatusEmail = async () => {
  if (!shipment?._id) {
    alert("No shipment ID found.");
    return;
  }

  const defaultEmail =
    shipment.customerEmail ||
    shipment.to?.email ||
    "";

  const toEmail = window.prompt(
    "Enter email address to send the status update:",
    defaultEmail
  );

  if (!toEmail) return;

  try {
    const res = await fetch("/api/admin/shipments/send-status-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shipmentId: shipment._id,
        toEmail,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.ok === false) {
      console.error("Send status email error:", data);
      alert(
        "Failed to send status email: " +
          (data?.error || res.statusText || "Unknown error")
      );
      return;
    }

    alert("Status email sent successfully ✅");
  } catch (err) {
    console.error("Send status email error:", err);
    alert("Network error while sending status email.");
  }
};

const handleMarkDeliveredAndEmail = async () => {
  if (!shipment?._id) {
    alert("No shipment ID found.");
    return;
  }

  const defaultEmail =
    shipment.customerEmail || shipment.to?.email || "";

  const toEmail = window.prompt(
    "Enter email to notify (leave as is if correct):",
    defaultEmail
  );

  if (toEmail === null) return; // user cancelled

  try {
    const res = await fetch("/api/admin/shipments/update-status-and-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shipmentId: shipment._id,
        status: "delivered",        // 👈 you can change this to any status
        toEmail,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.ok === false) {
      console.error("Update+email error:", data);
      alert(
        "Failed to update status or send email: " +
          (data?.error || res.statusText || "Unknown error")
      );
      return;
    }

    if (data.warning) {
      alert(data.warning);
    } else {
      alert("Status updated & email sent ✅");
    }

    // Optional: reload page to see new status
    window.location.reload();
  } catch (err) {
    console.error("Update+email error:", err);
    alert("Network error while updating status.");
  }
};

const handleMarkPaid = async () => {
  if (!shipment?._id) {
    alert("No shipment loaded");
    return;
  }

  try {
    const res = await fetch("/api/admin/shipments/mark-paid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shipmentId: shipment._id, isPaid: true }),
    });

    const json = await res.json();
    if (!res.ok || !json.ok) {
      throw new Error(json.error || "Failed to mark as paid");
    }

    alert("Shipment marked as PAID ✅");
    // simple reload to refresh data
    window.location.reload();
  } catch (err) {
    console.error(err);
    alert("Error marking as paid");
  }
};


  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        <Link href="/dashboard/shipments" style={{ color: "#0f766e" }}>
          ← Back to Shipments
        </Link>
      </div>

      <h1 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>
        Shipment Detail
      </h1>

      {loading && <p>Loading shipment...</p>}
      {error && (
        <div
          style={{
            padding: "0.75rem 1rem",
            borderRadius: 8,
            background: "#fef2f2",
            border: "1px solid #dc2626",
            color: "#b91c1c",
          }}
        >
          {error}
        </div>
      )}
<div className="d-flex flex-wrap gap-2 mt-3">
  <button
    type="button"
    className="btn btn-outline-dark btn-sm"
    onClick={handleSendLabelEmail}
  >
    Send label by email
  </button>

  <button
    type="button"
    className="btn btn-outline-primary btn-sm"
    onClick={handleSendStatusEmail}
  >
    Send status email
  </button>

  <button
    type="button"
    className="btn btn-success btn-sm"
    onClick={handleMarkDeliveredAndEmail}
  >
    Mark delivered & email client
  </button>
</div>

<div className="mt-3">
  <h5>Payment</h5>
  <p className="mb-1">
    Status:{" "}
    {shipment?.isPaid ? (
      <span className="badge bg-success">Paid</span>
    ) : (
      <span className="badge bg-warning text-dark">Unpaid</span>
    )}
  </p>

  {!shipment?.isPaid && (
    <button
      type="button"
      className="btn btn-sm btn-outline-success"
      onClick={handleMarkPaid}
    >
      Mark as paid
    </button>
  )}

  {shipment?.isPaid && shipment?.paidAt && (
    <small className="text-muted d-block">
      Paid at: {new Date(shipment.paidAt).toLocaleString()}
    </small>
  )}
</div>

                    

{statusEmailMessage && (
  <p className="mt-1 text-xs text-gray-600">{statusEmailMessage}</p>
)}

      {shipment && !loading && !error && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 1.1fr",
            gap: "1.3rem",
            marginBottom: "2rem",
          }}
        >
          {/* Basic info */}
          <section
            style={{
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              padding: "1rem",
            }}
          >
            <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>
              Overview
            </h2>
            <DetailRow label="ID" value={shipment._id} />
            <DetailRow
              label="Created"
              value={
                shipment.createdAt
                  ? new Date(shipment.createdAt).toLocaleString()
                  : "—"
              }
            />
            <DetailRow label="Status" value={shipment.status ?? "created"} />
            <DetailRow
              label="Carrier"
              value={
                shipment.carrier
                  ? `${shipment.carrier}${
                      shipment.service ? ` (${shipment.service})` : ""
                    }`
                  : "—"
              }
            />
            <DetailRow
              label="Price"
              value={
                shipment.priceAED != null
                  ? `${shipment.priceAED} ${
                      shipment.currency || "AED"
                    }`
                  : "—"
              }
            />
            <DetailRow
              label="Weight"
              value={
                shipment.weightKg != null ? `${shipment.weightKg} kg` : "—"
              }
            />
          </section>

          <p className="text-sm">
  Public tracking link:{" "}
  <a
    href={`/track/${shipment._id}`}
    target="_blank"
    rel="noreferrer"
  >
    https://crossbordercart.com/track/{shipment._id}
  </a>
</p>

{/* Status update controls */}
<section
  style={{
    marginTop: "1.5rem",
    padding: "1rem",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
  }}
>
  <h2
    style={{
      fontSize: "1rem",
      marginBottom: "0.75rem",
      fontWeight: 600,
    }}
  >
    Update Status
  </h2>

  <p style={{ fontSize: "0.9rem", marginBottom: "0.75rem", color: "#6b7280" }}>
    Use these buttons while processing the shipment. Each change will appear on
    the public tracking timeline.
  </p>

  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "0.5rem",
    }}
  >
    <button
      type="button"
      onClick={() => handleStatusUpdate("Picked Up")}
      disabled={updating}
      style={{
        padding: "0.4rem 0.8rem",
        borderRadius: 999,
        border: "1px solid #e5e7eb",
        background: "white",
        cursor: "pointer",
      }}
    >
      Picked Up
    </button>

    <button
      type="button"
      onClick={() => handleStatusUpdate("In Transit")}
      disabled={updating}
      style={{
        padding: "0.4rem 0.8rem",
        borderRadius: 999,
        border: "1px solid #e5e7eb",
        background: "white",
        cursor: "pointer",
      }}
    >
      In Transit
    </button>

    <button
      type="button"
      onClick={() => handleStatusUpdate("Out for Delivery")}
      disabled={updating}
      style={{
        padding: "0.4rem 0.8rem",
        borderRadius: 999,
        border: "1px solid #e5e7eb",
        background: "white",
        cursor: "pointer",
      }}
    >
      Out for Delivery
    </button>

    <button
      type="button"
      onClick={() => handleStatusUpdate("Delivered")}
      disabled={updating}
      style={{
        padding: "0.4rem 0.8rem",
        borderRadius: 999,
        border: "1px solid #16a34a",
        background: "#22c55e",
        color: "white",
        cursor: "pointer",
      }}
    >
      Delivered
    </button>

    <button
      type="button"
      onClick={() => handleStatusUpdate("Problem")}
      disabled={updating}
      style={{
        padding: "0.4rem 0.8rem",
        borderRadius: 999,
        border: "1px solid #f97373",
        background: "#fee2e2",
        color: "#b91c1c",
        cursor: "pointer",
      }}
    >
      Problem
    </button>
  </div>
</section>


          {/* From / To */}
          <section
            style={{
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              padding: "1rem",
            }}
          >
            <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>
              Route
            </h2>
            <h3 style={{ fontSize: "0.95rem", marginBottom: "0.3rem" }}>
              From
            </h3>
            <AddressBlock address={shipment.from} />
            <h3
              style={{
                fontSize: "0.95rem",
                marginBottom: "0.3rem",
                marginTop: "0.75rem",
              }}
            >
              To
            </h3>
            <AddressBlock address={shipment.to} />
          </section>

          {/* Raw JSON */}
          <section
            style={{
              gridColumn: "1 / -1",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              padding: "1rem",
            }}
          >
            <h2 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
              Raw Data (debug)
            </h2>
            <pre
              style={{
                fontSize: "0.8rem",
                background: "#0b1120",
                color: "#e5e7eb",
                padding: "0.75rem",
                borderRadius: 8,
                overflowX: "auto",
              }}
            >
              {JSON.stringify(shipment, null, 2)}
            </pre>
          </section>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: "0.9rem",
        marginBottom: "0.3rem",
      }}
    >
      <span style={{ color: "#6b7280" }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value ?? "—"}</span>
    </div>
  );
}

function AddressBlock({ address }: { address: any }) {
  if (!address) return <p style={{ fontSize: "0.9rem" }}>—</p>;
  return (
    <p style={{ fontSize: "0.9rem", lineHeight: 1.4 }}>
      {address.name && <strong>{address.name}</strong>}
      {address.name && <br />}
      {address.line1}
      <br />
      {address.city} {address.postalCode || ""}
      <br />
      {address.country}
    </p>
  );
}
