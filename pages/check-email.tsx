import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { AnimatedLogo } from "@/components/AnimatedLogo";

type Msg =
  | { type: "ok" | "err"; text: string }
  | null;

export default function CheckEmailPage() {
  const router = useRouter();

  const email =
    typeof router.query.email === "string"
      ? router.query.email
      : "";

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  async function resendVerification() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setMsg({
        type: "err",
        text: "Email address is missing. Please return to signup or login.",
      });

      return;
    }

    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch("/api/auth/email/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setMsg({
          type: "ok",
          text: "If this account is awaiting verification, we sent a new verification email.",
        });
      } else {
        setMsg({
          type: "err",
          text:
            data.error ||
            "We could not resend the verification email.",
        });
      }
    } catch (error) {
      console.error("Resend verification error:", error);

      setMsg({
        type: "err",
        text: "Unable to resend the email right now. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Check Your Email • CBC</title>
        <meta name="robots" content="noindex" />
      </Head>

      <main className="page">
        <div className="glow glow1" />
        <div className="glow glow2" />

        <section className="card">
          <div className="brand">
            <AnimatedLogo />
            <span>CBC</span>
          </div>

          <div className="iconWrap">
            <div className="icon">✉️</div>
          </div>

          <div className="step">STEP 2 OF 2</div>

          <h1>Check your email</h1>

          <p className="lead">
            Your Cross Border Cart account has been created.
            We sent a verification link to:
          </p>

          {email && (
            <div className="emailBox">
              {email}
            </div>
          )}

          <p className="info">
            Open the email and click the verification button.
            You must verify your email before you can sign in.
          </p>

          <div className="steps">
            <div className="stepRow">
              <span>1</span>
              <div>
                <strong>Open your inbox</strong>
                <p>Look for an email from Cross Border Cart.</p>
              </div>
            </div>

            <div className="stepRow">
              <span>2</span>
              <div>
                <strong>Verify your email</strong>
                <p>Click the verification link inside the email.</p>
              </div>
            </div>

            <div className="stepRow">
              <span>3</span>
              <div>
                <strong>Sign in</strong>
                <p>After verification, return to CBC and log in.</p>
              </div>
            </div>
          </div>

          {msg && (
            <div
              className={`msg ${
                msg.type === "ok" ? "msgOk" : "msgErr"
              }`}
              role="alert"
            >
              {msg.text}
            </div>
          )}

          <Link href="/login" className="primaryButton">
            Go to sign in →
          </Link>

          <button
            type="button"
            className="secondaryButton"
            onClick={resendVerification}
            disabled={loading}
          >
            {loading
              ? "Sending…"
              : "Resend verification email"}
          </button>

          <p className="help">
            Didn&apos;t receive it? Check your spam or junk folder first.
          </p>

          <Link href="/" className="homeLink">
            ← Back to Cross Border Cart
          </Link>
        </section>
      </main>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html,
        body,
        #__next {
          min-height: 100%;
          margin: 0;
        }

        body {
          background: #fbf8f2;
        }
      `}</style>

      <style jsx>{`
        .page {
          position: relative;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 28px 18px;
          overflow: hidden;
          font-family: Inter, system-ui, sans-serif;
          background:
            radial-gradient(
              circle at 15% 20%,
              rgba(201, 162, 39, 0.1),
              transparent 32%
            ),
            radial-gradient(
              circle at 85% 80%,
              rgba(15, 35, 64, 0.06),
              transparent 35%
            ),
            linear-gradient(
              180deg,
              #fbf8f2 0%,
              #ffffff 100%
            );
          color: #1c2436;
        }

        .glow {
          position: fixed;
          width: 450px;
          height: 450px;
          border-radius: 50%;
          filter: blur(130px);
          opacity: 0.13;
          pointer-events: none;
        }

        .glow1 {
          top: -170px;
          right: -150px;
          background: #c9a227;
        }

        .glow2 {
          bottom: -210px;
          left: -170px;
          background: #0f2340;
        }

        .card {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 560px;
          padding: 38px 40px;
          background: #ffffff;
          border: 1px solid #eae3d2;
          border-radius: 24px;
          box-shadow:
            0 28px 70px -28px rgba(15, 35, 64, 0.3);
          text-align: center;
        }

        .brand {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          margin-bottom: 28px;
          color: #0f2340;
          font-size: 17px;
          font-weight: 900;
        }

        .iconWrap {
          display: flex;
          justify-content: center;
          margin-bottom: 18px;
        }

        .icon {
          width: 74px;
          height: 74px;
          display: grid;
          place-items: center;
          border-radius: 20px;
          background: #f3e7c9;
          border: 1px solid #c9a227;
          font-size: 32px;
          box-shadow:
            0 12px 30px -16px rgba(169, 132, 26, 0.6);
        }

        .step {
          margin-bottom: 7px;
          color: #a8841a;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.15em;
        }

        h1 {
          margin: 0 0 12px;
          color: #0f2340;
          font-size: 34px;
          line-height: 1.1;
          letter-spacing: -1px;
        }

        .lead {
          margin: 0 auto 14px;
          max-width: 430px;
          color: #68707f;
          font-size: 14px;
          line-height: 1.65;
        }

        .emailBox {
          margin: 0 auto 18px;
          padding: 12px 16px;
          max-width: 100%;
          overflow-wrap: anywhere;
          border: 1px solid #e2d39d;
          border-radius: 12px;
          background: #fffaf0;
          color: #8a6b11;
          font-size: 14px;
          font-weight: 800;
        }

        .info {
          margin: 0 auto 24px;
          max-width: 440px;
          color: #68707f;
          font-size: 12px;
          line-height: 1.65;
        }

        .steps {
          display: grid;
          gap: 11px;
          margin-bottom: 23px;
          text-align: left;
        }

        .stepRow {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 13px;
          border: 1px solid #eae3d2;
          border-radius: 13px;
          background: #fbf8f2;
        }

        .stepRow > span {
          flex: 0 0 28px;
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #f3e7c9;
          border: 1px solid #c9a227;
          color: #a8841a;
          font-size: 11px;
          font-weight: 900;
        }

        .stepRow strong {
          display: block;
          margin-bottom: 2px;
          color: #0f2340;
          font-size: 13px;
        }

        .stepRow p {
          margin: 0;
          color: #68707f;
          font-size: 11px;
          line-height: 1.5;
        }

        .msg {
          margin-bottom: 15px;
          padding: 12px 14px;
          border-radius: 11px;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.5;
        }

        .msgOk {
          background: #f3e7c9;
          color: #8a6b11;
          border: 1px solid #c9a227;
        }

        .msgErr {
          background: #fdecec;
          color: #c0392b;
          border: 1px solid #f5c6c6;
        }

        :global(.primaryButton) {
          width: 100%;
          min-height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          background: linear-gradient(
            155deg,
            #c9a227,
            #a8841a
          );
          color: #ffffff;
          font-size: 15px;
          font-weight: 800;
          text-decoration: none;
          box-shadow:
            0 12px 28px -10px rgba(169, 132, 26, 0.5);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        :global(.primaryButton:hover) {
          transform: translateY(-2px);
          box-shadow:
            0 16px 34px -10px rgba(169, 132, 26, 0.6);
        }

        .secondaryButton {
          width: 100%;
          min-height: 50px;
          margin-top: 11px;
          border: 1px solid #c9a227;
          border-radius: 14px;
          background: #ffffff;
          color: #a8841a;
          cursor: pointer;
          font-family: inherit;
          font-size: 13px;
          font-weight: 800;
          transition: all 0.2s ease;
        }

        .secondaryButton:hover:not(:disabled) {
          background: #f3e7c9;
        }

        .secondaryButton:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .help {
          margin: 16px 0 10px;
          color: #68707f;
          font-size: 11px;
          line-height: 1.5;
        }

        :global(.homeLink) {
          color: #68707f;
          font-size: 11px;
          font-weight: 700;
          text-decoration: none;
        }

        :global(.homeLink:hover) {
          color: #a8841a;
        }

        @media (max-width: 600px) {
          .page {
            padding: 14px;
            align-items: flex-start;
          }

          .card {
            padding: 28px 19px;
            border-radius: 20px;
          }

          h1 {
            font-size: 29px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </>
  );
}