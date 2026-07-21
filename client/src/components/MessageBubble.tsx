import { useState } from "react";
import type { Message } from "../types/chat";

interface Props {
  message: Message;
  // True while this bubble is the one currently streaming, so an empty
  // `content` renders a placeholder instead of a blank bubble.
  isStreaming: boolean;
}

const VISIBLE_SOURCES = 3;

function DocumentIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M5.833 2.5h5.244c.331 0 .649.132.883.366l2.674 2.674c.234.234.366.552.366.883V17.5a.833.833 0 0 1-.833.833H5.833A.833.833 0 0 1 5 17.5v-14a.833.833 0 0 1 .833-.833Z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MessageBubble({ message, isStreaming }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (message.role === "user") {
    return (
      <div className="message message-user">
        <p>{message.content}</p>
      </div>
    );
  }

  const sources = message.sources ?? [];
  const visibleSources = expanded ? sources : sources.slice(0, VISIBLE_SOURCES);
  const hiddenCount = sources.length - visibleSources.length;

  return (
    <div className="answer-card">
      <span className="answer-label">Answer</span>
      <p className="answer-content">
        {message.content || (isStreaming ? "…" : "")}
      </p>

      {sources.length > 0 && (
        <div className="sources">
          <span className="sources-label">Sources</span>
          <ul>
            {visibleSources.map((s, i) => (
              <li key={i}>
                <span className="source-icon">
                  <DocumentIcon />
                </span>
                <span className="source-text">
                  <span className="source-name">{s.source}</span>
                  <span className="source-snippet">{s.content}</span>
                </span>
              </li>
            ))}
          </ul>
          {hiddenCount > 0 && (
            <button
              type="button"
              className="sources-toggle"
              onClick={() => setExpanded(true)}
            >
              View all sources ({sources.length})
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default MessageBubble;
