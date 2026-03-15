// components/ShippingQuoteSimple.tsx
import { useState } from "react";
import { Modal, Form, InputGroup, Button, Spinner, Table, Alert, Badge } from "react-bootstrap";

type Props = { show: boolean; onHide: () => void };

type Quote = {
  carrier: "DHL" | "Aramex" | "UPS";
  speed: "standard" | "express";
  etaDays: number;
  chargeableKg: number;
  priceAED: number;
  breakdown: {
    baseAED: number;
    fuelAED: number;
    remoteAED: number;
    insuranceAED: number;
  };
};

const ISO: Record<string, string> = {
  "uae": "AE", "united arab emirates": "AE", "ae": "AE",
  "uk": "GB", "united kingdom": "GB", "gb": "GB",
  "usa": "US", "united states": "US", "us": "US",
};

function normCountry(s: string) {
  const k = (s || "").trim().toLowerCase();
  return ISO[k] || s.trim();
}

export default function ShippingQuoteSimple({ show, onHide }: Props) {
  const [from, setFrom] = useState("United Arab Emirates");
  const [to, setTo] = useState("United Kingdom");
  const [postcode, setPostcode] = useState("");
  const [weight, setWeight] = useState("1");
  const [unit, setUnit] = useState<"kg" | "lb">("kg");
  const [speed, setSpeed] = useState<"standard" | "express">("standard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");

  async function getQuotes() {
    setError(null);
    setQuotes([]);

    const w = Number(weight);
    if (!(w > 0)) {
      setError("Weight must be a positive number");
      return;
    }

    const body = {
  from: normCountry(from),
  to: { country: normCountry(to), postcode: postcode.trim() || undefined },
  weightKg: unit === "kg" ? w : w * 0.45359237,
  speed,
  dims: {
    L: length ? Number(length) : undefined,
    W: width ? Number(width) : undefined,
    H: height ? Number(height) : undefined,
  },
  carriers: { DHL: true, Aramex: true, UPS: true },
};

    setLoading(true);
    try {
      const res = await fetch("/api/shipping/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({} as any));
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      const rows: Quote[] = Array.isArray(data.quotes) ? data.quotes : [];
      rows.sort((a, b) => a.priceAED - b.priceAED);
      setQuotes(rows);

      if (!rows.length) {
        setError("No quotes for this request.");
      }
    } catch (e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : typeof e === "string"
          ? e
          : "Failed to get quotes";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const cheapest = quotes.length ? Math.min(...quotes.map((q) => q.priceAED)) : null;

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Shipping Calculator</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="row g-3">
          <div className="col-md-5">
            <Form.Label>From</Form.Label>
            <Form.Control
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="UAE / AE"
            />
          </div>

          <div className="col-md-5">
            <Form.Label>To</Form.Label>
            <Form.Control
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="UK / GB"
            />
          </div>

          <div className="col-md-2">
            <Form.Label>Postcode (opt.)</Form.Label>
            <Form.Control
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
            />
          </div>

          <div className="col-md-6">
            <Form.Label>Weight</Form.Label>
            <div className="col-md-6">
  <Form.Label>Dimensions (cm)</Form.Label>
  <div className="d-flex gap-2">
    <Form.Control
      type="number"
      placeholder="L"
      value={length}
      onChange={(e) => setLength(e.target.value)}
    />
    <Form.Control
      type="number"
      placeholder="W"
      value={width}
      onChange={(e) => setWidth(e.target.value)}
    />
    <Form.Control
      type="number"
      placeholder="H"
      value={height}
      onChange={(e) => setHeight(e.target.value)}
    />
  </div>
  <div className="form-text">
    Used to calculate volumetric weight for bulky packages.
  </div>
</div>
            <InputGroup>
              <Form.Control
                type="number"
                min="0.1"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
              <Form.Select value={unit} onChange={(e) => setUnit(e.target.value as "kg" | "lb")}>
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </Form.Select>
            </InputGroup>
            <div className="form-text">Chargeable = max(actual, volumetric)</div>
          </div>

          <div className="col-md-6">
            <Form.Label className="d-block">Speed</Form.Label>
            <div className="d-flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={speed === "standard" ? "primary" : "outline-primary"}
                onClick={() => setSpeed("standard")}
              >
                Standard
              </Button>
              <Button
                type="button"
                size="sm"
                variant={speed === "express" ? "primary" : "outline-primary"}
                onClick={() => setSpeed("express")}
              >
                Express
              </Button>
            </div>
          </div>
        </div>

        <Alert variant="light" className="mt-3">
          These are <strong>non-binding estimates</strong>. Final rates are confirmed by our team
          after reviewing exact package details and any surcharges.
        </Alert>

        {error && <Alert variant="danger" className="mt-2">{error}</Alert>}

        {loading && (
          <div className="d-flex justify-content-center py-3">
            <Spinner animation="border" />
          </div>
        )}

        {!loading && quotes.length > 0 && (
          <Table hover responsive className="mt-2">
            <thead>
              <tr>
                <th>Carrier</th>
                <th>Speed</th>
                <th className="text-end">Chargeable</th>
                <th className="text-end">Total</th>
                <th>ETA</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((q, i) => {
                const isCheapest = cheapest !== null && q.priceAED === cheapest;
                return (
                  <tr key={i} className={isCheapest ? "table-success" : undefined}>
                    <td>
                      {q.carrier}{" "}
                      {isCheapest && <Badge bg="success" pill>Cheapest</Badge>}
                    </td>
                    <td style={{ textTransform: "capitalize" }}>{q.speed}</td>
                    <td className="text-end">{q.chargeableKg.toFixed(2)} kg</td>
                    <td className="text-end">AED {q.priceAED.toFixed(2)}</td>
                    <td>{q.etaDays} days</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button type="button" variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button type="button" variant="primary" onClick={getQuotes} disabled={loading}>
          {loading ? <Spinner size="sm" /> : "Get Quotes"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}