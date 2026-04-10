//components\AIChatbotModal.tsx
import { useEffect, useRef, useState } from "react";
import styles from "./AIChatbotModal.module.css";

type ChatRole = "assistant" | "user";
type ChatMessage = { role: ChatRole; content: string };

type Props = {
  open: boolean;
  onClose: () => void;
  userContext?: any;
};

type Flow = "none" | "track" | "quote";

type TrackData = {
  courier?: string;
  trackingNumber?: string;
};

type QuoteData = {
  origin?: string;
  destination?: string;
  weightKg?: string;
};

export default function AIChatbotModal({ open, onClose, userContext }: Props) {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  const [mode, setMode] = useState<"demo" | "ai">("demo");

  const [flow, setFlow] = useState<Flow>("none");
  const [trackData, setTrackData] = useState<TrackData>({});
  const [quoteData, setQuoteData] = useState<QuoteData>({});

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi! Ask me anything about shipping, pricing, tracking, or your account.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  // Mount/unmount with animation
  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
      setTimeout(() => {
        panelRef.current?.focus();
        inputRef.current?.focus();
      }, 80);
      return;
    }

    if (mounted) {
      setClosing(true);
      const t = window.setTimeout(() => {
        setMounted(false);
        setClosing(false);
      }, 220);
      return () => window.clearTimeout(t);
    }
  }, [open, mounted]);

  // ESC + body scroll lock
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  // Auto scroll to latest message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  const isClosing = closing && !open;
  if (!mounted) return null;

  function addAssistant(text: string) {
    setMessages((prev) => [...prev, { role: "assistant", content: text }]);
  }

  function startTrackFlow() {
    setErr(null);
    setFlow("track");
    setTrackData({});
    addAssistant("✅ Tracking mode: What courier is it? (DHL / Aramex / FedEx / UPS)");
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function startQuoteFlow() {
    setErr(null);
    setFlow("quote");
    setQuoteData({});
    addAssistant(
      "✅ Price estimate mode:\nReply like: Origin: UAE Dubai, Destination: Uganda Kampala"
    );
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function parseKeyValueLine(text: string) {
    // Accept: "Origin: UAE Dubai, Destination: Uganda Kampala"
    const parts = text.split(",").map((p) => p.trim());
    const out: Record<string, string> = {};
    for (const p of parts) {
      const [k, ...rest] = p.split(":");
      if (!k || rest.length === 0) continue;
      out[k.trim().toLowerCase()] = rest.join(":").trim();
    }
    return out;
  }

  function calcVolumetricWeightKg(l: number, w: number, h: number, divisor = 5000) {
    // Standard air-freight volumetric: (L*W*H)/5000 in kg (cm)
    return (l * w * h) / divisor;
  }

  function roughPriceEstimate(effectiveKg: number) {
    // Simple demo ranges (adjust later)
    if (effectiveKg <= 1) return "Estimated range: $12–$25";
    if (effectiveKg <= 3) return "Estimated range: $25–$55";
    if (effectiveKg <= 5) return "Estimated range: $45–$85";
    if (effectiveKg <= 10) return "Estimated range: $80–$160";
    return "Estimated range: $160+ (depends on route & courier)";
  }

  async function send() {
    setErr(null);

    const text = input.trim();
    if (!text || loading) return;

    // Extra guard: don’t double-submit during flow
    if (flow !== "none" && loading) return;

    // ✅ FLOW HANDLER (free, local, no API needed)
    if (flow === "track") {
      setMessages((prev) => [...prev, { role: "user", content: text }]);
      setInput("");

      // Step 1: courier
      if (!trackData.courier) {
        setTrackData({ courier: text });
        addAssistant("Great. Now send the tracking number.");
        return;
      }

      // Step 2: tracking number
      if (!trackData.trackingNumber) {
        const courier = trackData.courier;
        const trackingNumber = text;

        setTrackData({ ...trackData, trackingNumber });

        addAssistant(
          `✅ Got it.\nCourier: ${courier}\nTracking #: ${trackingNumber}\n\n(In free demo mode I can’t fetch live carrier updates.)\nIf you paste the latest status text, I can explain what it means.`
        );

        setFlow("none");
        return;
      }
    }

    if (flow === "quote") {
      setMessages((prev) => [...prev, { role: "user", content: text }]);
      setInput("");

      // Step 1: origin + destination
      if (!quoteData.origin || !quoteData.destination) {
        const kv = parseKeyValueLine(text);
        const origin = kv["origin"] || quoteData.origin;
        const destination = kv["destination"] || quoteData.destination;

        setQuoteData((prev) => ({ ...prev, origin, destination }));

        if (!origin || !destination) {
          addAssistant("Please reply like: Origin: UAE Dubai, Destination: Uganda Kampala");
          return;
        }

        addAssistant("Nice. What is the actual weight (kg)? (Example: 3.2)");
        return;
      }

      // Step 2: weight
      if (!quoteData.weightKg) {
        setQuoteData((prev) => ({ ...prev, weightKg: text }));
        addAssistant("Now send box dimensions in cm as: 30x20x15");
        return;
      }

      // Step 3: dimensions + calculate
      const cleaned = text.toLowerCase().replace(/\s/g, "");
      const match = cleaned.match(/^(\d+(\.\d+)?)x(\d+(\.\d+)?)x(\d+(\.\d+)?)$/);

      if (!match) {
        addAssistant("Please send dimensions like: 30x20x15 (cm)");
        return;
      }

      const L = Number(match[1]);
      const W = Number(match[3]);
      const H = Number(match[5]);

      const actual = Number(quoteData.weightKg);
      const vol = calcVolumetricWeightKg(L, W, H, 5000);
      const chargeable = Math.max(actual, vol);

      const estimate = roughPriceEstimate(chargeable);

      addAssistant(
        `✅ Quote summary:\nOrigin: ${quoteData.origin}\nDestination: ${quoteData.destination}\nActual weight: ${actual.toFixed(
          2
        )} kg\nVolumetric weight: ${vol.toFixed(2)} kg\nChargeable weight: ${chargeable.toFixed(
          2
        )} kg\n\n${estimate}\n\nWant Express or Economy?`
      );

      setQuoteData({});
      setFlow("none");
      return;
    }

    // Normal API chat
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, userContext }),
      });

      const data = await res.json();

      if (data?.mode) setMode(data.mode);

      if (!res.ok) {
        throw new Error(data?.error || "Failed to get response");
      }

      const replyText =
        data?.reply ?? data?.message ?? data?.content ?? "Sorry, I didn’t get that. Try again.";

      setMessages((prev) => [...prev, { role: "assistant", content: String(replyText) }]);
    } catch (e: any) {
      setErr(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`${styles.backdrop} ${open && !isClosing ? styles.backdropIn : styles.backdropOut}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        className={`${styles.panel} ${open && !isClosing ? styles.panelIn : styles.panelOut}`}
        role="dialog"
        aria-modal="true"
        aria-label="AI Chat"
        tabIndex={-1}
        ref={panelRef}
      >
        <div className={styles.header}>
          <div className={styles.titleWrap}>
            <div className={styles.title}>
              AI Assistant
              {mode === "demo" && <span className={styles.demoBadge}>Demo</span>}
            </div>
            <div className={styles.subtitle}>Ask anything about shipping, pricing, tracking…</div>
          </div>

          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close chat"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18" />
              <path d="M6 6 18 18" />
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.quickActions}>
            <button type="button" className={styles.quickBtn} onClick={startTrackFlow}>
              Track shipment
            </button>

            <button type="button" className={styles.quickBtn} onClick={startQuoteFlow}>
              Price estimate
            </button>

            <button
              type="button"
              className={styles.quickBtn}
              onClick={() => {
                setInput("How long will delivery take?");
                setTimeout(() => inputRef.current?.focus(), 0);
              }}
            >
              Delivery time
            </button>

            <button
              type="button"
              className={styles.quickBtn}
              onClick={() => {
                setInput("Explain customs/VAT and duties");
                setTimeout(() => inputRef.current?.focus(), 0);
              }}
            >
              Customs / VAT
            </button>

            {flow !== "none" && (
              <button
                type="button"
                className={styles.quickBtn}
                onClick={() => {
                  setFlow("none");
                  setTrackData({});
                  setQuoteData({});
                  addAssistant("✅ Cancelled. What would you like to do next?");
                  setTimeout(() => inputRef.current?.focus(), 0);
                }}
              >
                Cancel
              </button>
            )}
          </div>

          <div className={styles.messages}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`${styles.bubbleRow} ${
                  m.role === "user" ? styles.userRow : styles.assistantRow
                }`}
              >
                <div
                  className={`${styles.bubble} ${
                    m.role === "user" ? styles.userBubble : styles.assistantBubble
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className={`${styles.bubbleRow} ${styles.assistantRow}`}>
                <div className={`${styles.bubble} ${styles.assistantBubble}`}>
                  <span className={styles.typing}>
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                  </span>
                </div>
              </div>
            )}

            {err && <div className={styles.error}>{err}</div>}

            <div ref={endRef} />
          </div>

          <div className={styles.inputBar}>
            <textarea
              ref={inputRef}
              className={styles.input}
              placeholder="Type your message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              disabled={loading}
            />

            <button
              type="button"
              className={styles.sendBtn}
              onClick={send}
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
