import express from "express";
import { chatRouter } from "./routes/chat.js";
import { ingestRouter } from "./routes/ingest.js";

const app = express();
app.use(express.json());

// Mount the chat route
app.use("/chat", chatRouter);
app.use("/ingest", ingestRouter);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
