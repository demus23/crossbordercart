// components/AdminLayout.tsx
import { ReactNode, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";

type SidebarLink = { label: string; href: string; icon?: string };
type Props = { children: ReactNode; sidebarLinks?: SidebarLink[]; title?: string };

const BRAND = {
  name: "Cross Border Cart",
  mark: "/admin-mark.svg",
};

const SIDEBAR_GROUPS = [
  {
    label: "Dashboard",
    items: [
      { label: "Admin Dashboard", icon: "bi-speedometer2", href: "/admin" },
      { label: "Dashboard Home", icon: "bi-grid", href: "/dashboard" },
      // ✅ this is what you are missing (your screenshot uses /dashboard/shipments)
      { label: "Shipments (Admin Only)", icon: "bi-send", href: "/dashboard/shipments" },
      { label: "Packages", icon: "bi-box-seam", href: "/dashboard/packages" },
    ],
  },
  {
    label: "Admin Management",
    items: [
      { label: "Users", icon: "bi-people", href: "/admin/users" },
      { label: "Admin Shipments", icon: "bi-truck", href: "/admin/shipments" },
      { label: "Drivers", icon: "bi-truck-front", href: "/admin/drivers" },
      { label: "Stores", icon: "bi-shop", href: "/admin/stores" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { label: "Activity", icon: "bi-activity", href: "/admin/activity" },
      { label: "Reports", icon: "bi-graph-up", href: "/admin/reports" },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Charges", icon: "bi-receipt", href: "/admin/charges" },
      { label: "Transactions", icon: "bi-credit-card", href: "/admin/transactions" },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Shipping Settings", icon: "bi-sliders", href: "/admin/settings/shipping" },
      { label: "Settings", icon: "bi-gear", href: "/admin/settings" },
      { label: "Support", icon: "bi-chat-dots", href: "/admin/support" },
    ],
  },
];

export default function AdminLayout({ children, sidebarLinks, title }: Props) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(false);

  const groupsToRender = useMemo(() => {
    if (sidebarLinks?.length) {
      return [
        {
          label: "Navigation",
          items: sidebarLinks.map((l) => ({
            label: l.label,
            href: l.href,
            icon: l.icon ?? "bi-dot",
          })),
        },
      ];
    }
    return SIDEBAR_GROUPS;
  }, [sidebarLinks]);

  const isActive = (href: string) =>
    router.pathname === href || router.pathname.startsWith(href + "/");

  useEffect(() => {
    const v = localStorage.getItem("admin_theme_dark");
    setDark(v === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("admin_theme_dark", String(dark));
    document.documentElement.classList.toggle("lux-admin-dark", dark);
  }, [dark]);

  useEffect(() => {
    const close = () => setSidebarOpen(false);
    router.events.on("routeChangeComplete", close);
    router.events.on("routeChangeError", close);
    return () => {
      router.events.off("routeChangeComplete", close);
      router.events.off("routeChangeError", close);
    };
  }, [router.events]);

  // ✅ FIX: do not return non-function from useEffect
  useEffect(() => {
    if (!sidebarOpen) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div className="lux-admin">
      {sidebarOpen && <div className="lux-overlay d-lg-none" onClick={() => setSidebarOpen(false)} />}

      <aside className={`lux-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="lux-side-top">
          <div className="lux-brand">
            <div className="lux-brand-mark">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={BRAND.mark} alt="Brand mark" />
            </div>

            <div className="lux-brand-text">
              <div className="lux-brand-name">{BRAND.name}</div>
              <div className="lux-brand-sub">Admin Console</div>
            </div>

            <button className="lux-icon-btn d-lg-none" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
              <i className="bi bi-x-lg" />
            </button>
          </div>

          <div className="lux-profile">
            <div className="lux-avatar">N</div>
            <div className="lux-profile-meta">
              <div className="lux-profile-name">Super Admin</div>
              <div className="lux-profile-role">Full access</div>
            </div>
          </div>
        </div>

        <nav className="lux-nav">
          {groupsToRender.map((g) => (
            <div key={g.label} className="lux-group">
              <div className="lux-group-title">{g.label}</div>
              <ul className="lux-list">
                {g.items.map((item: any) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link href={item.href} className={`lux-link ${active ? "active" : ""}`}>
                        <span className="lux-link-ic">
                          <i className={`bi ${item.icon}`} />
                        </span>
                        <span className="lux-link-tx">{item.label}</span>
                        <span className="lux-link-dot" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="lux-side-bottom">
          <button className="lux-logout" onClick={() => signOut({ callbackUrl: "/login" })}>
            <i className="bi bi-box-arrow-right me-2" /> Logout
          </button>
          <div className="lux-copy">© {new Date().getFullYear()} {BRAND.name}</div>
        </div>
      </aside>

      <header className="lux-topbar">
        <div className="lux-top-left">
          <button className="lux-icon-btn d-lg-none" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <i className="bi bi-list" />
          </button>

          <div className="lux-page">
            <div className="lux-page-title">{title || "Dashboard"}</div>
            <div className="lux-page-sub">Overview & controls</div>
          </div>
        </div>

        <div className="lux-top-right">
          <button className="lux-pill" onClick={() => setDark((d) => !d)} title="Theme">
            <i className={`bi ${dark ? "bi-sun" : "bi-moon"}`} />
            <span>{dark ? "Light" : "Dark"}</span>
          </button>
          <div className="lux-avatar sm">N</div>
        </div>
      </header>

      <main className="lux-main">
        <div className="lux-container">{children}</div>
      </main>
    </div>
  );
}
