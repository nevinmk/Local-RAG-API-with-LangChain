import { useState } from "react";

interface Source {
  source: string;
  content: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendQuestion(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setQuestion("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer, sources: data.sources },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role}`}>
            <span className="role">
              {m.role === "user" ? "You" : "Assistant"}
            </span>
            <p>{m.content}</p>
            {m.sources && m.sources.length > 0 && (
              <div className="sources">
                <span className="sources-label">Sources</span>
                <ul>
                  {m.sources.map((s, j) => (
                    <li key={j}>
                      <span className="source-name">{s.source}</span>
                      <span className="source-snippet">{s.content}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
        {loading && <div className="message assistant pending">Thinking…</div>}
      </div>

      {error && <div className="error">{error}</div>}

      <form onSubmit={sendQuestion} className="composer">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !question.trim()}>
          Send
        </button>
      </form>
    </>
  );
}

export default ChatPanel;
