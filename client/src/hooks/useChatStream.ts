import { useRef, useState } from "react";
import type { Message } from "../types/chat";

export function useChatStream() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // One id per browser tab so /ask/stream can look up this conversation's
  // history; a plain useState would work too, but a ref avoids a pointless
  // re-render on mount just to assign it.
  const sessionId = useRef(crypto.randomUUID());

  // Whether a question is currently streaming; a ref (not state) since only
  // sendQuestion needs to read it synchronously, not the render.
  const activeRef = useRef(false);

  async function runQuestion(q: string) {
    activeRef.current = true;
    setLoading(true);
    setError(null);

    // Empty assistant bubble that streamed tokens get appended into.
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/ask/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, sessionId: sessionId.current }),
      });
      if (!res.ok || !res.body) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // SSE frames are separated by a blank line; the last split piece
        // may be a partial frame still waiting on more bytes, so hold it
        // back in the buffer instead of parsing it.
        const frames = buffer.split("\n\n");
        buffer = frames.pop() ?? "";

        for (const frame of frames) {
          const line = frame.trim();
          if (!line.startsWith("data: ")) continue;
          const payload = JSON.parse(line.slice("data: ".length));

          if (typeof payload.token === "string") {
            setMessages((prev) => {
              const next = [...prev];
              const last = next[next.length - 1];
              next[next.length - 1] = {
                ...last,
                content: last.content + payload.token,
              };
              return next;
            });
          }

          if (payload.done) {
            setMessages((prev) => {
              const next = [...prev];
              next[next.length - 1] = {
                ...next[next.length - 1],
                sources: payload.sources,
              };
              return next;
            });
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      activeRef.current = false;
      setLoading(false);
    }
  }

  // Returns false (and leaves the caller's input untouched) if a question is
  // already streaming, so callers know not to clear their input.
  function sendQuestion(question: string): boolean {
    const trimmed = question.trim();
    if (!trimmed) return false;

    if (activeRef.current) {
      setError("Wait for the current question to finish.");
      return false;
    }

    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    runQuestion(trimmed);
    return true;
  }

  return { messages, loading, error, sendQuestion };
}
