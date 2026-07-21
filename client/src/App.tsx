import "./App.css";
import Sidebar from "./components/Sidebar";
import ChatPanel from "./components/ChatPanel";
import { useTheme } from "./hooks/useTheme";

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">
        <header className="topbar">
          <h1>Local RAG Chat</h1>
          <button
            type="button"
            className="icon-btn theme-toggle"
            aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
            onClick={toggleTheme}
          >
            {theme === "light" ? (
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M17.5 10.87A7.5 7.5 0 0 1 9.13 2.5a7.5 7.5 0 1 0 8.37 8.37Z"
                  stroke="currentColor"
                  strokeWidth="1.35"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="3.75" stroke="currentColor" strokeWidth="1.35" />
                <path
                  d="M10 2.5v1.67M10 15.83V17.5M4.4 4.4l1.18 1.18M14.42 14.42l1.18 1.18M2.5 10h1.67M15.83 10h1.67M4.4 15.6l1.18-1.18M14.42 5.58l1.18-1.18"
                  stroke="currentColor"
                  strokeWidth="1.35"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </header>
        <ChatPanel />
      </main>
    </div>
  );
}

export default App;
