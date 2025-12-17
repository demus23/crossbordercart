// pages/api/track/[trackingNo].ts
import type { NextApiRequest, NextApiResponse } from "next";
import handler from ".."; // re-use main handler

export default function bySlug(req: NextApiRequest, res: NextApiResponse) {
  // /api/track/ABC123 -> /api/track?trackingNo=ABC123
  const trackingNo = Array.isArray(req.query.trackingNo)
    ? req.query.trackingNo[0]
    : (req.query.trackingNo as string | undefined) ||
      (req.query.tracking as string | undefined) ||
      (req.query.slug as string | undefined) ||
      "";

  // put on query as BOTH keys
  req.query = { ...req.query, trackingNo, tracking: trackingNo };

  return handler(req, res);
}
