import { useEffect, useState } from "react";

type Rate = {
  _id: string;
  country: string;
  countryCode: string;
  pricePerKg: number;
  fuelPercent: number;
  profitPercent: number;
  stripePercent: number;
  active: boolean;
};

export default function AdminPricingPage() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [form, setForm] = useState({
    country: "",
    countryCode: "",
    pricePerKg: 0,
    fuelPercent: 10,
    profitPercent: 20,
    stripePercent: 3,
    active: true,
  });

  async function loadRates() {
    const res = await fetch("/api/admin/rates");
    const data = await res.json();
    setRates(data.rates || []);
  }

  useEffect(() => {
    loadRates();
  }, []);

  async function saveRate(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/admin/rates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      alert(data.error || "Failed to save rate");
      return;
    }

    alert("Rate saved ✅");
    setForm({
      country: "",
      countryCode: "",
      pricePerKg: 0,
      fuelPercent: 10,
      profitPercent: 20,
      stripePercent: 3,
      active: true,
    });
    loadRates();
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem" }}>
      <h1>Shipping Pricing</h1>
      <p style={{ color: "#666" }}>
        Set country rates, fuel surcharge, Stripe fee and profit margin.
      </p>

      <form
        onSubmit={saveRate}
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          border: "1px solid #ddd",
          padding: 16,
          borderRadius: 12,
          marginBottom: 24,
        }}
      >
        <input
          placeholder="Country e.g. Kenya"
          value={form.country}
          onChange={(e) => setForm({ ...form, country: e.target.value })}
        />

        <input
          placeholder="Country Code e.g. KE"
          value={form.countryCode}
          onChange={(e) =>
            setForm({ ...form, countryCode: e.target.value.toUpperCase() })
          }
        />

        <input
          type="number"
          placeholder="Price per kg"
          value={form.pricePerKg || ""}
          onChange={(e) =>
            setForm({ ...form, pricePerKg: Number(e.target.value || 0) })
          }
        />

        <input
          type="number"
          placeholder="Fuel %"
          value={form.fuelPercent || ""}
          onChange={(e) =>
            setForm({ ...form, fuelPercent: Number(e.target.value || 0) })
          }
        />

        <input
          type="number"
          placeholder="Profit %"
          value={form.profitPercent || ""}
          onChange={(e) =>
            setForm({ ...form, profitPercent: Number(e.target.value || 0) })
          }
        />

        <input
          type="number"
          placeholder="Stripe %"
          value={form.stripePercent || ""}
          onChange={(e) =>
            setForm({ ...form, stripePercent: Number(e.target.value || 0) })
          }
        />

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />
          Active
        </label>

        <button type="submit">Save Rate</button>
      </form>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Country</th>
            <th>Code</th>
            <th>Price/kg</th>
            <th>Fuel</th>
            <th>Profit</th>
            <th>Stripe</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rates.map((r) => (
            <tr key={r._id}>
              <td>{r.country}</td>
              <td>{r.countryCode}</td>
              <td>{r.pricePerKg} AED</td>
              <td>{r.fuelPercent}%</td>
              <td>{r.profitPercent}%</td>
              <td>{r.stripePercent}%</td>
              <td>{r.active ? "Active" : "Inactive"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}