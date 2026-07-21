import { useChatStream } from "../hooks/useChatStream";
import Composer from "./Composer";
import MessageList from "./MessageList";

function ChatPanel() {
  const { messages, loading, error, sendQuestion } = useChatStream();

  return (
    <>
      <MessageList messages={messages} loading={loading} />
      {error && <div className="error">{error}</div>}
      <Composer onSend={sendQuestion} />
    </>
  );
}

export default ChatPanel;
