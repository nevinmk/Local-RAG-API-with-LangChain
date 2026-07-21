import { useRef, useState } from "react";
import type { IngestedSource } from "../types/ingest";

interface Props {
  onIngested: (source: IngestedSource) => void;
}

function IngestForm({ onIngested }: Props) {
  const [directory, setDirectory] = useState("docs");
  const [ingesting, setIngesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const directoryPickerRef = useRef<HTMLInputElement>(null);

  function handleDirectoryPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    // Browsers don't expose the real filesystem path for picked folders,
    // only a relative one — use its top segment as a starting point and
    // let the user confirm/complete the full server-side path.
    const relativePath = (files[0] as File & { webkitRelativePath?: string })
      .webkitRelativePath;
    const folderName = relativePath?.split("/")[0];
    if (folderName) setDirectory(folderName);
    e.target.value = "";
  }

  async function ingestDirectory(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = directory.trim();
    if (!trimmed || ingesting) return;

    setIngesting(true);
    setError(null);

    try {
      const res = await fetch("/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ directory: trimmed }),
      });
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      onIngested({ directory: data.directory, files: data.files });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIngesting(false);
    }
  }

  return (
    <form onSubmit={ingestDirectory} className="ingest-form">
      <input
        type="text"
        value={directory}
        onChange={(e) => setDirectory(e.target.value)}
        placeholder="Path to a directory of .md files"
        disabled={ingesting}
      />
      <input
        type="file"
        ref={directoryPickerRef}
        onChange={handleDirectoryPicked}
        // @ts-expect-error non-standard attributes for directory selection
        webkitdirectory=""
        directory=""
        hidden
      />
      <div className="ingest-form-actions">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => directoryPickerRef.current?.click()}
          disabled={ingesting}
        >
          Browse…
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={ingesting || !directory.trim()}
        >
          {ingesting ? "Ingesting…" : "Ingest"}
        </button>
      </div>
      {error && <div className="error">{error}</div>}
    </form>
  );
}

export default IngestForm;
