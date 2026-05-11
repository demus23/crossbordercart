// pages/mypackages.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Box, Typography, Paper, Chip, Stack, Button } from "@mui/material";

type ServerPackage = {
  _id?: string;
  id?: string;
  suiteId?: string;
  tracking?: string;
  courier?: string;
  value?: number;
  status?: string;
  createdAt?: string | Date;
  forwardRequested?: boolean;
};

type AccountPackagesResp =
  | { ok: true; packages: ServerPackage[] }
  | { ok: false; error: string };

type DisplayPkg = {
  _id: string;
  suiteId: string;
  tracking: string;
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

  // Map backend statuses → UI statuses
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
        return "info";
    }
  };

  const normalize = (p: ServerPackage): DisplayPkg => {
    const id = String(p._id || p.id || "");

    return {
      _id: id,
      suiteId: String(p.suiteId ?? ""),
      tracking: String(p.tracking || id || ""),
      courier: String(p.courier || ""),
      value: Number(p.value ?? 0),
      rawStatus: String(p.status || "pending"),
      displayStatus: toDisplayStatus(p.status),
      createdAt: p.createdAt
        ? new Date(p.createdAt).toISOString()
        : new Date().toISOString(),
      forwardRequested: !!p.forwardRequested,
    };
  };

  // ✅ FIXED forwarding condition
  const canRequestForwarding = (pkg: DisplayPkg) => {
    const s = pkg.rawStatus.toLowerCase().trim();
    return (
      !pkg.forwardRequested &&
      (s === "received" || s === "processing")
    );
  };

  async function load() {
    try {
      setLoading(true);

      const r = await fetch("/api/account/packages");
      if (r.ok) {
        const j: AccountPackagesResp = await r.json();
        if ((j as any)?.ok) {
          const list = (j as any).packages as ServerPackage[];
          setPackages(list.map(normalize));
          return;
        }
      }

      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        router.push("/login");
        return;
      }

      const r2 = await fetch("/api/mypackages", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (r2.ok) {
        const arr = (await r2.json()) as ServerPackage[];
        setPackages((arr || []).map(normalize));
        return;
      }

      setPackages([]);
    } catch {
      setPackages([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const trackingCodeFor = (pkg: DisplayPkg) =>
    pkg.tracking || pkg._id;

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
            <Paper key={pkg._id} sx={{ p: 3, borderRadius: 4, boxShadow: 2 }}>
              
              <Stack direction="row" spacing={2} alignItems="center" mb={1} flexWrap="wrap">
                {pkg.suiteId && (
                  <Chip label={pkg.suiteId} color="primary" variant="outlined" />
                )}
                <Typography fontWeight={700}>{pkg.tracking}</Typography>
                <Chip label={pkg.displayStatus} color={chipColor(pkg.displayStatus) as any} />
              </Stack>

              {pkg.courier && (
                <Typography>
                  Courier: <b>{pkg.courier}</b>
                </Typography>
              )}

              <Typography>
                Value: {Number.isFinite(pkg.value) ? pkg.value.toFixed(2) : "0.00"} AED
              </Typography>

              <Typography fontSize={13} color="gray">
                Created: {new Date(pkg.createdAt).toLocaleString()}
              </Typography>

              {/* ✅ FIXED BUTTON */}
              {canRequestForwarding(pkg) && (
                <Button
                  sx={{ mt: 2 }}
                  variant="contained"
                  onClick={async () => {
                    try {
                      const token =
                        typeof window !== "undefined"
                          ? localStorage.getItem("token")
                          : null;

                      console.log("Request forwarding package id:", pkg._id);

                      const res = await fetch("/api/mypackages/forward", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                        body: JSON.stringify({ packageId: pkg._id }),
                      });

                      const data = await res.json().catch(() => ({}));

                      if (!res.ok) {
                        alert(data?.error || "Failed to request forwarding");
                        return;
                      }

                      setPackages((pkgs) =>
                        pkgs.map((p) =>
                          p._id === pkg._id
                            ? { ...p, forwardRequested: true }
                            : p
                        )
                      );

                      alert("Forwarding request sent ✅");
                    } catch (e: any) {
                      alert(e?.message || "Failed to request forwarding");
                    }
                  }}
                >
                  Request Forwarding
                </Button>
              )}

              {pkg.forwardRequested && (
                <Chip label="Forwarding Requested" color="info" sx={{ mt: 2 }} />
              )}

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
                    router.push(`/track/${encodeURIComponent(trackingCodeFor(pkg))}`)
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