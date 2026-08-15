import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Shipment = {
  _id: string;

  trackingNumber: string;

  destination: {
    name?: string;
    city?: string;
    country?: string;
  };

  carrier?: string;
  service?: string;

  weightKg: number;

  priceAED: number;
  currency: string;

  status: string;
  paymentStatus: string;
  isPaid: boolean;

  checkoutUrl?: string | null;
  invoiceNo?: string | null;

  packageCount: number;

  packages: Array<{
    _id: string;
    tracking: string;
    courier?: string;
    weightKg: number;
    status?: string;
  }>;

  latestEvent?: {
    status?: string;
    location?: string;
    description?: string;
    createdAt?: string;
  } | null;

  createdAt?: string;
  updatedAt?: string;
};

function formatStatus(status?: string) {
  const labels: Record<string, string> = {
    draft: "Preparing",
    rated: "Rated",
    label_purchased: "Ready for Dispatch",
    in_transit: "In Transit",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    return_to_sender: "Return to Sender",
    exception: "Exception",
    cancelled: "Cancelled",
  };

  return labels[status || ""] || status || "Unknown";
}

function statusClass(status?: string) {
  switch (status) {
    case "delivered":
      return "success";

    case "in_transit":
      return "primary";

    case "out_for_delivery":
      return "warning";

    case "exception":
    case "return_to_sender":
    case "cancelled":
      return "danger";

    default:
      return "secondary";
  }
}

export default function MyShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  async function loadShipments() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/me/shipments");
      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(
          data?.error || "Failed to load shipments"
        );
      }

      setShipments(data.shipments || []);
    } catch (err: any) {
      setError(
        err?.message || "Failed to load shipments"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadShipments();
  }, []);

  const filteredShipments = useMemo(() => {
    if (filter === "all") {
      return shipments;
    }

    if (filter === "unpaid") {
      return shipments.filter(
        (shipment) => !shipment.isPaid
      );
    }

    if (filter === "paid") {
      return shipments.filter(
        (shipment) => shipment.isPaid
      );
    }

    return shipments.filter(
      (shipment) => shipment.status === filter
    );
  }, [shipments, filter]);

  return (
    <main
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "2rem 1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "2rem",
            }}
          >
            My Shipments
          </h1>

          <p
            style={{
              margin: "0.35rem 0 0",
              color: "#6b7280",
            }}
          >
            View, pay and track your Cross Border Cart
            shipments.
          </p>
        </div>

        <button
          type="button"
          onClick={loadShipments}
          disabled={loading}
          className="btn btn-outline-secondary"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
          marginBottom: "1.5rem",
        }}
      >
        {[
          ["all", "All"],
          ["unpaid", "Pending Payment"],
          ["paid", "Paid"],
          ["in_transit", "In Transit"],
          ["out_for_delivery", "Out for Delivery"],
          ["delivered", "Delivered"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            style={{
              borderRadius: 999,
              padding: "0.45rem 0.85rem",
              border:
                filter === value
                  ? "1px solid #0f766e"
                  : "1px solid #d1d5db",
              background:
                filter === value
                  ? "#0f766e"
                  : "white",
              color:
                filter === value
                  ? "white"
                  : "#374151",
              fontWeight: 600,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {loading ? (
        <div
          style={{
            padding: "3rem",
            textAlign: "center",
            color: "#6b7280",
          }}
        >
          Loading shipments...
        </div>
      ) : filteredShipments.length === 0 ? (
        <div
          style={{
            padding: "3rem",
            textAlign: "center",
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            background: "white",
          }}
        >
          <h3>No shipments found</h3>

          <p style={{ color: "#6b7280" }}>
            Your shipments will appear here once they
            are created.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "1rem",
          }}
        >
          {filteredShipments.map((shipment) => (
            <section
              key={shipment._id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 16,
                background: "white",
                padding: "1.25rem",
                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div
                    style={{
                      color: "#6b7280",
                      fontSize: "0.8rem",
                    }}
                  >
                    CBC TRACKING
                  </div>

                  <div
                    style={{
                      fontSize: "1.15rem",
                      fontWeight: 800,
                    }}
                  >
                    {shipment.trackingNumber}
                  </div>

                  <div
                    style={{
                      marginTop: "0.35rem",
                      color: "#6b7280",
                    }}
                  >
                    {shipment.destination?.city || "—"}
                    {shipment.destination?.country
                      ? `, ${shipment.destination.country}`
                      : ""}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    className={`badge bg-${statusClass(
                      shipment.status
                    )}`}
                  >
                    {formatStatus(shipment.status)}
                  </span>

                  {shipment.isPaid ? (
                    <span className="badge bg-success">
                      Paid
                    </span>
                  ) : (
                    <span className="badge bg-warning text-dark">
                      Payment Required
                    </span>
                  )}
                </div>
              </div>

              <hr />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(135px, 1fr))",
                  gap: "1rem",
                }}
              >
                <Info
                  label="Carrier"
                  value={
                    shipment.carrier
                      ? `${shipment.carrier}${
                          shipment.service
                            ? ` · ${shipment.service}`
                            : ""
                        }`
                      : "—"
                  }
                />

                <Info
                  label="Weight"
                  value={`${Number(
                    shipment.weightKg || 0
                  ).toFixed(2)} kg`}
                />

                <Info
                  label="Packages"
                  value={String(
                    shipment.packageCount || 0
                  )}
                />

                <Info
                  label="Shipping Cost"
                  value={`${Number(
                    shipment.priceAED || 0
                  ).toFixed(2)} ${
                    shipment.currency || "AED"
                  }`}
                />
              </div>

              {shipment.latestEvent && (
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "0.8rem",
                    borderRadius: 10,
                    background: "#f9fafb",
                  }}
                >
                  <div
                    style={{
                      color: "#6b7280",
                      fontSize: "0.75rem",
                      marginBottom: 3,
                    }}
                  >
                    Latest Update
                  </div>

                  <strong>
                    {formatStatus(
                      shipment.latestEvent.status
                    )}
                  </strong>

                  {shipment.latestEvent.location && (
                    <span>
                      {" "}
                      · {shipment.latestEvent.location}
                    </span>
                  )}

                  {shipment.latestEvent.description && (
                    <div
                      style={{
                        color: "#6b7280",
                        fontSize: "0.85rem",
                        marginTop: 3,
                      }}
                    >
                      {
                        shipment.latestEvent
                          .description
                      }
                    </div>
                  )}
                </div>
              )}

              {shipment.packages.length > 0 && (
                <div
                  style={{
                    marginTop: "1rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#6b7280",
                      marginBottom: 6,
                    }}
                  >
                    Included Packages
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      flexWrap: "wrap",
                    }}
                  >
                    {shipment.packages.map(
                      (pkg) => (
                        <span
                          key={pkg._id}
                          style={{
                            padding:
                              "0.25rem 0.55rem",
                            borderRadius: 999,
                            border:
                              "1px solid #e5e7eb",
                            background:
                              "#f9fafb",
                            fontSize:
                              "0.8rem",
                          }}
                        >
                          {pkg.tracking}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "0.6rem",
                  flexWrap: "wrap",
                  marginTop: "1.25rem",
                }}
              >
                <Link
                  href={`/track/${encodeURIComponent(
                    shipment.trackingNumber
                  )}`}
                  className="btn btn-outline-primary btn-sm"
                >
                  Track Shipment
                </Link>

               {!shipment.isPaid && (
  <button
    type="button"
    className="btn btn-success btn-sm"
    onClick={async () => {
      try {
        const firstPackage = shipment.packages?.[0];

        if (!firstPackage?._id) {
          alert("No package is linked to this shipment.");
          return;
        }

        const res = await fetch(
          `/api/me/pay-package?packageId=${encodeURIComponent(
            firstPackage._id
          )}`
        );

        const data = await res.json();

        if (!res.ok || !data?.ok) {
          alert(
            data?.error ||
              "Payment link is not ready yet."
          );
          return;
        }

        if (data.paid) {
          alert("This shipment is already paid.");
          await loadShipments();
          return;
        }

        if (!data.checkoutUrl) {
          alert(
            "Payment link has not been created yet."
          );
          return;
        }

        window.location.href = data.checkoutUrl;
      } catch (err: any) {
        console.error("Pay Now error:", err);

        alert(
          err?.message ||
            "Unable to open payment page."
        );
      }
    }}
  >
    Pay Now
  </button>
)}

                {shipment.invoiceNo && (
                  <Link
                    href={`/dashboard/invoices/${shipment.invoiceNo}`}
                    className="btn btn-outline-secondary btn-sm"
                  >
                    Invoice
                  </Link>
                )}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div
        style={{
          color: "#6b7280",
          fontSize: "0.75rem",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontWeight: 700,
          marginTop: 2,
        }}
      >
        {value}
      </div>
    </div>
  );
}