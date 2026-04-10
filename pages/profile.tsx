// pages/profile.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
  });
  const [msg, setMsg] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/me")
      .then(async (res) => {
        if (res.status === 401) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;

        setUser(data);
        setForm({
          line1: data?.address?.line1 || "",
          line2: data?.address?.line2 || "",
          city: data?.address?.city || "",
          state: data?.address?.state || "",
          postalCode: data?.address?.postalCode || "",
          country: data?.address?.country || "",
          phone: data?.address?.phone || data?.phone || "",
        });
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setMsg("Failed to load profile");
      });
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");

    const res = await fetch("/api/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: form }),
    });

    if (res.ok) {
      const updated = await res.json();
      setUser(updated);
      setMsg("Profile updated!");
    } else {
      const data = await res.json().catch(() => null);
      setMsg(data?.error || "Update failed");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: 24, maxWidth: 500 }}>
      <h2>My Profile</h2>
      <div><b>Email:</b> {user?.email}</div>
      <div><b>Suite #:</b> {user?.suite}</div>
      <hr />
      <h3>Home Delivery Address</h3>
      <form onSubmit={handleSave}>
        <input name="line1" placeholder="Address Line 1" value={form.line1} onChange={handleChange} required style={{ width: "100%", marginBottom: 8 }} /><br />
        <input name="line2" placeholder="Address Line 2" value={form.line2} onChange={handleChange} style={{ width: "100%", marginBottom: 8 }} /><br />
        <input name="city" placeholder="City" value={form.city} onChange={handleChange} required style={{ width: "100%", marginBottom: 8 }} /><br />
        <input name="state" placeholder="State" value={form.state} onChange={handleChange} style={{ width: "100%", marginBottom: 8 }} /><br />
        <input name="postalCode" placeholder="Postal Code" value={form.postalCode} onChange={handleChange} style={{ width: "100%", marginBottom: 8 }} /><br />
        <input name="country" placeholder="Country" value={form.country} onChange={handleChange} required style={{ width: "100%", marginBottom: 8 }} /><br />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} style={{ width: "100%", marginBottom: 8 }} /><br />
        <button type="submit">Save</button>
      </form>
      <div style={{ color: "green" }}>{msg}</div>
    </div>
  );
}