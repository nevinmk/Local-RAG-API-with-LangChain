import { useRef, useState } from "react";

interface Props {
  // Returns whether the question was accepted (started or queued). Returning
  // false (e.g. the queue is already full) leaves the input text in place
  // instead of clearing it.
  onSend: (question: string) => boolean;
}

function Composer({ onSend }: Props) {
  const [question, setQuestion] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) return;

    if (onSend(trimmed)) {
      setQuestion("");
    }
    // Always return focus to the input, whether the question was accepted
    // or rejected, so the user can keep typing without reaching for the
    // mouse.
    inputRef.current?.focus();
  }

  return (
    <form onSubmit={handleSubmit} className="composer">
      <input
        ref={inputRef}
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask a question about your documents…"
      />
      <button type="submit" className="btn btn-primary" disabled={!question.trim()}>
        Send
      </button>
    </form>
  );
}

export default Composer;
