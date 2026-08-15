//pages\dashboard\shipments\[id].tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";

type ShipmentDetail = any;

const FORWARD_STATUSES = [
  "label_purchased",
  "in_transit",
  "out_for_delivery",
  "delivered",
];

function isForwardStatus(status: string) {
  return FORWARD_STATUSES.includes(status);
}

function formatShipmentStatus(status?: string) {
  const labels: Record<string, string> = {
    draft: "Draft",
    rated: "Rated",
    label_purchased: "Label Purchased",
    in_transit: "In Transit",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    return_to_sender: "Return to Sender",
    exception: "Exception",
    cancelled: "Cancelled",
  };

  return labels[String(status || "")] || status || "Unknown";
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function getPackageTracking(pkg: any) {
  return (
    pkg?.trackingNumber ||
    pkg?.tracking ||
    pkg?.packageTrackingNumber ||
    pkg?.courierTrackingNumber ||
    "No tracking number"
  );
}

function getPackageWeight(pkg: any) {
  const weight =
    pkg?.weightKg ??
    pkg?.weight ??
    pkg?.actualWeightKg ??
    pkg?.chargeableWeightKg;

  return Number.isFinite(Number(weight)) ? Number(weight) : 0;
}

function getCustomer(shipment: any) {
  if (
    shipment?.userId &&
    typeof shipment.userId === "object"
  ) {
    return shipment.userId;
  }

  if (
    shipment?.user &&
    typeof shipment.user === "object"
  ) {
    return shipment.user;
  }

  return null;
}

function formatTimelineDate(date?: string | Date) {
  if (!date) return "—";

  return new Date(date).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function timelineColor(type?: string) {
  switch (type) {
    case "status_changed":
      return "#2563eb";

    case "payment":
      return "#059669";

    case "email":
      return "#7c3aed";

    case "tracking":
      return "#ea580c";

    default:
      return "#6b7280";
  }
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
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventSaving, setEventSaving] = useState(false);

 const [eventForm, setEventForm] = useState({
  status: "in_transit",
  location: "",
  description: "",
  code: "",
});

  const isPaid =
    shipment?.paymentStatus === "paid" || shipment?.isPaid === true;

  const isLocked =
    !!shipment?.status && isForwardStatus(shipment.status) && !isPaid;

    const customer = getCustomer(shipment);

const packages = Array.isArray(shipment?.packageIds)
  ? shipment.packageIds
  : [];

const totalPackageWeight = packages.reduce(
  (sum: number, pkg: any) => sum + getPackageWeight(pkg),
  0
);

const timeline = [
  ...(shipment?.activity || []),

  ...(shipment?.events || []).map((event: any) => ({
    at: event.createdAt,
    type: "tracking",
    payload: event,
  })),
].sort(
  (a: any, b: any) =>
    new Date(b.at).getTime() - new Date(a.at).getTime()
);

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

  async function handleAddEvent() {
  if (!shipment?._id) return;

  setEventSaving(true);

  try {
    const res = await fetch(
      `/api/admin/shipments/${shipment._id}/events`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventForm),
      }
    );

    const data = await res.json();

    if (!res.ok || !data?.ok) {
      throw new Error(data?.error || "Failed to add event");
    }

    setShipment(data.shipment);

    setEventForm({
      status: "in_transit",
      location: "",
      description: "",
      code: "",
    });

    setShowEventForm(false);
    alert("Shipment event added ✅");
  } catch (err: any) {
    alert(err?.message || "Failed to add event");
  } finally {
    setEventSaving(false);
  }
}

 async function handleStatusUpdate(newStatus: string) {
  if (!shipment?._id) return;

  if (isForwardStatus(newStatus) && !isPaid) {
    alert("Payment required before shipment can move forward.");
    return;
  }

  if (
    !window.confirm(
      `Change shipment status to "${formatShipmentStatus(newStatus)}"?`
    )
  ) {
    return;
  }

  try {
    setUpdating(true);

    const res = await fetch(
      `/api/admin/shipments/${shipment._id}/events`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          description: `Shipment status changed to ${formatShipmentStatus(
            newStatus
          )}`,
          location: "",
        }),
      }
    );

    const data = await res.json();

    if (!res.ok || !data?.ok) {
      throw new Error(data?.error || "Failed to update shipment status");
    }

    // Update the page immediately
    setShipment(data.shipment);

    alert(
      `Shipment status updated to ${formatShipmentStatus(newStatus)} ✅`
    );
  } catch (err: any) {
    console.error("Status update error:", err);

    alert(err?.message || "Failed to update shipment status");
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

            <button
  type="button"
  className="btn btn-outline-success btn-sm"
  onClick={() =>
    window.open(
      `/dashboard/shipments/${shipment._id}/label`,
      "_blank"
    )
  }
>
  Print shipping label
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
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
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
              <DetailRow
  label="Status"
  value={formatShipmentStatus(shipment.status)}
/>
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
  <h2
    style={{
      fontSize: "1.1rem",
      marginBottom: "0.75rem",
    }}
  >
    Customer
  </h2>

  <DetailRow
    label="Name"
    value={
      customer?.name ||
      shipment.to?.name ||
      "—"
    }
  />

  <DetailRow
    label="Email"
    value={
      customer?.email ||
      shipment.customerEmail ||
      shipment.userEmail ||
      shipment.to?.email ||
      "—"
    }
  />

  <DetailRow
    label="Phone"
    value={
      customer?.phone ||
      shipment.to?.phone ||
      "—"
    }
  />

  <DetailRow
    label="Suite"
    value={
      customer?.suiteId ||
      shipment.suiteId ||
      "—"
    }
  />

  {customer?._id && (
    <div style={{ marginTop: "0.75rem" }}>
      <Link
        href={`/admin/customers/${customer._id}`}
        style={{
          color: "#0f766e",
          fontSize: "0.9rem",
          fontWeight: 600,
        }}
      >
        View customer profile →
      </Link>
    </div>
  )}
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
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    padding: "1rem",
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "1rem",
      marginBottom: "1rem",
    }}
  >
    <div>
      <h2
        style={{
          fontSize: "1.1rem",
          margin: 0,
        }}
      >
        Packages
      </h2>

      <p
        style={{
          color: "#6b7280",
          fontSize: "0.85rem",
          margin: "0.25rem 0 0",
        }}
      >
        Packages included in this shipment
      </p>
    </div>

    <span
      style={{
        background: "#ecfdf5",
        color: "#047857",
        borderRadius: 999,
        padding: "0.3rem 0.7rem",
        fontSize: "0.8rem",
        fontWeight: 700,
      }}
    >
      {packages.length} package{packages.length === 1 ? "" : "s"}
    </span>
  </div>

  {packages.length === 0 ? (
    <div
      style={{
        background: "#f9fafb",
        borderRadius: 8,
        padding: "1rem",
        color: "#6b7280",
        fontSize: "0.9rem",
      }}
    >
      No populated package information was returned by the shipment API.
    </div>
  ) : (
    <div
      style={{
        display: "grid",
        gap: "0.75rem",
      }}
    >
      {packages.map((pkg: any, index: number) => (
        <div
          key={pkg?._id || index}
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(160px, 1.5fr) minmax(100px, 1fr) 90px 100px",
            gap: "1rem",
            alignItems: "center",
            padding: "0.8rem",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            background: "#ffffff",
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: "0.9rem",
              }}
            >
              {getPackageTracking(pkg)}
            </div>

            <div
              style={{
                color: "#6b7280",
                fontSize: "0.8rem",
                marginTop: "0.2rem",
              }}
            >
              Package {index + 1}
            </div>
          </div>

          <div>
            <div
              style={{
                color: "#6b7280",
                fontSize: "0.75rem",
              }}
            >
              Courier
            </div>

            <div
              style={{
                fontSize: "0.9rem",
                fontWeight: 500,
              }}
            >
              {formatValue(pkg?.courier || pkg?.carrier)}
            </div>
          </div>

          <div>
            <div
              style={{
                color: "#6b7280",
                fontSize: "0.75rem",
              }}
            >
              Weight
            </div>

            <div
              style={{
                fontSize: "0.9rem",
                fontWeight: 500,
              }}
            >
              {getPackageWeight(pkg)} kg
            </div>
          </div>

          <div>
            <div
              style={{
                color: "#6b7280",
                fontSize: "0.75rem",
              }}
            >
              Status
            </div>

            <div
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              {formatValue(pkg?.status)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )}

  <div
    style={{
      display: "flex",
      justifyContent: "flex-end",
      gap: "2rem",
      borderTop: "1px solid #e5e7eb",
      marginTop: "1rem",
      paddingTop: "1rem",
    }}
  >
    <div>
      <div
        style={{
          color: "#6b7280",
          fontSize: "0.75rem",
        }}
      >
        Total packages
      </div>

      <div
        style={{
          fontWeight: 700,
          textAlign: "right",
        }}
      >
        {packages.length}
      </div>
    </div>

    <div>
      <div
        style={{
          color: "#6b7280",
          fontSize: "0.75rem",
        }}
      >
        Package weight
      </div>

      <div
        style={{
          fontWeight: 700,
          textAlign: "right",
        }}
      >
        {totalPackageWeight.toFixed(2)} kg
      </div>
    </div>

    <div>
      <div
        style={{
          color: "#6b7280",
          fontSize: "0.75rem",
        }}
      >
        Shipment weight
      </div>

      <div
        style={{
          fontWeight: 700,
          textAlign: "right",
        }}
      >
        {Number(shipment.weightKg || 0).toFixed(2)} kg
      </div>
    </div>
  </div>
</section>

<button
  type="button"
  className="btn btn-outline-primary btn-sm mb-3"
  onClick={() => setShowEventForm((current) => !current)}
>
  {showEventForm ? "Close Event Form" : "+ Add Event"}
</button>
{showEventForm && (
  <div
    style={{
      padding: "1rem",
      marginBottom: "1rem",
      border: "1px solid #d1d5db",
      borderRadius: 10,
      background: "#f9fafb",
    }}
  >
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "1rem",
      }}
    >
      <div>
        <label>Status</label>

        <select
          className="form-select"
          value={eventForm.status}
          onChange={(e) =>
            setEventForm((current) => ({
              ...current,
              status: e.target.value,
            }))
          }
        >
          <option value="draft">Draft</option>
          <option value="rated">Rated</option>
          <option value="label_purchased">Label Purchased</option>
          <option value="in_transit">In Transit</option>
          <option value="out_for_delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="return_to_sender">Return to Sender</option>
          <option value="exception">Exception</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div>
        <label>Location</label>

        <input
          className="form-control"
          value={eventForm.location}
          onChange={(e) =>
            setEventForm((current) => ({
              ...current,
              location: e.target.value,
            }))
          }
          placeholder="Dubai Airport"
        />
      </div>

      <div style={{ gridColumn: "1 / -1" }}>
        <label>Description</label>

        <textarea
          className="form-control"
          rows={3}
          value={eventForm.description}
          onChange={(e) =>
            setEventForm((current) => ({
              ...current,
              description: e.target.value,
            }))
          }
          placeholder="Shipment departed the UAE"
        />
      </div>

      <div>
        <label>Event Code (optional)</label>

        <input
          className="form-control"
          value={eventForm.code}
          onChange={(e) =>
            setEventForm((current) => ({
              ...current,
              code: e.target.value,
            }))
          }
          placeholder="DEPARTED_DXB"
        />
      </div>
    </div>

    <div className="mt-3">
      <button
        type="button"
        className="btn btn-primary"
        disabled={eventSaving}
        onClick={handleAddEvent}
      >
        {eventSaving ? "Saving..." : "Save Event"}
      </button>
    </div>
  </div>
)}

<section
  style={{
    gridColumn: "1 / -1",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: "1rem",
  }}
>
  <h2
    style={{
      marginBottom: "1rem",
    }}
  >
    Shipment Timeline
  </h2>

  {timeline.length === 0 ? (
    <div
      style={{
        color: "#6b7280",
      }}
    >
      No shipment activity yet.
    </div>
  ) : (
    timeline.map((item: any, index: number) => (
      <div
        key={index}
        style={{
          display: "flex",
          gap: "1rem",
          paddingBottom: "1rem",
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: timelineColor(item.type),
            marginTop: 6,
            flexShrink: 0,
          }}
        />

        <div>
          <div
            style={{
              fontWeight: 600,
            }}
          >
            {item.type === "tracking"
              ? item.payload.status
              : item.type.replaceAll("_", " ")}
          </div>

          <div
            style={{
              color: "#6b7280",
              fontSize: "0.85rem",
            }}
          >
            {item.payload?.description ||
              item.payload?.location ||
              JSON.stringify(item.payload)}
          </div>

          <div
            style={{
              fontSize: "0.75rem",
              color: "#9ca3af",
              marginTop: 4,
            }}
          >
            {formatTimelineDate(item.at)}
          </div>
        </div>
      </div>
    ))
  )}
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
  label="Label Purchased"
  disabled={updating}
  onClick={() => handleStatusUpdate("label_purchased")}
/>

<StatusButton
  label="In Transit"
  disabled={updating || !isPaid}
  onClick={() => handleStatusUpdate("in_transit")}
/>

<StatusButton
  label="Out for Delivery"
  disabled={updating || !isPaid}
  onClick={() => handleStatusUpdate("out_for_delivery")}
/>

<StatusButton
  label="Delivered"
  disabled={updating || !isPaid}
  success
  onClick={() => handleStatusUpdate("delivered")}
/>

<StatusButton
  label="Exception"
  disabled={updating}
  danger
  onClick={() => handleStatusUpdate("exception")}
/>

<StatusButton
  label="Return to Sender"
  disabled={updating}
  danger
  onClick={() => handleStatusUpdate("return_to_sender")}
/>

<StatusButton
  label="Cancelled"
  disabled={updating}
  danger
  onClick={() => handleStatusUpdate("cancelled")}
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
      <style jsx>{`
  @media (max-width: 760px) {
    section {
      grid-column: 1 / -1;
    }
  }
`}</style>
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