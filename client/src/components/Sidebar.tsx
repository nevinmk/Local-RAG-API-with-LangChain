import { useState } from "react";
import type { IngestedSource } from "../types/ingest";
import IngestForm from "./IngestForm";

function Sidebar() {
  const [source, setSource] = useState<IngestedSource | null>(null);
  const [showForm, setShowForm] = useState(true);

  function handleIngested(result: IngestedSource) {
    setSource(result);
    setShowForm(false);
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span>Sources</span>
        <button
          type="button"
          className="icon-btn"
          aria-label={showForm ? "Hide ingest form" : "Add source"}
          aria-expanded={showForm}
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? "−" : "+"}
        </button>
      </div>

      {source && (
        <div className="source-card">
          <span className="source-card-icon" aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="none">
              <path
                d="M2.5 5.833A1.667 1.667 0 0 1 4.167 4.167h3.196c.317 0 .621.126.845.35l1.125 1.124a1.2 1.2 0 0 0 .845.35h5.155a1.667 1.667 0 0 1 1.667 1.666v6.667a1.667 1.667 0 0 1-1.667 1.667H4.167A1.667 1.667 0 0 1 2.5 14.167z"
                stroke="currentColor"
                strokeWidth="1.35"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div className="source-card-body">
            <span className="source-card-name">{source.directory}</span>
            <span className="source-card-meta">
              {source.files} {source.files === 1 ? "file" : "files"}
            </span>
          </div>
        </div>
      )}

      {showForm && <IngestForm onIngested={handleIngested} />}

      {!source && !showForm && (
        <p className="sidebar-empty">No documents ingested yet.</p>
      )}
    </aside>
  );
}

export default Sidebar;
