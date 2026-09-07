// pages/signup.tsx
// Cross Border Cart · Design system v4
// Ivory / Navy / Brass Gold
// Flow: Signup → Check email → Verify → Login

import {
  useState,
  useEffect,
  useRef,
  FormEvent,
} from "react";

import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { countries } from "@/utils/countries";
import { AnimatedLogo } from "@/components/AnimatedLogo";

type Msg =
  | {
      type: "success" | "error";
      text: string;
    }
  | null;

const PASSWORD_RULE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]{8,}$/;

/* ─────────────────────────────────────────
   PASSWORD STRENGTH
───────────────────────────────────────── */

function pwStrength(v: string) {
  if (!v) {
    return {
      score: 0,
      label: "",
      color: "",
    };
  }

  let score = 0;

  if (v.length >= 8) score++;
  if (/[A-Z]/.test(v)) score++;
  if (/[0-9]/.test(v)) score++;
  if (/[^A-Za-z0-9]/.test(v)) score++;

  return {
    score,
    label:
      ["", "Weak", "Fair", "Good", "Strong"][score] ?? "",
    color:
      [
        "",
        "#c0392b",
        "#B36B00",
        "#B36B00",
        "#A8841A",
      ][score] ?? "",
  };
}

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

const ROUTES: [string, string][] = [
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

    // Give TypeScript permanently non-null aliases.
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

export default function SignupPage() {
  const router =
    useRouter();

  const [form, setForm] =
    useState({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",

      country: "",
      phone: "",

      addressLabel:
        "Home",

      address1: "",
      address2: "",
      city: "",
      state: "",
      postalCode: "",
    });

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    msg,
    setMsg,
  ] =
    useState<Msg>(
      null
    );

  const [
    showPw,
    setShowPw,
  ] =
    useState(false);

  const pw =
    pwStrength(
      form.password
    );

  const barColor = (
    i: number
  ) =>
    i >
    pw.score
      ? "#EAE3D2"
      : pw.color;

  function onChange(
    e: React.ChangeEvent<
      | HTMLInputElement
      | HTMLSelectElement
    >
  ) {
    setForm(
      (current) => ({
        ...current,

        [e.target.name]:
          e.target
            .value,
      })
    );

    if (msg) {
      setMsg(null);
    }
  }

  async function onSubmit(
    e: FormEvent
  ) {
    e.preventDefault();

    setMsg(null);

    const normalizedEmail =
      form.email
        .trim()
        .toLowerCase();

    /*
      Only account essentials
      are mandatory.

      Delivery address can be
      added now or later.
    */

    const required = [
      form.firstName,
      form.lastName,
      normalizedEmail,
      form.password,
      form.confirmPassword,
      form.country,
    ];

    if (
      required.some(
        (v) =>
          !v.trim()
      )
    ) {
      setMsg({
        type: "error",

        text:
          "Please fill all required fields.",
      });

      return;
    }

    const EMAIL_RULE =
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (
      !EMAIL_RULE.test(
        normalizedEmail
      )
    ) {
      setMsg({
        type: "error",

        text:
          "Please enter a valid email address.",
      });

      return;
    }

    if (
      form.password !==
      form.confirmPassword
    ) {
      setMsg({
        type: "error",

        text:
          "Passwords do not match.",
      });

      return;
    }

    if (
      !PASSWORD_RULE.test(
        form.password
      )
    ) {
      setMsg({
        type: "error",

        text:
          "Password must be 8+ characters with uppercase, lowercase and a number.",
      });

      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...form,

        firstName:
          form.firstName.trim(),

        lastName:
          form.lastName.trim(),

        email:
          normalizedEmail,

        phone:
          form.phone.trim(),

        addressLabel:
          form.addressLabel.trim() ||
          "Home",

        address1:
          form.address1.trim(),

        address2:
          form.address2.trim(),

        city:
          form.city.trim(),

        state:
          form.state.trim(),

        postalCode:
          form.postalCode.trim(),
      };

      const res =
        await fetch(
          "/api/auth/signup",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        );

      const data =
        await res
          .json()
          .catch(
            () => ({})
          );

      if (!res.ok) {
        setMsg({
          type: "error",

          text:
            data.error ||
            "Signup failed. Please try again.",
        });

        return;
      }

      /*
        Account created.

        Do NOT log the user in.

        They must verify email.
      */

      await router.push(
        `/check-email?email=${encodeURIComponent(
          normalizedEmail
        )}`
      );
    } catch (
      error
    ) {
      console.error(
        "Signup error:",
        error
      );

      setMsg({
        type: "error",

        text:
          "Network error. Please try again.",
      });
    } finally {
      setLoading(
        false
      );
    }
  }

  return (
    <>
      <Head>
        <title>
          Create Account
          • CBC
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

              UAE Shipping
              Address
            </div>

            <h1>
              Shop UAE.
              <br />

              <span className="accent">
                Ship to
                your door.
              </span>
            </h1>

            <p className="hsub">
              Get your
              personal CBC
              Dubai address,
              consolidate
              eligible
              packages, and
              ship home with
              tracking and
              transparent
              pricing.
            </p>

            <div className="feats">
              {[
                {
                  i: "📬",
                  t: "Your personal CBC UAE address",
                },

                {
                  i: "📦",
                  t: "Package dashboard with photo proof",
                },

                {
                  i: "✈️",
                  t: "International shipping from the UAE",
                },

                {
                  i: "📡",
                  t: "Tracking on every parcel",
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
            <div className="ll">
              Why create
              a CBC
              account?
            </div>

            {[
              {
                i: "📬",
                t: "Personal CBC UAE address",
              },

              {
                i: "📦",
                t: "Package dashboard",
              },

              {
                i: "📷",
                t: "Package photos",
              },

              {
                i: "✈️",
                t: "Shipping options",
              },

              {
                i: "📡",
                t: "Shipment tracking",
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
        </section>

        {/* RIGHT */}

        <section className="right">
          <div className="card">
            <div className="ch">
              <h2>
                Create your
                account
              </h2>

              <p>
                Use a real
                email address.
                You must
                verify it
                before your
                first login.
              </p>
            </div>

            {/* PROGRESS */}

            <div className="prog">
              <div className="pg">
                <div className="pc pa">
                  1
                </div>

                <span className="pla">
                  Account
                </span>

                <div className="pln plna" />
              </div>

              <div className="pg">
                <div className="pc pi">
                  2
                </div>

                <span className="pli">
                  Verify
                </span>
              </div>
            </div>

            <form
              onSubmit={
                onSubmit
              }
            >
              <div className="row">
                <label className="fld">
                  <span className="lbl">
                    First name{" "}

                    <span className="req">
                      *
                    </span>
                  </span>

                  <input
                    name="firstName"
                    value={
                      form.firstName
                    }
                    onChange={
                      onChange
                    }
                    placeholder="Amara"
                    autoComplete="given-name"
                    required
                  />
                </label>

                <label className="fld">
                  <span className="lbl">
                    Last name{" "}

                    <span className="req">
                      *
                    </span>
                  </span>

                  <input
                    name="lastName"
                    value={
                      form.lastName
                    }
                    onChange={
                      onChange
                    }
                    placeholder="Okafor"
                    autoComplete="family-name"
                    required
                  />
                </label>
              </div>

              <label className="fld">
                <span className="lbl">
                  Email
                  address{" "}

                  <span className="req">
                    *
                  </span>
                </span>

                <input
                  type="email"
                  name="email"
                  value={
                    form.email
                  }
                  onChange={
                    onChange
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />

                <span className="hint">
                  We will
                  send your
                  verification
                  link here.
                </span>
              </label>

              <div className="row">
                <label className="fld">
                  <span className="lbl">
                    Password{" "}

                    <span className="req">
                      *
                    </span>
                  </span>

                  <div className="pw">
                    <input
                      type={
                        showPw
                          ? "text"
                          : "password"
                      }
                      name="password"
                      value={
                        form.password
                      }
                      onChange={
                        onChange
                      }
                      placeholder="8+ chars, Aa + number"
                      autoComplete="new-password"
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

                  {form.password && (
                    <div className="str">
                      <div className="sbars">
                        {[
                          1,
                          2,
                          3,
                          4,
                        ].map(
                          (
                            i
                          ) => (
                            <div
                              key={
                                i
                              }
                              className="sb"
                              style={{
                                background:
                                  barColor(
                                    i
                                  ),
                              }}
                            />
                          )
                        )}
                      </div>

                      <span
                        className="slb"
                        style={{
                          color:
                            pw.color,
                        }}
                      >
                        {
                          pw.label
                        }
                      </span>
                    </div>
                  )}
                </label>

                <label className="fld">
                  <span className="lbl">
                    Confirm
                    password{" "}

                    <span className="req">
                      *
                    </span>
                  </span>

                  <input
                    type={
                      showPw
                        ? "text"
                        : "password"
                    }
                    name="confirmPassword"
                    value={
                      form.confirmPassword
                    }
                    onChange={
                      onChange
                    }
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                    required
                  />
                </label>
              </div>

              <div className="row">
                <label className="fld">
                  <span className="lbl">
                    Phone
                  </span>

                  <input
                    type="tel"
                    name="phone"
                    value={
                      form.phone
                    }
                    onChange={
                      onChange
                    }
                    placeholder="+971 50 123 4567"
                    autoComplete="tel"
                  />
                </label>

                <label className="fld">
                  <span className="lbl">
                    Ship-to
                    country{" "}

                    <span className="req">
                      *
                    </span>
                  </span>

                  <select
                    name="country"
                    value={
                      form.country
                    }
                    onChange={
                      onChange
                    }
                    required
                  >
                    <option value="">
                      Select
                      country…
                    </option>

                    {countries.map(
                      (
                        c
                      ) => (
                        <option
                          key={
                            c.code
                          }
                          value={
                            c.name
                          }
                        >
                          {
                            c.name
                          }
                        </option>
                      )
                    )}
                  </select>
                </label>
              </div>

              {/* OPTIONAL DELIVERY ADDRESS */}

              <div className="sdiv">
                <div className="dl" />

                <div className="dlb">
                  📍 First
                  delivery
                  address{" "}

                  <span>
                    Optional
                  </span>
                </div>

                <div className="dl" />
              </div>

              <p className="addressHelp">
                You can add
                this now or
                complete it
                later from
                your dashboard.
              </p>

              <div className="row">
                <label className="fld">
                  <span className="lbl">
                    Address
                    label
                  </span>

                  <input
                    name="addressLabel"
                    value={
                      form.addressLabel
                    }
                    onChange={
                      onChange
                    }
                    placeholder="Home, Office…"
                  />
                </label>

                <label className="fld">
                  <span className="lbl">
                    Address
                    line 1
                  </span>

                  <input
                    name="address1"
                    value={
                      form.address1
                    }
                    onChange={
                      onChange
                    }
                    placeholder="Street, building, area"
                    autoComplete="address-line1"
                  />
                </label>
              </div>

              <div className="row">
                <label className="fld">
                  <span className="lbl">
                    Address
                    line 2
                  </span>

                  <input
                    name="address2"
                    value={
                      form.address2
                    }
                    onChange={
                      onChange
                    }
                    placeholder="Apartment, suite, floor…"
                    autoComplete="address-line2"
                  />
                </label>

                <label className="fld">
                  <span className="lbl">
                    City
                  </span>

                  <input
                    name="city"
                    value={
                      form.city
                    }
                    onChange={
                      onChange
                    }
                    autoComplete="address-level2"
                  />
                </label>
              </div>

              <div className="row">
                <label className="fld">
                  <span className="lbl">
                    State /
                    Province
                  </span>

                  <input
                    name="state"
                    value={
                      form.state
                    }
                    onChange={
                      onChange
                    }
                    autoComplete="address-level1"
                  />
                </label>

                <label className="fld">
                  <span className="lbl">
                    Postal
                    code
                  </span>

                  <input
                    name="postalCode"
                    value={
                      form.postalCode
                    }
                    onChange={
                      onChange
                    }
                    autoComplete="postal-code"
                  />
                </label>
              </div>

              <button
                className="cta-primary"
                type="submit"
                disabled={
                  loading
                }
              >
                {loading
                  ? "Creating account…"
                  : "Create account →"}
              </button>

              {msg && (
                <div
                  className={`msg ${
                    msg.type ===
                    "error"
                      ? "msg-err"
                      : "msg-ok"
                  }`}
                  role="alert"
                >
                  {
                    msg.text
                  }
                </div>
              )}
            </form>

            <p className="lnk">
              Already have
              an account?{" "}

              <Link href="/login">
                Sign in →
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
            0.85fr 1.15fr;
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
          gap: 9px;
        }

        .ll {
          font-size: 10px;
          font-weight: 700;
          color: #68707f;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          display: flex;
          align-items: center;
          gap: 5px;
          margin-bottom: 2px;
        }

        .ll::before {
          content: "";
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #c9a227;
          flex-shrink: 0;
          animation: pulse
            1.5s infinite;
        }

        .right {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 28px
            32px;
          overflow-y: auto;
        }

        .card {
          width: 100%;
          max-width: 720px;
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

        .ch {
          margin-bottom: 22px;
        }

        .ch h2 {
          font-size: 24px;
          font-weight: 900;
          letter-spacing: -0.8px;
          color: #0f2340;
          margin-bottom: 5px;
        }

        .ch p {
          font-size: 12px;
          color: #68707f;
        }

        .prog {
          display: flex;
          align-items: center;
          margin-bottom: 22px;
        }

        .pg {
          display: flex;
          align-items: center;
          flex: 1;
        }

        .pg:last-child {
          flex: 0;
        }

        .pc {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 800;
          flex-shrink: 0;
        }

        .pa {
          background: #f3e7c9;
          border: 2px
            solid
            #c9a227;
          color: #a8841a;
        }

        .pi {
          background: #fbf8f2;
          border: 1px
            solid
            #eae3d2;
          color: #68707f;
        }

        .pla {
          font-size: 11px;
          font-weight: 700;
          margin-left: 6px;
          color: #0f2340;
        }

        .pli {
          font-size: 11px;
          font-weight: 700;
          margin-left: 6px;
          color: #68707f;
        }

        .pln {
          flex: 1;
          height: 1px;
          background: #eae3d2;
          margin: 0
            8px;
          min-width: 14px;
        }

        .plna {
          background: #c9a227;
        }

        form {
          display: grid;
          gap: 16px;
        }

        .row {
          display: grid;
          grid-template-columns:
            1fr 1fr;
          gap: 14px;
        }

        .fld {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .lbl {
          font-size: 13px;
          font-weight: 700;
          color: #1c2436;
          letter-spacing: 0.2px;
        }

        .req {
          color: #a8841a;
          font-size: 9px;
          margin-left: 2px;
        }

        .hint {
          font-size: 10px;
          color: #68707f;
        }

        input,
        select {
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

        input:focus,
        select:focus {
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

        select option {
          background: #fff;
          color: #1c2436;
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

        .str {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 4px;
        }

        .sbars {
          display: flex;
          gap: 3px;
          flex: 1;
        }

        .sb {
          flex: 1;
          height: 3px;
          border-radius: 99px;
          transition: all
            0.3s;
        }

        .slb {
          font-size: 10px;
          font-weight: 700;
          min-width: 32px;
        }

        .sdiv {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 8px 0
            0;
        }

        .dl {
          flex: 1;
          height: 1px;
          background: #eae3d2;
        }

        .dlb {
          font-size: 11px;
          font-weight: 800;
          color: #a8841a;
          white-space: nowrap;
        }

        .dlb span {
          color: #68707f;
          font-weight: 600;
        }

        .addressHelp {
          margin: -8px
            0 0;
          text-align: center;
          font-size: 10px;
          color: #68707f;
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
          margin-top: 4px;
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
            padding: 16px;
            align-items: flex-start;
          }

          .card {
            padding: 22px;
            border-radius: 20px;
            max-width: 100%;
          }

          .row {
            grid-template-columns: 1fr;
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