// pages/mypackages.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Box, Typography, Paper, Chip, Stack, Button } from "@mui/material";

type ServerPackage = {
  _id: string;
  suiteId?: string;
  tracking?: string; // may be missing on some rows
  courier?: string;
  value?: number;
  status?: string; // backend can send many values (out_for_delivery, in_transit, etc.)
  createdAt?: string | Date;
  forwardRequested?: boolean;
};

type AccountPackagesResp =
  | { ok: true; packages: ServerPackage[] }
  | { ok: false; error: string };

type DisplayPkg = {
  _id: string;
  suiteId: string;
  tracking: string; // what we show / use for public tracking
  courier: string;
  value: number;
  rawStatus: string;
  displayStatus: "Pending" | "In Transit" | "Delivered" | "Problem";
  createdAt: string;
  forwardRequested?: boolean;
};

export default function MyPackagesPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<DisplayPkg[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ map ALL backend statuses -> 4 UI labels
  const toDisplayStatus = (s?: string): DisplayPkg["displayStatus"] => {
    const k = String(s || "").toLowerCase();

    if (k.includes("deliver")) return "Delivered";
    if (
      k.includes("transit") ||
      k.includes("shipped") ||
      k.includes("picked") ||
      k.includes("out_for") ||
      k.includes("warehouse") ||
      k.includes("received") ||
      k.includes("consolidated") ||
      k.includes("customs") ||
      k.includes("forward")
    ) {
      return "In Transit";
    }
    if (k.includes("hold") || k.includes("problem") || k.includes("cancel")) {
      return "Problem";
    }
    return "Pending";
  };

  const chipColor = (status: DisplayPkg["displayStatus"]) => {
    switch (status) {
      case "Delivered":
        return "success";
      case "Pending":
        return "warning";
      case "Problem":
        return "error";
      default:
        return "info"; // In Transit
    }
  };

  const normalize = (p: ServerPackage): DisplayPkg => ({
    _id: String(p._id),
    suiteId: String(p.suiteId ?? ""),
    tracking: String(p.tracking || p._id || ""), // ✅ fallback to _id if no tracking field
    courier: String(p.courier || ""),
    value: Number(p.value ?? 0),
    rawStatus: String(p.status || "pending"),
    displayStatus: toDisplayStatus(p.status),
    createdAt: p.createdAt
      ? new Date(p.createdAt).toISOString()
      : new Date().toISOString(),
    forwardRequested: !!p.forwardRequested,
  });

  async function load() {
    try {
      setLoading(true);

      // 1) Preferred: NextAuth session route
      const r = await fetch("/api/account/packages");
      if (r.ok) {
        const j: AccountPackagesResp = await r.json();
        if ((j as any)?.ok) {
          const list = (j as any).packages as ServerPackage[];
          setPackages(list.map(normalize));
          return;
        }
      } else if (r.status === 401) {
        // fall through to legacy if unauthenticated via NextAuth
      }

      // 2) Legacy fallback: token route
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        // not logged in either way; push to login
        router.push("/login");
        return;
      }
      const r2 = await fetch("/api/mypackages", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r2.ok) {
        const arr = (await r2.json()) as ServerPackage[]; // legacy returns array
        setPackages((arr || []).map(normalize));
        return;
      }

      // if both fail:
      setPackages([]);
    } catch {
      setPackages([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trackingCodeFor = (pkg: DisplayPkg) =>
    pkg.tracking || pkg._id; // ✅ helper for links

  if (loading) {
    return (
      <Box mt={7}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box maxWidth={700} mx="auto" mt={7} p={2}>
      <Typography variant="h4" fontWeight={800} mb={3}>
        📦 My Packages
      </Typography>

      {packages.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center", color: "gray" }}>
          No packages found.
        </Paper>
      ) : (
        <Stack spacing={3}>
          {packages.map((pkg) => (
            <Paper
              key={pkg._id}
              sx={{ p: 3, borderRadius: 4, boxShadow: 2 }}
            >
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                mb={1}
                flexWrap="wrap"
              >
                {pkg.suiteId && (
                  <Chip
                    label={pkg.suiteId}
                    color="primary"
                    variant="outlined"
                  />
                )}
                <Typography fontWeight={700}>{pkg.tracking}</Typography>
                <Chip
                  label={pkg.displayStatus}
                  color={chipColor(pkg.displayStatus) as any}
                />
              </Stack>

              {pkg.courier && (
                <Typography>
                  Courier: <b>{pkg.courier}</b>
                </Typography>
              )}

              <Typography>
                Value:{" "}
                {Number.isFinite(pkg.value)
                  ? pkg.value.toFixed(2)
                  : "0.00"}{" "}
                AED
              </Typography>

              <Typography fontSize={13} color="gray">
                Created: {new Date(pkg.createdAt).toLocaleString()}
              </Typography>

              {/* Show forwarding button when "In Transit" (i.e., backend status not yet delivered) */}
              {pkg.displayStatus === "In Transit" && !pkg.forwardRequested && (
                <Button
                  sx={{ mt: 2 }}
                  variant="contained"
                  onClick={async () => {
                    try {
                      const token =
                        typeof window !== "undefined"
                          ? localStorage.getItem("token")
                          : null;
                      const res = await fetch("/api/mypackages/forward", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                        body: JSON.stringify({ packageId: pkg._id }),
                      });
                      if (res.ok) {
                        setPackages((pkgs) =>
                          pkgs.map((p) =>
                            p._id === pkg._id
                              ? { ...p, forwardRequested: true }
                              : p
                          )
                        );
                      }
                    } catch {
                      // ignore
                    }
                  }}
                >
                  Request Forwarding
                </Button>
              )}

              {pkg.forwardRequested && (
                <Chip label="Forwarding Requested" color="info" sx={{ mt: 2 }} />
              )}

              {/* ✅ Actions row: View details + Track */}
              <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap">
                <Button
                  variant="outlined"
                  onClick={() => router.push(`/mypackages/${pkg._id}`)}
                >
                  View details
                </Button>
                <Button
                  variant="outlined"
                  onClick={() =>
                    router.push(
                      `/track/${encodeURIComponent(trackingCodeFor(pkg))}`
                    )
                  }
                >
                  Track
                </Button>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}
