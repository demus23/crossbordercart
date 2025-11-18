import { useEffect, useState, FormEvent } from "react";

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
  createdAt?: string;
};

export default function DashboardShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        // legacy fields (still supported by API)
        weightKg: weight,
        dims: {
          L: length,
          W: width,
          H: height,
        },
        speed,
        carrier,
        service,
        priceAED,
        currency,
      };

      const res = await fetch("/api/shipments/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to create shipment");
      }

      setMessage(`Shipment created: ${data.id}`);
      // Reload list
      loadShipments();
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Failed to create shipment");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>
        Dashboard – Shipments
      </h1>

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
            <input
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              required
            />
          </div>
          <div>
            <label>From Address</label>
            <input
              value={fromLine1}
              onChange={(e) => setFromLine1(e.target.value)}
              required
            />
          </div>
          <div>
            <label>From City</label>
            <input
              value={fromCity}
              onChange={(e) => setFromCity(e.target.value)}
              required
            />
          </div>
          <div>
            <label>From Country</label>
            <input
              value={fromCountry}
              onChange={(e) => setFromCountry(e.target.value)}
              required
            />
          </div>

          {/* To */}
          <div>
            <label>To Name</label>
            <input
              value={toName}
              onChange={(e) => setToName(e.target.value)}
              required
            />
          </div>
          <div>
            <label>To Address</label>
            <input
              value={toLine1}
              onChange={(e) => setToLine1(e.target.value)}
              required
            />
          </div>
          <div>
            <label>To City</label>
            <input
              value={toCity}
              onChange={(e) => setToCity(e.target.value)}
              required
            />
          </div>
          <div>
            <label>To Country</label>
            <input
              value={toCountry}
              onChange={(e) => setToCountry(e.target.value)}
              required
            />
          </div>

          {/* Parcel */}
          <div>
            <label>Weight (kg)</label>
            <input
              type="number"
              step="0.01"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value))}
              required
            />
          </div>
          <div>
            <label>Length (cm)</label>
            <input
              type="number"
              value={length}
              onChange={(e) => setLength(parseFloat(e.target.value))}
              required
            />
          </div>
          <div>
            <label>Width (cm)</label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(parseFloat(e.target.value))}
              required
            />
          </div>
          <div>
            <label>Height (cm)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(parseFloat(e.target.value))}
              required
            />
          </div>

          {/* Meta */}
          <div>
            <label>Speed</label>
            <input
              value={speed}
              onChange={(e) => setSpeed(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Carrier</label>
            <input
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Service</label>
            <input
              value={service}
              onChange={(e) => setService(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Price (AED)</label>
            <input
              type="number"
              step="0.01"
              value={priceAED}
              onChange={(e) => setPriceAED(parseFloat(e.target.value))}
              required
            />
          </div>
          <div>
            <label>Currency</label>
            <input
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              required
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.75rem",
          }}
        >
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
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.9rem",
            }}
          >
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
              {shipments.map((s) => (
                <tr key={s._id}>
                  <td style={{ padding: "0.4rem 0.5rem" }}>
                    {s._id.slice(-6)}
                  </td>
                  <td style={{ padding: "0.4rem 0.5rem" }}>
                    {s.createdAt
                      ? new Date(s.createdAt).toLocaleString()
                      : "—"}
                  </td>
                  <td style={{ padding: "0.4rem 0.5rem" }}>
                    {(s.from?.city || "?") +
                      " → " +
                      (s.to?.city || "?")}
                  </td>
                  <td style={{ padding: "0.4rem 0.5rem" }}>
                    {s.carrier || "—"} {s.service ? `(${s.service})` : ""}
                  </td>
                  <td style={{ padding: "0.4rem 0.5rem" }}>
                    {/* we don't have weight directly here unless schema stores it;
                        you can adjust this later */}
                    —
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

      <style jsx>{`
        label {
          display: block;
          font-size: 0.8rem;
          color: #4b5563;
          margin-bottom: 0.15rem;
        }
        input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid #d1d5db;
          padding: 0.35rem 0.5rem;
          font-size: 0.9rem;
        }
        th {
          text-align: left;
          padding: 0.4rem 0.5rem;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
          font-weight: 600;
          white-space: nowrap;
        }
        td {
          border-bottom: 1px solid #f3f4f6;
        }
        tr:nth-child(even) td {
          background: #fafafa;
        }
      `}</style>
    </div>
  );
}
