// pages/admin/waitlist.tsx
import React from "react";
import type { GetServerSideProps } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { dbConnect } from "@/lib/mongoose";
import { WaitlistEntry } from "@/lib/models/WaitlistEntry";

type Entry = {
  _id: string;
  email: string;
  country: string;
  volume: "personal" | "reseller";
  createdAt: string;
};

type Props = {
  entries: Entry[];
};

const pageShell: React.CSSProperties = {
  background: "#f5f7fb",
  minHeight: "100vh",
  fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
};

const mainStyle: React.CSSProperties = {
  maxWidth: 1100,
  margin: "30px auto",
  padding: "0 20px 40px",
};

const tableWrapper: React.CSSProperties = {
  marginTop: 18,
  borderRadius: 16,
  background: "#ffffff",
  boxShadow: "0 12px 32px rgba(15,23,42,0.08)",
  overflow: "hidden",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 13,
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  background: "#f1f5f9",
  borderBottom: "1px solid #e5e7eb",
  fontWeight: 600,
  color: "#0f172a",
};

const tdStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderBottom: "1px solid #e5e7eb",
  color: "#374151",
};

const badge: React.CSSProperties = {
  display: "inline-block",
  padding: "3px 8px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 600,
};

export default function AdminWaitlistPage({ entries }: Props) {
  return (
    <div style={pageShell}>
      <SiteHeader />

      <main style={mainStyle}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>
          Waitlist entries
        </h1>
        <p style={{ fontSize: 14, color: "#6b7280" }}>
          All emails collected from the “Ready to try Cross Border Cart?” form on the
          homepage.
        </p>

        <div style={tableWrapper}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Country / city</th>
                <th style={thStyle}>Usage</th>
                <th style={thStyle}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 && (
                <tr>
                  <td style={{ ...tdStyle, padding: "14px 12px" }} colSpan={4}>
                    No entries yet. Share your homepage and collect your first sign-ups 🚀
                  </td>
                </tr>
              )}

              {entries.map((e) => (
                <tr key={e._id}>
                  <td style={tdStyle}>{e.email}</td>
                  <td style={tdStyle}>{e.country}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        ...badge,
                        background: e.volume === "reseller" ? "#fef3c7" : "#d1fae5",
                        color: e.volume === "reseller" ? "#92400e" : "#065f46",
                      }}
                    >
                      {e.volume === "reseller" ? "Reseller" : "Personal"}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    {new Date(e.createdAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

// ---------- Server side data ----------
export const getServerSideProps: GetServerSideProps<Props> = async () => {
  await dbConnect();

  const entries = await WaitlistEntry.find({})
    .sort({ createdAt: -1 })
    .lean()
    .exec();

  return {
    props: {
      entries: entries.map((e: any) => ({
        _id: e._id.toString(),
        email: e.email,
        country: e.country,
        volume: e.volume,
        createdAt: e.createdAt ? e.createdAt.toISOString() : new Date().toISOString(),
      })),
    },
  };
};
