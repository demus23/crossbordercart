// components/ReviewsSection.tsx
import { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";

type PublicReview = {
  _id: string;
  rating: number;
  comment?: string;
  customerName?: string;
  createdAt?: string;
};

const ReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const res = await fetch("/api/reviews?publicOnly=true");
        if (!res.ok) return;
        const data = await res.json();
        setReviews(data || []);
      } catch (error) {
        console.error("Error loading reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  if (!loading && reviews.length === 0) {
    return null; // don’t show section if no reviews yet
  }

  return (
    <section className="py-5 bg-light">
      <Container>
        <Row className="mb-4 text-center">
          <Col>
            <h2 className="fw-bold">What our customers say</h2>
            <p className="text-muted mb-0">
              Real reviews from real cross-border shipments across the globe.
            </p>
          </Col>
        </Row>

        {loading ? (
          <div className="text-center">Loading reviews…</div>
        ) : (
          <Row>
            {reviews.map((review) => (
              <Col key={review._id} md={4} className="mb-4">
                <Card className="h-100 shadow-sm border-0">
                  <Card.Body>
                    <div className="mb-2">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <span
                          key={idx}
                          style={{ fontSize: "1.1rem", marginRight: 2 }}
                        >
                          {idx < review.rating ? "★" : "☆"}
                        </span>
                      ))}
                    </div>
                    {review.comment && (
                      <p className="mb-3">{review.comment}</p>
                    )}
                    <div className="small text-muted">
                      {review.customerName || "Verified customer"}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </section>
  );
};

export default ReviewsSection;
