import "./App.css";
import IngestForm from "./components/IngestForm";
import ChatPanel from "./components/ChatPanel";

function App() {
  return (
    <div className="chat">
      <h1>Local RAG Chat</h1>
      <IngestForm />
      <ChatPanel />
    </div>
  );
}

export default App;
