// components/NavBar.tsx
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import styles from "./NavBar.module.css";

function decodeJwtPayload(token: string): any | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

const cx = (...cls: Array<string | false | null | undefined>) =>
  cls.filter((v): v is string => Boolean(v)).join(" ");

export default function NavBar() {
  const router = useRouter();
  const { data: session } = useSession();

  const [tokenRole, setTokenRole] = useState<string | null>(null);
  const [authedByToken, setAuthedByToken] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const readToken = () => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      setAuthedByToken(!!token);
      if (!token) return setTokenRole(null);
      const payload = decodeJwtPayload(token);
      setTokenRole(payload?.role || null);
    };

    readToken();

    const onStorage = (e: StorageEvent) => {
      if (e.key === "token") readToken();
    };
    window.addEventListener("storage", onStorage);

    const onRouteDone = () => setMenuOpen(false);
    router.events.on("routeChangeComplete", onRouteDone);

    return () => {
      window.removeEventListener("storage", onStorage);
      router.events.off("routeChangeComplete", onRouteDone);
    };
  }, [router.events]);

  const sessionRole = (session?.user as any)?.role as string | undefined;
  const role = sessionRole ?? tokenRole ?? null;
  const isAdmin = role === "admin" || role === "superadmin";
  const isLoggedIn = authedByToken || !!session;

  const isActive = (href: string) =>
    router.asPath === href || router.asPath.startsWith(href + "/");

  const toggleMenu = () => setMenuOpen((v) => !v);

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    setAuthedByToken(false);
    setTokenRole(null);
    router.push("/login");
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navInner}>
        {/* Brand / logo */}
        <Link href="/" className={styles.brand}>
          <span className={styles.logoWrap}>
            {/* the file is /public/logo-cart.svg */}
            <Image
              src="/logo-cart.svg"
              alt="Cross Border Cart"
              fill
              priority
              sizes="48px"
              className={styles.logoImg}
            />
          </span>
          <span className={styles.brandText}>
            <span className={styles.brandLineTop}>Cross Border</span>
            <span className={styles.brandLineBottom}>Cart</span>
          </span>
        </Link>

        {/* Mobile hamburger */}
        <button
          type="button"
          className={styles.hamburger}
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          aria-controls="main-nav-links"
        >
          <span />
          <span />
          <span />
        </button>

        {/* Links */}
        <div
          id="main-nav-links"
          className={cx(styles.links, menuOpen && styles.open)}
        >
          <Link
            href="/"
            className={cx(styles.link, isActive("/") && styles.active)}
            aria-current={isActive("/") ? "page" : undefined}
          >
            Home
          </Link>

          <Link
            href="/shipping-calculator"
            className={cx(
              styles.link,
              isActive("/shipping-calculator") && styles.active
            )}
          >
            Shipping rates
          </Link>

          <Link
            href="/track"
            className={cx(styles.link, isActive("/track") && styles.active)}
          >
            Track
          </Link>

          <Link
            href="/mypackages"
            className={cx(
              styles.link,
              isActive("/mypackages") && styles.active
            )}
            aria-current={isActive("/mypackages") ? "page" : undefined}
          >
            My Packages
          </Link>

          {isLoggedIn && (
            <Link
              href="/charges"
              className={cx(
                styles.link,
                isActive("/charges") && styles.active
              )}
              aria-current={isActive("/charges") ? "page" : undefined}
            >
              My Invoices
            </Link>
          )}

          {isAdmin && (
            <>
              <Link
                href="/admin"
                className={cx(
                  styles.link,
                  isActive("/admin") && styles.active
                )}
              >
                Admin
              </Link>
              <Link
                href="/admin/shipments"
                className={cx(
                  styles.link,
                  isActive("/admin/shipments") && styles.active
                )}
              >
                Shipments
              </Link>
            </>
          )}

          {isLoggedIn ? (
            <button
              type="button"
              onClick={logout}
              className={styles.logoutButton}
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className={cx(
                  styles.link,
                  styles.cta,
                  isActive("/login") && styles.active
                )}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className={cx(styles.link, styles.ctaFilled)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
