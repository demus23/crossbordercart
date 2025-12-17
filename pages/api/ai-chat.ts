import type { NextApiRequest, NextApiResponse } from "next";

type ChatRole = "assistant" | "user";

type ChatMessage = { role: ChatRole; content: string };

type RequestBody = { messages: ChatMessage[] };

type ResponseBody = { aiMessage: string } | { error: string };

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseBody>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body as RequestBody;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Missing messages array." });
    }

    const lastUser =
      [...messages].reverse().find((m) => m.role === "user")?.content ??
      "nothing";

    const reply = `Test reply from server: you said “${lastUser}”.`;

    return res.status(200).json({ aiMessage: reply });
  } catch (err: any) {
    console.error("AI /chat error:", err);
    return res
      .status(500)
      .json({ error: err?.message || "Internal server error." });
  }
}
