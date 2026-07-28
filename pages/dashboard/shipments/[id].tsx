//pages\dashboard\shipments\[id].tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";

type ShipmentDetail = any;

const FORWARD_STATUSES = [
  "in_transit",
  "out_for_delivery",
  "delivered",
  "In Transit",
  "Out for Delivery",
  "Delivered",
];

function isForwardStatus(status: string) {
  return FORWARD_STATUSES.includes(status);
}

export default function ShipmentDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [shipment, setShipment] = useState<ShipmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [statusEmailMessage, setStatusEmailMessage] = useState<string | null>(
    null
  );

  const isPaid =
    shipment?.paymentStatus === "paid" || shipment?.isPaid === true;

  const isLocked =
    !!shipment?.status && isForwardStatus(shipment.status) && !isPaid;

  useEffect(() => {
    if (!id) return;

    const fetchShipment = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/shipments/${id}`);
        const data = await res.json();

        if (!res.ok || data.ok === false) {
          throw new Error(data.error || "Failed to load shipment");
        }

        setShipment(data.shipment ?? data);
      } catch (err: any) {
        console.error(err);
        setError(err.message ?? "Failed to load shipment");
      } finally {
        setLoading(false);
      }
    };

    fetchShipment();
  }, [id]);

  async function handleStatusUpdate(newStatus: string) {
    if (!shipment?._id) return;

    if (isForwardStatus(newStatus) && !isPaid) {
      alert("Payment required before shipment can move forward.");
      return;
    }

    if (!window.confirm(`Mark this shipment as "${newStatus}"?`)) return;

    try {
      setUpdating(true);

      const res = await fetch("/api/shipments/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipmentId: shipment._id,
          status: newStatus,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Failed to update status");
      }

      alert("Status updated ✅");
      window.location.reload();
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

    const defaultEmail = shipment.customerEmail || shipment.to?.email || "";

    const toEmail = window.prompt(
      "Enter email address to send the shipping label:",
      defaultEmail
    );

    if (!toEmail) return;

    try {
      const res = await fetch("/api/admin/shipments/send-label-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipmentId: shipment._id, toEmail }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.ok === false) {
        alert("Failed to send label email: " + (data?.error || res.statusText));
        return;
      }

      alert("Shipping label email sent successfully ✅");
    } catch (err) {
      console.error(err);
      alert("Network error while sending label email.");
    }
  };

  const handleSendStatusEmail = async () => {
    if (!shipment?._id) {
      alert("No shipment ID found.");
      return;
    }

    const defaultEmail = shipment.customerEmail || shipment.to?.email || "";

    const toEmail = window.prompt(
      "Enter email address to send the status update:",
      defaultEmail
    );

    if (!toEmail) return;

    try {
      const res = await fetch("/api/admin/shipments/send-status-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipmentId: shipment._id, toEmail }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.ok === false) {
        alert("Failed to send status email: " + (data?.error || res.statusText));
        return;
      }

      setStatusEmailMessage("Status email sent successfully ✅");
      alert("Status email sent successfully ✅");
    } catch (err) {
      console.error(err);
      alert("Network error while sending status email.");
    }
  };

  const handleMarkDeliveredAndEmail = async () => {
    if (!shipment?._id) {
      alert("No shipment ID found.");
      return;
    }

    if (!isPaid) {
      alert("Payment required before marking shipment as delivered.");
      return;
    }

    const defaultEmail = shipment.customerEmail || shipment.to?.email || "";

    const toEmail = window.prompt(
      "Enter email to notify:",
      defaultEmail
    );

    if (toEmail === null) return;

    try {
      const res = await fetch("/api/admin/shipments/update-status-and-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipmentId: shipment._id,
          status: "delivered",
          toEmail,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.ok === false) {
        alert(
          "Failed to update status or send email: " +
            (data?.error || res.statusText)
        );
        return;
      }

      alert(data.warning || "Status updated & email sent ✅");
      window.location.reload();
    } catch (err) {
      console.error(err);
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

      {shipment && !loading && !error && (
        <>
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
              disabled={!isPaid}
              onClick={handleMarkDeliveredAndEmail}
              className={`btn btn-sm ${
                isPaid ? "btn-success" : "btn-secondary disabled"
              }`}
            >
              Mark delivered & email client
            </button>
          </div>

          <div className="mt-3">
            <h5>Payment</h5>

            <p className="mb-1">
              Status:{" "}
              {isPaid ? (
                <span className="badge bg-success">Paid</span>
              ) : (
                <span className="badge bg-warning text-dark">Unpaid</span>
              )}
            </p>

            {!isPaid && (
              <button
  type="button"
  className="btn btn-sm btn-outline-primary"
  onClick={async () => {
    if (!shipment?._id) return;

    const res = await fetch("/api/admin/charges/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: shipment.customerEmail,
        amount: Number(shipment.priceAED),
        currency: shipment.currency || "AED",
        description: "Shipment charge",
        shipmentId: shipment._id,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      alert(data.error || "Failed to create payment link");
      return;
    }

    const payUrl = data.data?.payUrl || data.checkoutUrl;
    if (payUrl) {
      window.open(payUrl, "_blank");
    } else {
      alert("Payment link created, but no URL returned.");
    }
  }}
>
  Create payment link
</button>
            )}

            {isPaid && shipment?.paidAt && (
              <small className="text-muted d-block">
                Paid at: {new Date(shipment.paidAt).toLocaleString()}
              </small>
            )}

            {isLocked && (
              <div className="mt-2 text-danger">
                ⚠️ This shipment is locked. Payment required before continuing.
              </div>
            )}
          </div>

          {statusEmailMessage && (
            <p className="mt-1 text-muted">{statusEmailMessage}</p>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 1.1fr",
              gap: "1.3rem",
              marginBottom: "2rem",
              marginTop: "1rem",
            }}
          >
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
                    ? `${shipment.priceAED} ${shipment.currency || "AED"}`
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

            <section
              style={{
                gridColumn: "1 / -1",
                marginTop: "0.5rem",
                padding: "1rem",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
              }}
            >
              <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>
                Update Status
              </h2>

              <p
                style={{
                  fontSize: "0.9rem",
                  marginBottom: "0.75rem",
                  color: "#6b7280",
                }}
              >
                Paid shipment can move forward. Unpaid shipment cannot be sent,
                delivered, or moved to transit.
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                <StatusButton
                  label="Picked Up"
                  disabled={updating}
                  onClick={() => handleStatusUpdate("Picked Up")}
                />

                <StatusButton
                  label="In Transit"
                  disabled={updating || !isPaid}
                  onClick={() => handleStatusUpdate("In Transit")}
                />

                <StatusButton
                  label="Out for Delivery"
                  disabled={updating || !isPaid}
                  onClick={() => handleStatusUpdate("Out for Delivery")}
                />

                <StatusButton
                  label="Delivered"
                  disabled={updating || !isPaid}
                  success
                  onClick={() => handleStatusUpdate("Delivered")}
                />

                <StatusButton
                  label="Problem"
                  disabled={updating}
                  danger
                  onClick={() => handleStatusUpdate("Problem")}
                />
              </div>
            </section>

            <p className="text-sm" style={{ gridColumn: "1 / -1" }}>
              Public tracking link:{" "}
              <a
                href={`/track/${shipment._id}`}
                target="_blank"
                rel="noreferrer"
              >
                https://crossbordercart.com/track/{shipment._id}
              </a>
            </p>

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
        </>
      )}
    </div>
  );
}

function StatusButton({
  label,
  disabled,
  onClick,
  success,
  danger,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  success?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "0.4rem 0.8rem",
        borderRadius: 999,
        border: success
          ? "1px solid #16a34a"
          : danger
          ? "1px solid #f97373"
          : "1px solid #e5e7eb",
        background: disabled
          ? "#e5e7eb"
          : success
          ? "#22c55e"
          : danger
          ? "#fee2e2"
          : "white",
        color: disabled
          ? "#6b7280"
          : success
          ? "white"
          : danger
          ? "#b91c1c"
          : "black",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {label}
    </button>
  );
}

function DetailRow({ label, value }: { label: string; value: any }) {
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