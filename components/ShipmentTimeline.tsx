// components/ShipmentTimeline.tsx
import { Card } from "react-bootstrap";

export type ShipmentEvent = {
  _id?: string;
  status: string;
  description?: string;
  location?: string;
  createdAt: string | Date;
};

type Props = {
  events?: ShipmentEvent[];
};

export default function ShipmentTimeline({ events }: Props) {
  if (!events || events.length === 0) {
    return (
      <Card className="mt-3">
        <Card.Body className="text-muted small">
          No detailed tracking events yet. Please check again later.
        </Card.Body>
      </Card>
    );
  }

  const sorted = [...events].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <Card className="mt-3">
      <Card.Body>
        <h5 className="fw-semibold mb-3">Tracking timeline</h5>
        <ul className="list-unstyled mb-0">
          {sorted.map((ev, index) => {
            const date = new Date(ev.createdAt);
            const isLast = index === sorted.length - 1;

            return (
              <li key={ev._id || index} className="d-flex mb-3">
                {/* Left vertical line + dot */}
                <div className="me-3 d-flex flex-column align-items-center">
                  <div
                    className={
                      "rounded-circle border " +
                      (isLast ? "bg-primary border-primary" : "bg-white")
                    }
                    style={{ width: 10, height: 10, marginTop: 4 }}
                  />
                  {!isLast && (
                    <div
                      style={{
                        width: 2,
                        flexGrow: 1,
                        backgroundColor: "#e5e7eb",
                      }}
                    />
                  )}
                </div>

                {/* Right side: text */}
                <div>
                  <div className="fw-semibold">{ev.status}</div>
                  {ev.description && (
                    <div className="small text-muted">{ev.description}</div>
                  )}
                  <div className="small text-muted">
                    {ev.location && <span>{ev.location} · </span>}
                    {date.toLocaleString()}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Card.Body>
    </Card>
  );
}
