import { useEffect, useRef } from "react";
import type { Message } from "../types/chat";
import MessageBubble from "./MessageBubble";

interface Props {
  messages: Message[];
  loading: boolean;
}

function MessageList({ messages, loading }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // A ref (not state) because scroll fires far more often than we want
  // re-renders, and we only ever need the latest value when messages change.
  const isAtBottomRef = useRef(true);

  function handleScroll() {
    const el = containerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isAtBottomRef.current = distanceFromBottom < 24;
  }

  // Runs on every message list change, including each streamed token, since
  // that's a new array reference. Only follow the stream to the bottom if
  // the user hasn't scrolled away from it themselves.
  useEffect(() => {
    if (!isAtBottomRef.current) return;
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <div className="messages" ref={containerRef} onScroll={handleScroll}>
      {messages.map((m, i) => (
        <MessageBubble
          key={i}
          message={m}
          isStreaming={loading && i === messages.length - 1}
        />
      ))}
    </div>
  );
}

export default MessageList;
