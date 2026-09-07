// pages/login.tsx
// Cross Border Cart · Design system v4
// Ivory / Navy / Brass Gold

import {
  useState,
  useEffect,
  useRef,
  FormEvent,
} from "react";

import Head from "next/head";
import Link from "next/link";

import {
  signIn,
} from "next-auth/react";

import {
  useRouter,
} from "next/router";

import {
  AnimatedLogo,
} from "@/components/AnimatedLogo";

/* ─────────────────────────────────────────
   MAP DATA
───────────────────────────────────────── */

const CITIES: Record<
  string,
  {
    x: number;
    y: number;
    color: string;
    r: number;
  }
> = {
  Dubai: {
    x: 1.36,
    y: 0.2,
    color: "#C9A227",
    r: 5,
  },

  Nairobi: {
    x: 0.72,
    y: 0.58,
    color: "#0F2340",
    r: 4,
  },

  Lagos: {
    x: 0.22,
    y: 0.42,
    color: "#0F2340",
    r: 4,
  },

  Accra: {
    x: 0.16,
    y: 0.44,
    color: "#0F2340",
    r: 3.5,
  },

  Lusaka: {
    x: 0.62,
    y: 0.74,
    color: "#0F2340",
    r: 3.5,
  },

  Dar: {
    x: 0.74,
    y: 0.64,
    color: "#0F2340",
    r: 3.5,
  },

  Cairo: {
    x: 0.64,
    y: 0.08,
    color: "#68707F",
    r: 3,
  },

  JNB: {
    x: 0.56,
    y: 0.88,
    color: "#0F2340",
    r: 3.5,
  },
};

const ROUTES: [
  string,
  string
][] = [
  ["Dubai", "Nairobi"],
  ["Dubai", "Lagos"],
  ["Dubai", "Accra"],
  ["Dubai", "Lusaka"],
  ["Dubai", "Dar"],
  ["Dubai", "Cairo"],
  ["Dubai", "JNB"],
];

const AFRICA = [
  [0.45, 0],
  [0.52, 0.01],
  [0.62, 0.04],
  [0.72, 0.09],
  [0.78, 0.14],
  [0.82, 0.2],
  [0.84, 0.26],
  [0.86, 0.32],
  [0.88, 0.38],
  [0.87, 0.45],
  [0.84, 0.52],
  [0.8, 0.58],
  [0.76, 0.65],
  [0.7, 0.72],
  [0.62, 0.8],
  [0.52, 0.88],
  [0.5, 0.93],
  [0.48, 0.98],
  [0.46, 1],
  [0.44, 0.98],
  [0.4, 0.92],
  [0.34, 0.84],
  [0.26, 0.76],
  [0.18, 0.68],
  [0.12, 0.6],
  [0.08, 0.52],
  [0.05, 0.44],
  [0.04, 0.36],
  [0.05, 0.28],
  [0.08, 0.22],
  [0.12, 0.16],
  [0.18, 0.1],
  [0.26, 0.05],
  [0.34, 0.02],
  [0.4, 0],
  [0.45, 0],
];

/* ─────────────────────────────────────────
   MAP CANVAS
───────────────────────────────────────── */

function MapCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);

  useEffect(() => {
    const canvasElement = ref.current;

if (!canvasElement) {
  return;
}

const context = canvasElement.getContext("2d");

if (!context) {
  return;
}

const canvas: HTMLCanvasElement = canvasElement;
const ctx: CanvasRenderingContext2D = context;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let W = 0;
    let H = 0;
    let AW = 0;
    let AH = 0;
    let AX = 0;
    let AY = 0;

    function resize() {
      W =
        canvas.offsetWidth ||
        window.innerWidth ||
        900;

      H =
        canvas.offsetHeight ||
        window.innerHeight ||
        700;

      const dpr = Math.min(
        window.devicePixelRatio || 1,
        2
      );

      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);

      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      );

      AW = W * 0.38;
      AH = H * 0.7;
      AX = W * 0.03;
      AY = H * 0.15;
    }

    const mp = (
      x: number,
      y: number
    ): [number, number] => [
      AX + x * AW,
      AY + y * AH,
    ];

    const cp = (c: {
      x: number;
      y: number;
    }): [number, number] => [
      AX + c.x * AW,
      AY + c.y * AH,
    ];

    function quad(
      a: [number, number],
      b: [number, number]
    ): [number, number] {
      const mx = (a[0] + b[0]) / 2;
      const my = (a[1] + b[1]) / 2;

      const dx = b[0] - a[0];
      const dy = b[1] - a[1];

      const length =
        Math.sqrt(dx * dx + dy * dy) || 1;

      return [
        mx +
          (-dy / length) *
            length *
            0.22,

        my +
          (dx / length) *
            length *
            0.22,
      ];
    }

    function bz(
      a: [number, number],
      c: [number, number],
      b: [number, number],
      t: number
    ): [number, number] {
      return [
        Math.pow(1 - t, 2) * a[0] +
          2 * (1 - t) * t * c[0] +
          t * t * b[0],

        Math.pow(1 - t, 2) * a[1] +
          2 * (1 - t) * t * c[1] +
          t * t * b[1],
      ];
    }

    const pts = ROUTES.map(() => ({
      t: Math.random(),
      sp:
        0.0014 +
        Math.random() * 0.001,
    }));

    function draw() {
      ctx.clearRect(
        0,
        0,
        W,
        H
      );

      /* Africa shape */

      ctx.beginPath();

      const [firstX, firstY] = mp(
        AFRICA[0][0],
        AFRICA[0][1]
      );

      ctx.moveTo(
        firstX,
        firstY
      );

      AFRICA.slice(1).forEach(
        ([x, y]) => {
          const [px, py] = mp(
            x,
            y
          );

          ctx.lineTo(
            px,
            py
          );
        }
      );

      ctx.closePath();

      ctx.fillStyle =
        "rgba(15,35,64,0.035)";

      ctx.fill();

      ctx.strokeStyle =
        "rgba(201,162,39,0.35)";

      ctx.lineWidth = 1;

      ctx.stroke();

      /* Map dots */

      for (
        let gx = 0;
        gx <= 1;
        gx += 0.07
      ) {
        for (
          let gy = 0;
          gy <= 1;
          gy += 0.07
        ) {
          const [px, py] = mp(
            gx,
            gy
          );

          ctx.beginPath();

          ctx.arc(
            px,
            py,
            0.8,
            0,
            Math.PI * 2
          );

          ctx.fillStyle =
            "rgba(15,35,64,0.10)";

          ctx.fill();
        }
      }

      /* Routes */

      ROUTES.forEach(
        ([a, b], i) => {
          const cityA = CITIES[a];
          const cityB = CITIES[b];

          if (!cityA || !cityB) {
            return;
          }

          const p1 = cp(cityA);
          const p2 = cp(cityB);

          const control =
            quad(p1, p2);

          ctx.beginPath();

          ctx.moveTo(
            p1[0],
            p1[1]
          );

          ctx.quadraticCurveTo(
            control[0],
            control[1],
            p2[0],
            p2[1]
          );

          ctx.strokeStyle =
            "rgba(201,162,39,0.35)";

          ctx.lineWidth = 1;

          ctx.setLineDash([
            4,
            4,
          ]);

          ctx.stroke();

          ctx.setLineDash([]);

          if (!reduceMotion) {
            const point = pts[i];

            if (!point) {
              return;
            }

            point.t =
              (point.t +
                point.sp) %
              1;

            const [px, py] =
              bz(
                p1,
                control,
                p2,
                point.t
              );

            const pulse =
              0.5 +
              0.5 *
                Math.sin(
                  point.t *
                    Math.PI *
                    6
                );

            ctx.beginPath();

            ctx.arc(
              px,
              py,
              2.5 +
                pulse,
              0,
              Math.PI * 2
            );

            ctx.fillStyle = `rgba(201,162,39,${
              0.6 +
              pulse * 0.4
            })`;

            ctx.fill();

            ctx.beginPath();

            ctx.arc(
              px,
              py,
              5 +
                pulse * 2,
              0,
              Math.PI * 2
            );

            ctx.strokeStyle = `rgba(201,162,39,${
              0.15 +
              pulse * 0.15
            })`;

            ctx.lineWidth = 1;

            ctx.stroke();
          }
        }
      );

      /* City points */

      Object.values(
        CITIES
      ).forEach((city) => {
        const [px, py] =
          cp(city);

        ctx.beginPath();

        ctx.arc(
          px,
          py,
          city.r + 3,
          0,
          Math.PI * 2
        );

        ctx.strokeStyle =
          city.color + "40";

        ctx.lineWidth = 1;

        ctx.stroke();

        ctx.beginPath();

        ctx.arc(
          px,
          py,
          city.r,
          0,
          Math.PI * 2
        );

        ctx.fillStyle =
          city.color;

        ctx.fill();
      });

      if (!reduceMotion) {
        raf.current =
          requestAnimationFrame(
            draw
          );
      }
    }

    resize();
    draw();

    window.addEventListener(
      "resize",
      resize
    );

    return () => {
      window.removeEventListener(
        "resize",
        resize
      );

      cancelAnimationFrame(
        raf.current
      );
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.5,
      }}
    />
  );
}

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */

export default function LoginPage() {
  const router =
    useRouter();

  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    password,
    setPassword,
  ] =
    useState("");

  const [
    showPw,
    setShowPw,
  ] =
    useState(false);

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    resendLoading,
    setResendLoading,
  ] =
    useState(false);

  const [
    unverified,
    setUnverified,
  ] =
    useState(false);

  const [
    msg,
    setMsg,
  ] =
    useState<{
      type:
        | "ok"
        | "err";

      text:
        string;
    } | null>(
      null
    );

  async function handleSubmit(
    e: FormEvent
  ) {
    e.preventDefault();

    setMsg(null);

    setUnverified(
      false
    );

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    if (
      !normalizedEmail ||
      !password
    ) {
      setMsg({
        type:
          "err",

        text:
          "Enter your email and password.",
      });

      return;
    }

    setLoading(
      true
    );

    try {
      const res =
        await signIn(
          "credentials",
          {
            redirect:
              false,

            email:
              normalizedEmail,

            password,
          }
        );

      if (
        res?.ok &&
        !res.error
      ) {
        setMsg({
          type:
            "ok",

          text:
            "Login successful. Redirecting…",
        });

        await router.push(
          "/dashboard"
        );

        return;
      }

      const error =
        res?.error ||
        "";

      if (
        error ===
          "EMAIL_NOT_VERIFIED" ||
        error.includes(
          "EMAIL_NOT_VERIFIED"
        )
      ) {
        setUnverified(
          true
        );

        setMsg({
          type:
            "err",

          text:
            "Your email is not verified yet. Check your inbox or resend the verification email.",
        });

        return;
      }

      setMsg({
        type:
          "err",

        text:
          "Invalid email or password.",
      });
    } catch (
      error
    ) {
      console.error(
        "Login error:",
        error
      );

      setMsg({
        type:
          "err",

        text:
          "Unable to sign in right now. Please try again.",
      });
    } finally {
      setLoading(
        false
      );
    }
  }

  async function resendVerification() {
    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    if (
      !normalizedEmail
    ) {
      setMsg({
        type:
          "err",

        text:
          "Enter your email first, then click resend verification.",
      });

      return;
    }

    setResendLoading(
      true
    );

    setMsg(null);

    try {
      const res =
        await fetch(
          "/api/auth/email/resend",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                {
                  email:
                    normalizedEmail,
                }
              ),
          }
        );

      const data =
        await res
          .json()
          .catch(
            () => ({})
          );

      if (
        res.ok
      ) {
        setMsg({
          type:
            "ok",

          text:
            "If this email exists and is not verified, we sent a new verification link.",
        });
      } else {
        setMsg({
          type:
            "err",

          text:
            data.error ||
            "Could not send verification email.",
        });
      }
    } catch (
      error
    ) {
      console.error(
        "Resend verification error:",
        error
      );

      setMsg({
        type:
          "err",

        text:
          "Could not send verification email. Please try again.",
      });
    } finally {
      setResendLoading(
        false
      );
    }
  }

  return (
    <>
      <Head>
        <title>
          Login • CBC
          (Cross Border
          Cart)
        </title>

        <meta
          name="robots"
          content="noindex"
        />
      </Head>

      <main className="page">
        <MapCanvas />

        {/* LEFT */}

        <section className="left">
          <div className="brand">
            <AnimatedLogo />

            CBC
          </div>

          <div>
            <div className="htag">
              <span className="pd" />

              UAE →
              International
              Shipping
            </div>

            <h1>
              Track every
              parcel
              <br />

              <span className="accent">
                from Dubai
                to your
                door.
              </span>
            </h1>

            <p className="hsub">
              Login to
              manage your
              CBC UAE
              address,
              package
              arrivals,
              shipment
              requests and
              delivery
              updates.
            </p>

            <div className="feats">
              {[
                {
                  i: "📬",
                  t: "Dedicated CBC UAE address",
                },

                {
                  i: "📦",
                  t: "Package tracking dashboard",
                },

                {
                  i: "🔒",
                  t: "Secure shipment updates",
                },

                {
                  i: "✈️",
                  t: "International shipping from the UAE",
                },
              ].map(
                (f) => (
                  <div
                    key={
                      f.t
                    }
                    className="feat"
                  >
                    <div className="fi">
                      {
                        f.i
                      }
                    </div>

                    {
                      f.t
                    }
                  </div>
                )
              )}
            </div>
          </div>

          <div className="lbot">
            <div className="rpills">
              {[
                [
                  "DXB",
                  "NBO",
                ],

                [
                  "DXB",
                  "LOS",
                ],

                [
                  "DXB",
                  "ACC",
                ],

                [
                  "DXB",
                  "LUN",
                ],
              ].map(
                ([
                  a,
                  b,
                ]) => (
                  <div
                    key={
                      a +
                      b
                    }
                    className="rpill"
                  >
                    <span className="rpa">
                      {
                        a
                      }
                    </span>

                    <span className="rpdiv">
                      →
                    </span>

                    <span className="rpb">
                      {
                        b
                      }
                    </span>
                  </div>
                )
              )}
            </div>

            <p className="newacct">
              New
              customer?{" "}

              <Link href="/signup">
                Create
                account
              </Link>
            </p>
          </div>
        </section>

        {/* RIGHT */}

        <section className="right">
          <div className="card">
            {unverified && (
              <div className="vban">
                <span className="vico">
                  ✉️
                </span>

                <div className="vbody">
                  <strong>
                    Verify your
                    email
                  </strong>

                  <span>
                    Your
                    account
                    exists,
                    but you
                    must
                    verify your
                    email before
                    signing in.
                  </span>
                </div>
              </div>
            )}

            <div className="ch">
              <h2>
                Welcome
                back
              </h2>

              <p>
                Access your
                packages,
                shipments,
                payments and
                CBC UAE
                address.
              </p>
            </div>

            <form
              onSubmit={
                handleSubmit
              }
            >
              <label className="fld">
                <span className="lbl">
                  Email
                  address
                </span>

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={
                    email
                  }
                  onChange={(
                    e
                  ) => {
                    setEmail(
                      e
                        .target
                        .value
                    );

                    setMsg(
                      null
                    );

                    setUnverified(
                      false
                    );
                  }}
                  autoComplete="email"
                  required
                />
              </label>

              <label className="fld">
                <span className="lbl">
                  Password
                </span>

                <div className="pw">
                  <input
                    type={
                      showPw
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={
                      password
                    }
                    onChange={(
                      e
                    ) => {
                      setPassword(
                        e
                          .target
                          .value
                      );

                      setMsg(
                        null
                      );
                    }}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="pwb"
                    onClick={() =>
                      setShowPw(
                        (
                          v
                        ) =>
                          !v
                      )
                    }
                  >
                    {showPw
                      ? "Hide"
                      : "Show"}
                  </button>
                </div>
              </label>

              <div className="acts">
                <Link href="/forgot-password">
                  Forgot
                  password?
                </Link>

                <button
                  type="button"
                  onClick={
                    resendVerification
                  }
                  disabled={
                    resendLoading
                  }
                >
                  {resendLoading
                    ? "Sending…"
                    : "Resend verification"}
                </button>
              </div>

              <button
                className="cta-primary"
                type="submit"
                disabled={
                  loading
                }
              >
                {loading
                  ? "Signing in…"
                  : "Sign in"}
              </button>

              {msg && (
                <div
                  className={`msg msg-${msg.type}`}
                  role="alert"
                >
                  {
                    msg.text
                  }
                </div>
              )}

              {unverified && (
                <button
                  type="button"
                  className="resendBig"
                  onClick={
                    resendVerification
                  }
                  disabled={
                    resendLoading
                  }
                >
                  {resendLoading
                    ? "Sending verification email…"
                    : "Resend verification email"}
                </button>
              )}
            </form>

            <p className="lnk">
              Don&apos;t
              have an
              account?{" "}

              <Link href="/signup">
                Create
                account
              </Link>
            </p>
          </div>
        </section>
      </main>

      <style jsx>{`
        .page {
          min-height: 100vh;
          display: grid;
          grid-template-columns:
            1fr 1.15fr;
          background: linear-gradient(
            180deg,
            #fbf8f2 0%,
            #fff 100%
          );
          font-family:
            Inter,
            system-ui,
            sans-serif;
          color: #1c2436;
          position: relative;
        }

        .left {
          position: relative;
          z-index: 2;
          padding: 40px
            44px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-right: 1px
            solid
            #eae3d2;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 11px;
          font-weight: 900;
          font-size: 17px;
          color: #0f2340;
        }

        .htag {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 5px
            13px;
          border-radius: 99px;
          background: #f3e7c9;
          border: 1px
            solid
            #c9a227;
          font-size: 11px;
          font-weight: 700;
          color: #a8841a;
          margin-bottom: 22px;
        }

        .pd {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #c9a227;
          display: inline-block;
          animation: pulse
            2s infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(
              1
            );
          }

          50% {
            opacity: 0.4;
            transform: scale(
              1.5
            );
          }
        }

        h1 {
          font-size: 38px;
          font-weight: 900;
          line-height: 1.07;
          letter-spacing: -1.5px;
          color: #0f2340;
          margin-bottom: 13px;
        }

        .accent {
          color: #a8841a;
          font-style: italic;
        }

        .hsub {
          font-size: 14px;
          color: #68707f;
          line-height: 1.75;
          max-width: 360px;
        }

        .feats {
          display: flex;
          flex-direction: column;
          gap: 9px;
          margin-top: 20px;
        }

        .feat {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: #1c2436;
          padding: 10px
            12px;
          background: #fff;
          border: 1px
            solid
            #eae3d2;
          border-radius: 11px;
          transition: all
            0.2s;
          box-shadow: 0
            2px 10px -4px
            rgba(
              15,
              35,
              64,
              0.08
            );
        }

        .feat:hover {
          border-color: #c9a227;
          transform: translateY(
            -1px
          );
        }

        .fi {
          width: 28px;
          height: 28px;
          border-radius: 9px;
          background: #f3e7c9;
          border: 1px
            solid
            #c9a227;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
        }

        .lbot {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .rpills {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .rpill {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #fff;
          border: 1px
            solid
            #eae3d2;
          border-radius: 99px;
          padding: 5px
            10px;
        }

        .rpa {
          font-size: 10px;
          font-weight: 800;
          color: #a8841a;
        }

        .rpdiv {
          font-size: 10px;
          color: #68707f;
        }

        .rpb {
          font-size: 10px;
          font-weight: 800;
          color: #0f2340;
        }

        .newacct {
          font-size: 13px;
          color: #68707f;
        }

        .newacct
          :global(a) {
          color: #a8841a;
          font-weight: 800;
          text-decoration: none;
        }

        .right {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px;
        }

        .card {
          width: 100%;
          max-width: 450px;
          background: #fff;
          border: 1px
            solid
            #eae3d2;
          border-radius: 24px;
          padding: 34px
            36px;
          box-shadow: 0
            24px 60px -24px
            rgba(
              15,
              35,
              64,
              0.3
            );
          position: relative;
          overflow: hidden;
        }

        .vban {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: #f3e7c9;
          border: 1px
            solid
            #c9a227;
          border-radius: 12px;
          padding: 13px
            14px;
          margin-bottom: 22px;
        }

        .vico {
          font-size: 17px;
          flex-shrink: 0;
        }

        .vbody {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .vbody strong {
          font-size: 12px;
          color: #8a6b11;
        }

        .vbody span {
          font-size: 11px;
          color: #a8841a;
          line-height: 1.45;
        }

        .ch {
          margin-bottom: 22px;
        }

        .ch h2 {
          font-size: 25px;
          font-weight: 900;
          letter-spacing: -0.8px;
          color: #0f2340;
          margin-bottom: 5px;
        }

        .ch p {
          font-size: 13px;
          color: #68707f;
        }

        form {
          display: grid;
          gap: 18px;
        }

        .fld {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .lbl {
          font-size: 13px;
          font-weight: 700;
          color: #1c2436;
          letter-spacing: 0.2px;
        }

        input {
          width: 100%;
          padding: 15px
            18px;
          border: 1.5px
            solid
            #eae3d2;
          border-radius: 13px;
          font-size: 15px;
          color: #1c2436;
          background: #fbf8f2;
          outline: none;
          height: 52px;
          transition: all
            0.2s;
          font-family: inherit;
        }

        input::placeholder {
          color: #a3aab5;
          font-size: 14px;
        }

        input:focus {
          border-color: #c9a227;
          box-shadow: 0
            0 0 3px
            rgba(
              201,
              162,
              39,
              0.14
            );
          background: #fff;
        }

        .pw {
          position: relative;
        }

        .pw input {
          padding-right: 80px;
        }

        .pwb {
          position: absolute;
          right: 9px;
          top: 50%;
          transform: translateY(
            -50%
          );
          height: 32px;
          border: 1px
            solid
            #eae3d2;
          border-radius: 9px;
          background: #fff;
          color: #68707f;
          font-weight: 700;
          font-size: 11px;
          cursor: pointer;
          padding: 0
            11px;
          font-family: inherit;
          transition: all
            0.2s;
        }

        .pwb:hover {
          background: #f3e7c9;
          color: #a8841a;
          border-color: #c9a227;
        }

        .acts {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .acts
          :global(a),
        .acts button {
          border: none;
          background: transparent;
          padding: 0;
          color: #a8841a;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          text-decoration: none;
          font-family: inherit;
          transition: color
            0.2s;
        }

        .acts button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .acts
          :global(a:hover),
        .acts
          button:hover:not(
            :disabled
          ) {
          color: #c9a227;
        }

        .cta-primary {
          height: 52px;
          border: none;
          border-radius: 14px;
          background: linear-gradient(
            155deg,
            #c9a227,
            #a8841a
          );
          color: #fff;
          font-weight: 800;
          font-size: 16px;
          cursor: pointer;
          width: 100%;
          font-family: inherit;
          box-shadow: 0
            12px 28px -10px
            rgba(
              169,
              132,
              26,
              0.5
            );
          transition: all
            0.2s;
          letter-spacing: 0.2px;
        }

        .cta-primary:hover:not(
            :disabled
          ) {
          transform: translateY(
            -2px
          );
          box-shadow: 0
            16px 34px -10px
            rgba(
              169,
              132,
              26,
              0.6
            );
        }

        .cta-primary:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        .msg {
          padding: 12px
            15px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          margin-top: 2px;
          line-height: 1.5;
        }

        .msg-err {
          background: #fdecec;
          color: #c0392b;
          border: 1px
            solid
            #f5c6c6;
        }

        .msg-ok {
          background: #f3e7c9;
          color: #a8841a;
          border: 1px
            solid
            #c9a227;
        }

        .resendBig {
          min-height: 46px;
          border: 1px
            solid
            #c9a227;
          border-radius: 12px;
          background: #fffaf0;
          color: #a8841a;
          font-weight: 800;
          font-size: 13px;
          cursor: pointer;
          font-family: inherit;
          transition: all
            0.2s;
        }

        .resendBig:hover:not(
            :disabled
          ) {
          background: #f3e7c9;
        }

        .resendBig:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .lnk {
          text-align: center;
          color: #68707f;
          font-size: 13px;
          margin-top: 18px;
        }

        .lnk
          :global(a) {
          color: #a8841a;
          font-weight: 800;
          text-decoration: none;
        }

        .lnk
          :global(a:hover) {
          text-decoration: underline;
        }

        @media (
          max-width: 900px
        ) {
          .page {
            grid-template-columns: 1fr;
          }

          .left {
            display: none;
          }

          .right {
            padding: 18px;
            align-items: flex-start;
          }

          .card {
            padding: 24px;
            border-radius: 20px;
            max-width: 100%;
          }
        }

        @media (
          prefers-reduced-motion:
            reduce
        ) {
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