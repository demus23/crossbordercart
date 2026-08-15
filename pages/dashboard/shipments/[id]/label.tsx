import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type PackageItem = {
  _id: string;
  tracking?: string;
  courier?: string;
  weightKg?: number;
};

type ShipmentData = {
  _id: string;
  trackingNumber?: string;
  packageTrackingNumber?: string;
  carrier?: string;
  service?: string;
  weightKg?: number;
  suiteId?: string;
  customerEmail?: string;

  from?: {
    name?: string;
    line1?: string;
    line2?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
  };

  to?: {
    name?: string;
    line1?: string;
    line2?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
    email?: string;
  };

  packageIds?: PackageItem[];
};

export default function ShipmentLabelPage() {
  const router = useRouter();
  const { id } = router.query;

  const [shipment, setShipment] = useState<ShipmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!router.isReady || typeof id !== "string") return;

    async function loadShipment() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/shipments/${id}`);
        const data = await res.json();

        if (!res.ok || !data?.ok) {
          throw new Error(data?.error || "Unable to load shipment");
        }

        setShipment(data.shipment);
      } catch (err: any) {
        setError(err?.message || "Unable to load shipment");
      } finally {
        setLoading(false);
      }
    }

    loadShipment();
  }, [router.isReady, id]);

  if (loading) {
    return <div style={{ padding: 32 }}>Loading label...</div>;
  }

  if (error || !shipment) {
    return (
      <div style={{ padding: 32, color: "#b91c1c" }}>
        {error || "Shipment not found"}
      </div>
    );
  }

  const packages = Array.isArray(shipment.packageIds)
    ? shipment.packageIds
    : [];

  return (
    <>
      <div className="toolbar">
        <button onClick={() => window.print()}>
          Print Label
        </button>

        <button onClick={() => router.back()}>
          Back
        </button>
      </div>

      <main className="label">
        <header className="header">
          <div>
            <div className="brand">CrossBorderCart</div>
            <div className="tagline">
              From the UAE to your doorstep
            </div>
          </div>

          <div className="cbc-code">
            <div className="small-label">CBC TRACKING</div>
            <strong>
              {shipment.trackingNumber || "Not assigned"}
            </strong>
          </div>
        </header>

        <section className="route-grid">
          <div className="address-box">
            <div className="section-title">FROM</div>

            <strong>
              {shipment.from?.name || "Cross Border Cart Warehouse"}
            </strong>

            <div>{shipment.from?.line1 || "—"}</div>

            {shipment.from?.line2 && (
              <div>{shipment.from.line2}</div>
            )}

            <div>
              {shipment.from?.city || "Dubai"}
              {shipment.from?.postalCode
                ? `, ${shipment.from.postalCode}`
                : ""}
            </div>

            <div>{shipment.from?.country || "AE"}</div>

            {shipment.from?.phone && (
              <div>Tel: {shipment.from.phone}</div>
            )}
          </div>

          <div className="address-box destination">
            <div className="section-title">SHIP TO</div>

            <strong>{shipment.to?.name || "Customer"}</strong>

            <div>{shipment.to?.line1 || "—"}</div>

            {shipment.to?.line2 && (
              <div>{shipment.to.line2}</div>
            )}

            <div>
              {shipment.to?.city || "—"}
              {shipment.to?.postalCode
                ? `, ${shipment.to.postalCode}`
                : ""}
            </div>

            <div className="country">
              {shipment.to?.country || "—"}
            </div>

            {shipment.to?.phone && (
              <div>Tel: {shipment.to.phone}</div>
            )}

            {(shipment.to?.email ||
              shipment.customerEmail) && (
              <div>
                Email:{" "}
                {shipment.to?.email ||
                  shipment.customerEmail}
              </div>
            )}

            {shipment.suiteId && (
              <div className="suite">
                Suite: {shipment.suiteId}
              </div>
            )}
          </div>
        </section>

        <section className="shipment-info">
          <div>
            <span>Carrier</span>
            <strong>{shipment.carrier || "—"}</strong>
          </div>

          <div>
            <span>Service</span>
            <strong>{shipment.service || "—"}</strong>
          </div>

          <div>
            <span>Total Weight</span>
            <strong>
              {Number(shipment.weightKg || 0).toFixed(2)} kg
            </strong>
          </div>

          <div>
            <span>Packages</span>
            <strong>{packages.length}</strong>
          </div>
        </section>

        <section className="tracking-area">
          <div className="tracking-text">
            {shipment.trackingNumber || shipment._id}
          </div>

          <div className="barcode">
            {Array.from({ length: 55 }).map((_, index) => (
              <span
                key={index}
                style={{
                  width: index % 4 === 0 ? 4 : index % 3 === 0 ? 2 : 1,
                }}
              />
            ))}
          </div>

          <div className="tracking-bottom">
            {shipment.trackingNumber || shipment._id}
          </div>
        </section>

        {packages.length > 0 && (
          <section className="package-list">
            <div className="section-title">
              CONSOLIDATED PACKAGES
            </div>

            {packages.map((pkg, index) => (
              <div className="package-row" key={pkg._id || index}>
                <span>
                  {index + 1}. {pkg.tracking || "No tracking"}
                </span>

                <span>{pkg.courier || "—"}</span>

                <span>
                  {Number(pkg.weightKg || 0).toFixed(2)} kg
                </span>
              </div>
            ))}
          </section>
        )}

        <footer>
          <span>crossbordercart.com</span>
          <span>support@crossbordercart.com</span>
        </footer>
      </main>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .toolbar {
          max-width: 820px;
          margin: 20px auto;
          display: flex;
          gap: 10px;
        }

        .toolbar button {
          padding: 9px 18px;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          background: white;
          cursor: pointer;
          font-weight: 600;
        }

        .toolbar button:first-child {
          background: #0f766e;
          color: white;
          border-color: #0f766e;
        }

        .label {
          width: 800px;
          min-height: 1050px;
          margin: 20px auto;
          padding: 34px;
          border: 2px solid #111827;
          background: white;
          color: #111827;
          font-family: Arial, Helvetica, sans-serif;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 4px solid #0f766e;
          padding-bottom: 18px;
        }

        .brand {
          font-size: 30px;
          font-weight: 800;
          color: #0f766e;
        }

        .tagline {
          margin-top: 4px;
          color: #4b5563;
          font-size: 13px;
        }

        .cbc-code {
          text-align: right;
          font-size: 18px;
        }

        .small-label,
        .section-title {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
          color: #6b7280;
          margin-bottom: 8px;
        }

        .route-grid {
          display: grid;
          grid-template-columns: 1fr 1.35fr;
          border-bottom: 2px solid #111827;
        }

        .address-box {
          min-height: 225px;
          padding: 22px 18px;
          line-height: 1.5;
          font-size: 15px;
        }

        .destination {
          border-left: 2px solid #111827;
          font-size: 17px;
        }

        .country {
          font-size: 21px;
          font-weight: 800;
          margin-top: 6px;
        }

        .suite {
          display: inline-block;
          margin-top: 12px;
          padding: 6px 12px;
          background: #ecfdf5;
          border: 1px solid #10b981;
          font-weight: 800;
        }

        .shipment-info {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border-bottom: 2px solid #111827;
        }

        .shipment-info > div {
          padding: 15px;
          border-right: 1px solid #d1d5db;
        }

        .shipment-info > div:last-child {
          border-right: none;
        }

        .shipment-info span {
          display: block;
          font-size: 11px;
          color: #6b7280;
          margin-bottom: 5px;
          text-transform: uppercase;
        }

        .shipment-info strong {
          font-size: 15px;
        }

        .tracking-area {
          padding: 25px 20px;
          text-align: center;
          border-bottom: 2px solid #111827;
        }

        .tracking-text {
          font-size: 25px;
          font-weight: 800;
          letter-spacing: 2px;
          margin-bottom: 18px;
        }

        .barcode {
          height: 95px;
          display: flex;
          justify-content: center;
          align-items: stretch;
          gap: 3px;
          overflow: hidden;
        }

        .barcode span {
          display: block;
          background: #000;
          height: 100%;
        }

        .tracking-bottom {
          margin-top: 10px;
          letter-spacing: 4px;
          font-size: 13px;
          font-weight: 700;
        }

        .package-list {
          margin-top: 20px;
          border: 1px solid #d1d5db;
          padding: 16px;
        }

        .package-row {
          display: grid;
          grid-template-columns: 1.5fr 1fr 100px;
          gap: 10px;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
          font-size: 13px;
        }

        .package-row:last-child {
          border-bottom: none;
        }

        footer {
          margin-top: 25px;
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #4b5563;
        }

        @media print {
          @page {
            size: A4;
            margin: 8mm;
          }

          .toolbar {
            display: none;
          }

          .label {
            margin: 0;
            width: 100%;
            min-height: auto;
            border: 2px solid #111827;
          }
        }

        @media screen and (max-width: 840px) {
          .label {
            width: calc(100% - 24px);
          }

          .route-grid {
            grid-template-columns: 1fr;
          }

          .destination {
            border-left: none;
            border-top: 2px solid #111827;
          }

          .shipment-info {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </>
  );
}