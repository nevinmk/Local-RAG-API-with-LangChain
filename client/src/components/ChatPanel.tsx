import { useChatStream } from "../hooks/useChatStream";
import Composer from "./Composer";
import MessageList from "./MessageList";

function ChatPanel() {
  const { messages, loading, error, sendQuestion } = useChatStream();

  return (
    <div className="chat-panel">
      <MessageList messages={messages} loading={loading} />
      {error && <div className="error error-composer">{error}</div>}
      <Composer onSend={sendQuestion} />
    </div>
  );
}

export default ChatPanel;
