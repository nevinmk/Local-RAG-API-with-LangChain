import express from "express";
import { chatRouter } from "./routes/chat.js";
import { ingestRouter } from "./routes/ingest.js";
import { askRouter } from "./routes/ask.js";

const app = express();
app.use(express.json());

// Mount the chat route
app.use("/chat", chatRouter);
app.use("/ingest", ingestRouter);
app.use("/ask", askRouter);

const PORT = 3000;

// On Windows, tsx watch's restart doesn't reliably free the port before the
// new process binds, so a save can briefly race the just-killed old process.
// Retry instead of letting that transient EADDRINUSE crash the process.
function startServer() {
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.log(`Port ${PORT} still in use, retrying...`);
      setTimeout(startServer, 300);
    } else {
      throw err;
    }
  });
}

startServer();
