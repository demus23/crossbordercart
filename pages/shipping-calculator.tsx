// pages/shipping-calculator.tsx
import type { NextPage } from "next";
import { useMemo, useState } from "react";
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

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function toKg(weight: number, unit: WeightUnit) {
  return unit === "kg" ? weight : weight * 0.453592;
}

function getZonePricing(fromCountry: string, toCountry: string) {
  const gulfCountries = [
    "United Arab Emirates",
    "Saudi Arabia",
    "Qatar",
    "Kuwait",
    "Oman",
    "Bahrain",
  ];

  const africaCountries = [
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

  const isFromGulf = gulfCountries.includes(fromCountry);
  const isToAfrica = africaCountries.includes(toCountry);

  let base = 35;
  let perKg = 28;

  if (isFromGulf && isToAfrica) {
    base = 30;
    perKg = 24;
  } else if (isFromGulf && toCountry === "United Kingdom") {
    base = 40;
    perKg = 30;
  } else if (isFromGulf && toCountry === "United States") {
    base = 45;
    perKg = 32;
  } else if (isFromGulf && toCountry === "Canada") {
    base = 45;
    perKg = 31;
  }

  return { base, perKg };
}

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

  const actualWeightKg = toKg(weight, unit);

  const hasDimensions =
    !!lengthCm && lengthCm > 0 && !!widthCm && widthCm > 0 && !!heightCm && heightCm > 0;

  const volumetricKg = hasDimensions
    ? (lengthCm * widthCm * heightCm) / 5000
    : 0;

  const chargeableWeight = Math.max(actualWeightKg, volumetricKg || 0);

  const { base, perKg } = getZonePricing(fromCountry, toCountry);
  const speedMultiplier = speed === "express" ? 1.35 : 1;

  const subtotal = base + perKg * chargeableWeight;
  const total = subtotal * speedMultiplier;

  return {
    currency: "AED",
    base: round2(base),
    perKg: round2(perKg),
    actualWeightKg: round2(actualWeightKg),
    volumetricKg: hasDimensions ? round2(volumetricKg) : undefined,
    chargeableWeight: round2(chargeableWeight),
    speedMultiplier,
    total: round2(total),
  };
}

const ShippingCalculatorPage: NextPage = () => {
  const [fromCountry, setFromCountry] = useState("United Arab Emirates");
  const [toCountry, setToCountry] = useState("United Kingdom");
  const [postcode, setPostcode] = useState("");
  const [weight, setWeight] = useState<number | "">(1);
  const [unit, setUnit] = useState<WeightUnit>("kg");
  const [lengthCm, setLengthCm] = useState<number | "">("");
  const [widthCm, setWidthCm] = useState<number | "">("");
  const [heightCm, setHeightCm] = useState<number | "">("");
  const [speed, setSpeed] = useState<Speed>("standard");
  const [submitted, setSubmitted] = useState(false);

  const estimate = useMemo(() => {
    return calculatePrice({
      fromCountry,
      toCountry,
      weight: Number(weight || 0),
      unit,
      lengthCm: lengthCm === "" ? undefined : Number(lengthCm),
      widthCm: widthCm === "" ? undefined : Number(widthCm),
      heightCm: heightCm === "" ? undefined : Number(heightCm),
      speed,
    });
  }, [fromCountry, toCountry, weight, unit, lengthCm, widthCm, heightCm, speed]);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <MarketingLayout
      title="Shipping Calculator"
      description="Estimate your CrossBorderCart shipping price based on origin, destination, weight and dimensions."
    >
      <section className="py-5 bg-light border-bottom">
        <Container>
          <Row>
            <Col md={8}>
              <h1 className="fw-bold mb-3">Shipping Calculator</h1>
              <p className="lead text-muted mb-2">
                Get an instant shipping estimate from <strong>UAE</strong> to your
                destination. These are <strong>non-binding</strong> quotes and final
                charges are confirmed after package verification.
              </p>
              <p className="small text-muted mb-0">
                For larger, commercial, or frequent shipments,{" "}
                <a href="/contact" className="text-primary">
                  contact our team
                </a>{" "}
                for custom rates.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      <Container className="py-5">
        <Row className="g-4">
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
                      <Form.Label>Destination postcode (optional)</Form.Label>
                      <Form.Control
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value)}
                        placeholder="e.g. SW1A 1AA"
                      />
                      <div className="small text-muted mt-1">
                        Optional for now. Useful later for remote-area pricing.
                      </div>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Label>Weight</Form.Label>
                      <div className="d-flex gap-2">
                        <Form.Control
                          type="number"
                          min={0.1}
                          step="0.1"
                          value={weight}
                          onChange={(e) =>
                            setWeight(e.target.value === "" ? "" : Number(e.target.value))
                          }
                        />
                        <Form.Select
                          style={{ maxWidth: 90 }}
                          value={unit}
                          onChange={(e) => setUnit(e.target.value as WeightUnit)}
                        >
                          <option value="kg">kg</option>
                          <option value="lb">lb</option>
                        </Form.Select>
                      </div>
                      <div className="small text-muted mt-1">
                        Chargeable weight is the greater of actual and volumetric weight.
                      </div>
                    </Col>

                    <Col md={6}>
                      <Form.Label>Service</Form.Label>
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
                            variant={speed === "standard" ? "primary" : "outline-secondary"}
                            size="sm"
                          >
                            Standard
                          </ToggleButton>

                          <ToggleButton
                            id="speed-express"
                            value="express"
                            variant={speed === "express" ? "primary" : "outline-secondary"}
                            size="sm"
                            className="ms-2"
                          >
                            Express
                          </ToggleButton>
                        </ToggleButtonGroup>
                      </div>
                      <div className="small text-muted mt-1">
                        Express currently applies a 35% premium.
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
                            value={lengthCm}
                            onChange={(e) =>
                              setLengthCm(e.target.value === "" ? "" : Number(e.target.value))
                            }
                          />
                        </Col>
                        <Col>
                          <Form.Control
                            type="number"
                            min={1}
                            placeholder="Width"
                            value={widthCm}
                            onChange={(e) =>
                              setWidthCm(e.target.value === "" ? "" : Number(e.target.value))
                            }
                          />
                        </Col>
                        <Col>
                          <Form.Control
                            type="number"
                            min={1}
                            placeholder="Height"
                            value={heightCm}
                            onChange={(e) =>
                              setHeightCm(e.target.value === "" ? "" : Number(e.target.value))
                            }
                          />
                        </Col>
                      </Row>
                      <div className="small text-muted mt-1">
                        Add dimensions for bulky items so volumetric weight can be calculated.
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
              <strong>Note:</strong> These are <strong>non-binding estimates</strong>.
              Final rates may change after package inspection, packing updates,
              remote-area surcharges, duties, or restricted-item review.
            </Alert>
          </Col>

          <Col lg={5}>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <h5 className="fw-semibold mb-3">Estimated price</h5>

                {!estimate && submitted && (
                  <div className="text-muted small">
                    Please enter a valid weight and destination to see an estimate.
                  </div>
                )}

                {estimate && (
                  <>
                    <div className="display-6 fw-bold mb-2">
                      {estimate.currency} {estimate.total.toFixed(2)}
                    </div>

                    <div className="text-muted small mb-3">
                      Based on <strong>{estimate.chargeableWeight} kg</strong> chargeable
                      weight using {speed === "express" ? "Express" : "Standard"} service.
                    </div>

                    <div className="small mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">Actual weight</span>
                        <strong>{estimate.actualWeightKg} kg</strong>
                      </div>

                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">Volumetric weight</span>
                        <strong>
                          {estimate.volumetricKg != null ? `${estimate.volumetricKg} kg` : "—"}
                        </strong>
                      </div>

                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">Chargeable weight</span>
                        <strong>{estimate.chargeableWeight} kg</strong>
                      </div>

                      <hr />

                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">Base fee</span>
                        <strong>{estimate.currency} {estimate.base.toFixed(2)}</strong>
                      </div>

                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">Per kg rate</span>
                        <strong>{estimate.currency} {estimate.perKg.toFixed(2)}</strong>
                      </div>

                      {speed === "express" && (
                        <div className="d-flex justify-content-between mb-1">
                          <span className="text-muted">Express multiplier</span>
                          <strong>× {estimate.speedMultiplier}</strong>
                        </div>
                      )}
                    </div>

                    <Button variant="outline-primary" size="sm" href="/signup">
                      Create account & ship
                    </Button>
                  </>
                )}
              </Card.Body>
            </Card>

            <Card className="mt-3 border-0 shadow-sm">
              <Card.Body>
                <h6 className="fw-semibold mb-2">Business / bulk shipping?</h6>
                <p className="small text-muted mb-2">
                  For cartons, pallets, or regular business shipping, we can offer
                  better contract pricing.
                </p>
                <Button href="/contact" variant="outline-secondary" size="sm">
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