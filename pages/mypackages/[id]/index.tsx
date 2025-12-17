// pages/mypackages/[id]/index.tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function PackageView() {
  const router = useRouter();
  const { id } = router.query;
  const [pkg, setPkg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const res = await fetch(`/api/packages/${id}`);
        const data = await res.json();

        if (!res.ok || data.error) {
          setError(data.error || "Failed to load package");
        } else {
          setPkg(data.package);
        }
      } catch (e) {
        setError("Failed to load package");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!pkg) return <div>No package found.</div>;

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Package Details</h1>
      <ul className="space-y-1 text-sm">
        <li><b>Title:</b> {pkg.title}</li>
        <li><b>Tracking:</b> {pkg.tracking || "—"}</li>
        <li><b>Courier:</b> {pkg.courier || "—"}</li>
        <li><b>Status:</b> {pkg.status}</li>
        <li><b>Value:</b> {pkg.value ?? 0} AED</li>
        <li><b>Suite ID:</b> {pkg.suiteId || "—"}</li>
        <li><b>User Email:</b> {pkg.userEmail || "—"}</li>
        <li><b>Last Location:</b> {pkg.lastLocation || "—"}</li>
        <li><b>Last Note:</b> {pkg.lastNote || "—"}</li>
        <li><b>Created At:</b> {pkg.createdAt ? new Date(pkg.createdAt).toLocaleString() : "—"}</li>
        <li><b>Updated At:</b> {pkg.updatedAt ? new Date(pkg.updatedAt).toLocaleString() : "—"}</li>
      </ul>

      <button
        className="mt-4 border rounded px-4 py-2"
        onClick={() => router.back()}
      >
        Back
      </button>
    </div>
  );
}
