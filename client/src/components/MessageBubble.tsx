import type { Message } from "../types/chat";

interface Props {
  message: Message;
  // True while this bubble is the one currently streaming, so an empty
  // `content` renders a placeholder instead of a blank bubble.
  isStreaming: boolean;
}

function MessageBubble({ message, isStreaming }: Props) {
  return (
    <div className={`message ${message.role}`}>
      <span className="role">
        {message.role === "user" ? "You" : "Assistant"}
      </span>
      <p>{message.content || (isStreaming ? "…" : "")}</p>
      {message.sources && message.sources.length > 0 && (
        <div className="sources">
          <span className="sources-label">Sources</span>
          <ul>
            {message.sources.map((s, i) => (
              <li key={i}>
                <span className="source-name">{s.source}</span>
                <span className="source-snippet">{s.content}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default MessageBubble;
