// components/TrackingTimeline.tsx
import React from "react";
import { Badge } from "react-bootstrap";

export type TrackingEvent = {
  _id?: string;
  packageId?: string;
  trackingNo?: string;
  status: string;
  location?: string | null;
  note?: string | null;      // admin notes OR API "message"
  message?: string | null;   // API field alias
  createdAt?: string | Date | null;
  time?: string | Date | null; // API field alias
  actorName?: string;
};

function fmtStatus(raw: string) {
  const s = (raw || "").toString();
  return s
    .replace(/_/g, " ")
    .replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());
}

function badgeFor(
  status: string
): "success" | "warning" | "danger" | "info" | "secondary" {
  const s = (status || "").toLowerCase();
  if (s.includes("deliver")) return "success";
  if (s.includes("pend")) return "warning";
  if (s.includes("problem") || s.includes("cancel")) return "danger";
  if (s.includes("transit") || s.includes("ship") || s.includes("out_for"))
    return "info";
  return "secondary";
}

type Props = {
  events: TrackingEvent[];
  compact?: boolean;
};

export default function TrackingTimeline({ events, compact = false }: Props) {
  const sorted = [...(events || [])].sort((a, b) => {
    const ta = new Date((a.time ?? a.createdAt) as any).getTime();
    const tb = new Date((b.time ?? b.createdAt) as any).getTime();
    return tb - ta; // newest first
  });

  if (!sorted.length) {
    return <div className="text-muted">No tracking events yet.</div>;
  }

  return (
    <ul className="list-group list-group-flush">
      {sorted.map((ev) => {
        const ts = ev.time ?? ev.createdAt ?? new Date();
        const key = ev._id || String(ts) + ev.status;

        const note = ev.note ?? ev.message ?? "";

        return (
          <li key={key} className="list-group-item">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <Badge bg={badgeFor(ev.status)} className="me-2">
                  {fmtStatus(ev.status)}
                </Badge>
                {ev.location && (
                  <span className="text-muted"> @ {ev.location}</span>
                )}
                {ev.actorName && (
                  <span className="text-muted"> · by {ev.actorName}</span>
                )}
                {note && (
                  <div className="mt-1">
                    <small className="text-body">{note}</small>
                  </div>
                )}
              </div>
              {!compact && (
                <small className="text-muted">
                  {new Date(ts as any).toLocaleString()}
                </small>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
