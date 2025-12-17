import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { shippingFAQ } from "@/data/shippingFAQ";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type ChatRole = "assistant" | "user";
type ChatMessage = { role: ChatRole; content: string };

function smartDemoReply(text: string) {
  const t = (text || "").toLowerCase();
  for (const item of shippingFAQ) {
    if (item.keywords.some((k) => t.includes(k))) return item.answer;
  }
  return "I can help with:\n• Tracking\n• Pricing\n• Delivery time\n• Customs/VAT\n\nType: “track my shipment” or “price estimate”.";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const messages = req.body?.messages as ChatMessage[];
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Missing messages array" });
  }

  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content || "";

  // ✅ FREE MODE if no key
  if (!process.env.OPENAI_API_KEY) {
    return res.status(200).json({ reply: smartDemoReply(lastUser), mode: "demo" });
  }

  // ✅ PAID MODE later (auto)
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        { role: "system", content: "You are a helpful logistics assistant. Be concise and practical." },
        ...messages,
      ],
    });

    const reply =
      completion.choices?.[0]?.message?.content?.trim() || smartDemoReply(lastUser);

    return res.status(200).json({ reply, mode: "ai" });
  } catch (err: any) {
    // ✅ If quota exceeded / 429 / anything, fallback to demo
    return res.status(200).json({ reply: smartDemoReply(lastUser), mode: "demo" });
  }
}
