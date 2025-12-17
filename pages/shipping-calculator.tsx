// pages/shipping-calculator.tsx
import type { NextPage } from "next";
import { useState } from "react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
} from "react-bootstrap";

type Speed = "standard" | "express";
type WeightUnit = "kg" | "lb";

const countries = [
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Canada",
  "Saudi Arabia",
  "Qatar",
  "Kuwait",
  "Oman",
  "Bahrain",
  "Ethiopia",
  "Eritrea",
  "Kenya",
  "Tanzania",
  "Uganda",
  "Rwanda",
  "Burundi",
  "Zambia",
  "Angola",
  "Ghana",
  "Nigeria",
];

function calculatePrice(params: {
  fromCountry: string;
  toCountry: string;
  weight: number;
  unit: WeightUnit;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  speed: Speed;
}) {
  const {
    fromCountry,
    toCountry,
    weight,
    unit,
    lengthCm,
    widthCm,
    heightCm,
    speed,
  } = params;

  if (!fromCountry || !toCountry || !weight || weight <= 0) {
    return null;
  }

  // convert weight to kg if needed
  const weightKg = unit === "kg" ? weight : weight * 0.453592;

  // volumetric weight (cm) using common divisor 5000
  let volumetricKg = 0;
  if (lengthCm && widthCm && heightCm) {
    volumetricKg = (lengthCm * widthCm * heightCm) / 5000;
  }

  const chargeableWeight = Math.max(weightKg, volumetricKg || 0.01);

  // Simple zone logic (you can customize later)
  const isGulf =
    fromCountry.includes("United Arab Emirates") ||
    fromCountry.includes("Saudi Arabia") ||
    fromCountry.includes("Qatar") ||
    fromCountry.includes("Kuwait") ||
    fromCountry.includes("Oman") ||
    fromCountry.includes("Bahrain");

  const isAfrica =
    toCountry.includes("Ethiopia") ||
    toCountry.includes("Eritrea") ||
    toCountry.includes("Kenya") ||
    toCountry.includes("Tanzania") ||
    toCountry.includes("Uganda") ||
    toCountry.includes("Rwanda") ||
    toCountry.includes("Burundi") ||
    toCountry.includes("Zambia") ||
    toCountry.includes("Angola") ||
    toCountry.includes("Ghana") ||
    toCountry.includes("Nigeria");

  let base = 35; // AED
  let perKg = 28; // AED per kg

  if (isGulf && isAfrica) {
    base = 30;
    perKg = 24;
  } else if (isGulf && toCountry.includes("United Kingdom")) {
    base = 40;
    perKg = 30;
  } else if (isGulf && toCountry.includes("United States")) {
    base = 45;
    perKg = 32;
  }

  const speedMultiplier = speed === "express" ? 1.35 : 1; // 35% extra for express
  const subtotal = base + perKg * chargeableWeight;
  const total = Math.round(subtotal * speedMultiplier * 100) / 100;

  return {
    currency: "AED",
    total,
    base,
    perKg,
    chargeableWeight: Math.round(chargeableWeight * 100) / 100,
    volumetricKg: volumetricKg
      ? Math.round(volumetricKg * 100) / 100
      : undefined,
  };
}

const ShippingCalculatorPage: NextPage = () => {
  const [fromCountry, setFromCountry] = useState("United Arab Emirates");
  const [toCountry, setToCountry] = useState("United Kingdom");
  const [postcode, setPostcode] = useState("");
  const [weight, setWeight] = useState<number>(1);
  const [unit, setUnit] = useState<WeightUnit>("kg");
  const [lengthCm, setLengthCm] = useState<number | undefined>();
  const [widthCm, setWidthCm] = useState<number | undefined>();
  const [heightCm, setHeightCm] = useState<number | undefined>();
  const [speed, setSpeed] = useState<Speed>("standard");
  const [result, setResult] = useState<ReturnType<typeof calculatePrice> | null>(
    null
  );
  const [submitted, setSubmitted] = useState(false);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const estimate = calculatePrice({
      fromCountry,
      toCountry,
      weight: Number(weight),
      unit,
      lengthCm: lengthCm ? Number(lengthCm) : undefined,
      widthCm: widthCm ? Number(widthCm) : undefined,
      heightCm: heightCm ? Number(heightCm) : undefined,
      speed,
    });

    setResult(estimate);
  };

  const estimate = result || calculatePrice({
    fromCountry,
    toCountry,
    weight: Number(weight),
    unit,
    lengthCm: lengthCm ? Number(lengthCm) : undefined,
    widthCm: widthCm ? Number(widthCm) : undefined,
    heightCm: heightCm ? Number(heightCm) : undefined,
    speed,
  });

  return (
    <MarketingLayout
      title="Shipping Calculator"
      description="Estimate your CrossBorderCart shipping price based on origin, destination, weight and dimensions."
    >
      <section className="py-5 bg-light border-bottom">
        <Container>
          <Row>
            <Col md={7}>
              <h1 className="fw-bold mb-3">Shipping Calculator</h1>
              <p className="lead text-muted mb-2">
                Get an instant estimate from UAE to your destination. These are{" "}
                <strong>non-binding</strong> quotes; final rates are confirmed
                after we verify your package.
              </p>
              <p className="small text-muted mb-0">
                For larger or commercial shipments,{" "}
                <a href="/contact" className="text-primary">
                  contact our team
                </a>{" "}
                for a customized quote.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      <Container className="py-5">
        <Row className="g-4">
          {/* FORM */}
          <Col lg={7}>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <Form onSubmit={handleCalculate}>
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Label>From</Form.Label>
                      <Form.Select
                        value={fromCountry}
                        onChange={(e) => setFromCountry(e.target.value)}
                      >
                        {countries.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col md={6}>
                      <Form.Label>To</Form.Label>
                      <Form.Select
                        value={toCountry}
                        onChange={(e) => setToCountry(e.target.value)}
                      >
                        {countries.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Label>Postcode (optional)</Form.Label>
                      <Form.Control
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value)}
                        placeholder="e.g. SW1A 1AA"
                      />
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Label>Weight</Form.Label>
                      <div className="d-flex">
                        <Form.Control
                          type="number"
                          min={0.1}
                          step="0.1"
                          value={weight}
                          onChange={(e) => setWeight(Number(e.target.value))}
                        />
                        <Form.Select
                          style={{ maxWidth: 90 }}
                          value={unit}
                          onChange={(e) =>
                            setUnit(e.target.value as WeightUnit)
                          }
                        >
                          <option value="kg">kg</option>
                          <option value="lb">lb</option>
                        </Form.Select>
                      </div>
                      <div className="small text-muted mt-1">
                        Chargeable weight is max of actual vs volumetric.
                      </div>
                    </Col>
                    <Col md={6}>
                      <Form.Label>Speed</Form.Label>
                      <div>
                        <ToggleButtonGroup
                          type="radio"
                          name="speed"
                          value={speed}
                          onChange={(val) => setSpeed(val as Speed)}
                        >
                          <ToggleButton
                            id="speed-standard"
                            value="standard"
                            variant={
                              speed === "standard"
                                ? "primary"
                                : "outline-secondary"
                            }
                            size="sm"
                          >
                            Standard
                          </ToggleButton>
                          <ToggleButton
                            id="speed-express"
                            value="express"
                            variant={
                              speed === "express"
                                ? "primary"
                                : "outline-secondary"
                            }
                            size="sm"
                            className="ms-2"
                          >
                            Express
                          </ToggleButton>
                        </ToggleButtonGroup>
                      </div>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col>
                      <Form.Label>Dimensions (optional, cm)</Form.Label>
                      <Row className="g-2">
                        <Col>
                          <Form.Control
                            type="number"
                            min={1}
                            placeholder="Length"
                            value={lengthCm ?? ""}
                            onChange={(e) =>
                              setLengthCm(
                                e.target.value
                                  ? Number(e.target.value)
                                  : undefined
                              )
                            }
                          />
                        </Col>
                        <Col>
                          <Form.Control
                            type="number"
                            min={1}
                            placeholder="Width"
                            value={widthCm ?? ""}
                            onChange={(e) =>
                              setWidthCm(
                                e.target.value
                                  ? Number(e.target.value)
                                  : undefined
                              )
                            }
                          />
                        </Col>
                        <Col>
                          <Form.Control
                            type="number"
                            min={1}
                            placeholder="Height"
                            value={heightCm ?? ""}
                            onChange={(e) =>
                              setHeightCm(
                                e.target.value
                                  ? Number(e.target.value)
                                  : undefined
                              )
                            }
                          />
                        </Col>
                      </Row>
                      <div className="small text-muted mt-1">
                        Recommended for bulky items. If omitted, we only use
                        actual weight.
                      </div>
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-end mt-4">
                    <Button type="submit" variant="primary">
                      Get Estimate
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            <Alert variant="light" className="mt-3 border">
              <strong>Note:</strong> These are{" "}
              <strong>non-binding estimates</strong>. Final rates may change
              after we confirm the exact package, packaging, remote area
              surcharges, or customs duties.
            </Alert>
          </Col>

          {/* RESULT */}
          <Col lg={5}>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <h5 className="fw-semibold mb-3">Estimated price</h5>

                {!estimate && submitted && (
                  <div className="text-muted small">
                    Please enter weight and destination to see an estimate.
                  </div>
                )}

                {estimate && (
                  <>
                    <div className="display-6 fw-bold mb-2">
                      {estimate.currency} {estimate.total.toFixed(2)}
                    </div>
                    <div className="text-muted small mb-3">
                      Based on{" "}
                      <strong>{estimate.chargeableWeight} kg</strong>{" "}
                      chargeable weight ({speed === "express"
                        ? "Express"
                        : "Standard"}{" "}
                      service).
                    </div>

                    <ul className="small text-muted mb-3">
                      <li>Base fee: {estimate.currency} {estimate.base}</li>
                      <li>
                        Per kg: {estimate.currency} {estimate.perKg} ×{" "}
                        {estimate.chargeableWeight} kg
                      </li>
                      {estimate.volumetricKg && (
                        <li>Includes volumetric weight calculation.</li>
                      )}
                    </ul>

                    <Button
                      variant="outline-primary"
                      size="sm"
                      href="/signup"
                    >
                      Create account &amp; ship
                    </Button>
                  </>
                )}
              </Card.Body>
            </Card>

            <Card className="mt-3 border-0 shadow-sm">
              <Card.Body>
                <h6 className="fw-semibold mb-2">Business / bulk shipping?</h6>
                <p className="small text-muted mb-2">
                  For pallets, cartons or regular business shipments, we can
                  offer contract rates.
                </p>
                <Button
                  href="/contact"
                  variant="outline-secondary"
                  size="sm"
                >
                  Talk to our team
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </MarketingLayout>
  );
};

export default ShippingCalculatorPage;
