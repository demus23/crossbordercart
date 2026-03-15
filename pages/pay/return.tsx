import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export default function PayReturnPage() {
  const router = useRouter();
  const { data, status } = useSession();

  useEffect(() => {
    if (!router.isReady) return;

    const inv = typeof router.query.inv === "string" ? router.query.inv : "";
    const paid = router.query.paid ? "1" : "0";
    const canceled = router.query.canceled ? "1" : "0";
    const sessionId = typeof router.query.session_id === "string" ? router.query.session_id : "";

    // If not logged in, send to signin then come back here
    if (status === "unauthenticated") {
      router.replace(`/auth/signin?callbackUrl=${encodeURIComponent(router.asPath)}`);
      return;
    }
    if (status !== "authenticated") return;

    const role = (data?.user as any)?.role;

    // Admin goes to admin screen, normal users go to invoices
    if (role === "admin" || role === "superadmin") {
      router.replace(`/admin/charges?paid=${paid}&canceled=${canceled}&inv=${encodeURIComponent(inv)}&session_id=${encodeURIComponent(sessionId)}`);
    } else {
      router.replace(`/invoices?paid=${paid}&canceled=${canceled}&inv=${encodeURIComponent(inv)}&session_id=${encodeURIComponent(sessionId)}`);
    }
  }, [router.isReady, status, data?.user]);

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", padding: 16 }}>
      <h2>Processing payment…</h2>
      <p>Please wait. Redirecting you now.</p>
    </div>
  );
}