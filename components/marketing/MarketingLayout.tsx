import { ReactNode } from "react";
import Head from "next/head";
import Link from "next/link";
import { Container, Navbar, Nav } from "react-bootstrap";

type MarketingLayoutProps = {
  children: ReactNode;
  title?: string;
  description?: string;
};

export default function MarketingLayout({
  children,
  title,
  description,
}: MarketingLayoutProps) {
  const year = new Date().getFullYear();
  const pageTitle = title ? `${title} | CrossBorderCart` : "CrossBorderCart";
  const pageDescription =
    description ||
    "CrossBorderCart helps you ship internationally with transparent pricing, tracking and reliable delivery.";

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Head>

      <div className="d-flex flex-column min-vh-100">
        {/* Top navbar */}
        <Navbar bg="white" expand="lg" className="border-bottom">
          <Container>
            <Link href="/" className="navbar-brand fw-bold text-primary">
              CrossBorderCart
            </Link>

            <Navbar.Toggle aria-controls="marketing-navbar" />
            <Navbar.Collapse id="marketing-navbar">
              <Nav className="ms-auto">
                <Link href="/about" className="nav-link">
                  About
                </Link>
                <Link href="/tips" className="nav-link">
                  Tips &amp; Guides
                </Link>
                <Link href="/faq" className="nav-link">
                  FAQ
                </Link>
                <Link href="/contact" className="nav-link">
                  Contact
                </Link>
                <Link href="/privacy" className="nav-link">
                  Privacy
                </Link>
                <Link href="/terms" className="nav-link">
                  Terms
                </Link>
                <Link href="/shipping-calculator" className="nav-link">
  Calculator
</Link>

                <Link href="/dashboard" className="btn btn-primary ms-2">
                  Sign in
                </Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        {/* Page content */}
        <main className="flex-grow-1">{children}</main>

        {/* Footer */}
        <footer className="border-top py-4 mt-5">
          <Container>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
              <div className="small text-muted">
                © {year} CrossBorderCart. All rights reserved.
              </div>

              <ul className="list-unstyled d-flex flex-wrap gap-3 mb-0 small">
                <li>
                  <Link
                    href="/about"
                    className="text-decoration-none text-muted"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tips"
                    className="text-decoration-none text-muted"
                  >
                    Tips &amp; Guides
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-decoration-none text-muted"
                  >
                    FAQ
                  </Link>
                  <Link href="/shipping-calculator" className="nav-link">
  Calculator
</Link>

                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-decoration-none text-muted"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-decoration-none text-muted"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-decoration-none text-muted"
                  >
                    Terms &amp; Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </Container>
        </footer>
      </div>
    </>
  );
}
