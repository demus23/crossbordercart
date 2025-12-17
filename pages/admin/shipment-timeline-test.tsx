// pages/admin/shipment-timeline-test.tsx
import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
} from "react-bootstrap";
import ShipmentTimeline, {
  ShipmentEvent,
} from "@/components/ShipmentTimeline";

const ShipmentTimelineTestPage: NextPage = () => {
  const router = useRouter();

  const [shipmentId, setShipmentId] = useState("");
  const [events, setEvents] = useState<ShipmentEvent[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form for adding an event
  const [status, setStatus] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  // shared loader so we can call it from form + useEffect
  const loadEvents = async (id: string) => {
    if (!id.trim()) {
      setError("Please enter a shipment _id from /api/admin/shipments/debug");
      setEvents(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/admin/shipments/${encodeURIComponent(id.trim())}/events`
      );
      const json = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Failed to load events");
      }

      setEvents(json.events || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
      setEvents(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = async (e: React.FormEvent) => {
    e.preventDefault();
    await loadEvents(shipmentId);
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shipmentId.trim()) {
      setError("Load a shipment first (enter Shipment ID above).");
      return;
    }
    if (!status.trim()) {
      setError("Status is required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/admin/shipments/${encodeURIComponent(
          shipmentId.trim()
        )}/events`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: status.trim(),
            description: description.trim(),
            location: location.trim(),
          }),
        }
      );

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Failed to add event");
      }

      const newEvent: ShipmentEvent = json.event;
      setEvents((prev) => (prev ? [newEvent, ...prev] : [newEvent]));

      setStatus("");
      setDescription("");
      setLocation("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong while adding event");
    } finally {
      setLoading(false);
    }
  };

  // 🔗 Auto-load when coming from /admin/shipments with ?id=...
  useEffect(() => {
    if (!router.isReady) return;

    const qId = router.query.id;
    if (typeof qId === "string" && qId.trim()) {
      setShipmentId(qId);
      loadEvents(qId);
    }
  }, [router.isReady, router.query.id]);

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title className="mb-3">
                Shipment Timeline – Test Page
              </Card.Title>
              <Card.Text className="text-muted small mb-3">
                Paste a <code>_id</code> of a shipment from{" "}
                <code>/api/admin/shipments/debug</code> or open this page from
                the Admin Shipments table.
              </Card.Text>

              <Form onSubmit={handleLoad}>
                <Form.Group className="mb-3">
                  <Form.Label>Shipment ID</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. 69303a771443fa6b32d41dda"
                    value={shipmentId}
                    onChange={(e) => setShipmentId(e.target.value)}
                  />
                </Form.Group>
                <div className="d-flex justify-content-end">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Loading..." : "Load timeline"}
                  </Button>
                </div>
              </Form>

              {error && (
                <Alert variant="danger" className="mt-3">
                  {error}
                </Alert>
              )}
            </Card.Body>
          </Card>

          {/* Add tracking event form */}
          <Card className="mb-3">
            <Card.Body>
              <Card.Title className="mb-3">Add tracking update</Card.Title>
              <Form onSubmit={handleAddEvent}>
                <Form.Group className="mb-3">
                  <Form.Label>Status *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. In transit to London"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Optional detailed message for the customer"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. Dubai, UAE"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </Form.Group>
                <div className="d-flex justify-content-end">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Add update"}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          {events && (
            <Card>
              <Card.Body>
                <ShipmentTimeline events={events} />
              </Card.Body>
            </Card>
          )}

          {!events && !error && (
            <Card>
              <Card.Body className="text-muted small">
                No shipment loaded yet. Enter an ID above or open this page from
                the Admin Shipments table.
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ShipmentTimelineTestPage;
