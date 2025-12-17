import type { NextPage } from "next";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";

type Tip = {
  id: number;
  title: string;
  category: string;
  readingTime: string;
  level: "Beginner" | "Intermediate" | "Pro";
  summary: string;
};

const tips: Tip[] = [
  {
    id: 1,
    title: "How to calculate your shipment weight correctly",
    category: "Basics",
    readingTime: "4 min read",
    level: "Beginner",
    summary:
      "Understand the difference between actual weight and volumetric weight so you never get surprised by shipping costs.",
  },
  {
    id: 2,
    title: "Best way to pack fragile items (electronics, glass, etc.)",
    category: "Packing",
    readingTime: "5 min read",
    level: "Intermediate",
    summary:
      "Step-by-step guide to protect laptops, phones, perfumes and glass bottles during cross-border shipping.",
  },
  {
    id: 3,
    title: "Save money with shipment consolidation",
    category: "Money saving",
    readingTime: "3 min read",
    level: "Pro",
    summary:
      "Learn when it’s cheaper to ship multiple packages together and when to send them separately.",
  },
  {
    id: 4,
    title: "What you can and cannot ship internationally",
    category: "Compliance",
    readingTime: "6 min read",
    level: "Beginner",
    summary:
      "Common restricted items, documents you may need and how CrossBorderCart helps you stay compliant.",
  },
  {
    id: 5,
    title: "Tracking your shipment like a pro",
    category: "Tracking",
    readingTime: "3 min read",
    level: "Beginner",
    summary:
      "Understand each tracking status so you know exactly where your package is and what happens next.",
  },
];

const levelVariant: Record<Tip["level"], string> = {
  Beginner: "success",
  Intermediate: "warning",
  Pro: "danger",
};

const TipsPage: NextPage = () => {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="py-5 bg-light border-bottom">
        <Container>
          <Row className="align-items-center">
            <Col md={7}>
              <h1 className="fw-bold mb-3">
                Shipping tips &amp; guides for smarter deliveries
              </h1>
              <p className="lead text-muted mb-3">
                Learn how to pack, ship and track your items like a pro. Short,
                practical guides based on real CrossBorderCart shipments.
              </p>
              <p className="mb-0 text-muted small">
                New to cross-border shipping? Start with the{" "}
                <strong>Beginner</strong> guides below.
              </p>
            </Col>
            <Col md={5} className="mt-4 mt-md-0">
              <div className="p-4 bg-white rounded-4 shadow-sm">
                <h5 className="fw-semibold mb-3">Why these tips matter</h5>
                <ul className="mb-0 small text-muted">
                  <li className="mb-1">
                    Avoid surprise charges by understanding volumetric weight
                  </li>
                  <li className="mb-1">
                    Reduce damage risk with better packing techniques
                  </li>
                  <li className="mb-1">
                    Speed up customs clearance with the right documentation
                  </li>
                  <li>Get the most value from your CrossBorderCart account</li>
                </ul>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Tips list */}
      <Container className="py-5">
        <Row className="mb-4">
          <Col>
            <h2 className="fw-semibold mb-1">Featured guides</h2>
            <p className="text-muted mb-0">
              Short, simple articles you and your users can follow before
              creating a shipment.
            </p>
          </Col>
        </Row>

        <Row>
          {tips.map((tip) => (
            <Col key={tip.id} md={6} lg={4} className="mb-4">
              <Card className="h-100 shadow-sm border-0">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Badge bg="secondary" className="text-uppercase small">
                      {tip.category}
                    </Badge>
                    <span className="small text-muted">
                      {tip.readingTime}
                    </span>
                  </div>

                  <Card.Title className="fw-semibold mb-2">
                    {tip.title}
                  </Card.Title>

                  <Card.Text className="text-muted small flex-grow-1">
                    {tip.summary}
                  </Card.Text>

                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <Badge bg={levelVariant[tip.level]}>{tip.level}</Badge>
                    <span className="small text-primary">Coming soon</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <Row className="mt-4">
          <Col className="text-center">
            <p className="text-muted small mb-1">
              Soon you’ll be able to open each guide and read the full article.
            </p>
            <p className="text-muted small mb-0">
              Want us to write a specific guide? Add a note in the contact form
              and we’ll include it here.
            </p>
          </Col>
        </Row>
      </Container>
    </MarketingLayout>
  );
};

export default TipsPage;
