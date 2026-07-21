import { useRef, useState } from "react";

function IngestForm() {
  const [directory, setDirectory] = useState("docs");
  const [ingesting, setIngesting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
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
    setStatus(null);

    try {
      const res = await fetch("/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ directory: trimmed }),
      });
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      setStatus(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIngesting(false);
    }
  }

  return (
    <>
      <form onSubmit={ingestDirectory} className="ingest">
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
        <button
          type="button"
          onClick={() => directoryPickerRef.current?.click()}
          disabled={ingesting}
        >
          Browse…
        </button>
        <button type="submit" disabled={ingesting || !directory.trim()}>
          {ingesting ? "Ingesting…" : "Ingest"}
        </button>
      </form>
      {status && <div className="ingest-status">{status}</div>}
      {error && <div className="error">{error}</div>}
    </>
  );
}

export default IngestForm;
