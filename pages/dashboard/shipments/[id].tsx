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
