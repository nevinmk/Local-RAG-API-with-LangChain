import { Router } from "express";
import { ChatOllama } from "@langchain/ollama";
import { OllamaEmbeddings } from "@langchain/ollama";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { Document } from "@langchain/core/documents";

export const askRouter = Router();

// Same models as the ingest step
const model = new ChatOllama({ model: "llama3.1", temperature: 0 });
const embeddings = new OllamaEmbeddings({ model: "nomic-embed-text" });

const chatHistory: Map<string, { role: string; content: string }[]> = new Map();

askRouter.post("/stream", async (req, res) => {
  const { question, sessionId = "default" } = req.body;

  // Tell the client to expect a stream, not a single JSON response
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Retrieve relevant chunks from ChromaDB
  const retriever = await getRetriever();
  const retrievedDocs = await retriever.invoke(question);

  // Load any prior conversation for this session
  const history = chatHistory.get(sessionId) || [];
  const historyText = history
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join("\n");

  // Build a prompt that includes context AND chat history
  const promptWithHistory = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are a helpful assistant. Answer the question based ONLY on the following context. If the context does not contain the answer, say "I don't have that information in my documents."

        Context:
        {context}

        Chat History:
        {history}`,
    ],
    ["human", "{question}"],
  ]);

  const chain = promptWithHistory.pipe(model).pipe(new StringOutputParser());

  // Stream tokens one at a time to the client
  let fullAnswer = "";
  const stream = await chain.stream({
    context: formatDocs(retrievedDocs),
    question,
    history: historyText,
  });

  for await (const chunk of stream) {
    fullAnswer += chunk;
    res.write(`data: ${JSON.stringify({ token: chunk })}\n\n`);
  }

  // Send sources as a final SSE event and close the connection
  const sources = retrievedDocs.map((doc) => ({
    source: doc.metadata.source,
    content: doc.pageContent.slice(0, 150) + "...",
  }));

  res.write(`data: ${JSON.stringify({ done: true, sources })}\n\n`);
  res.end();

  // Store this exchange for future follow-up questions
  history.push({ role: "human", content: question });
  history.push({ role: "assistant", content: fullAnswer });
  chatHistory.set(sessionId, history);
});

// Instruct the model to ONLY use provided context
const RAG_PROMPT = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a helpful assistant. Answer the question based ONLY on the following context. If the context does not contain the answer, say "I don't have that information in my documents."

Context:
{context}`,
  ],
  ["human", "{question}"],
]);

// Join retrieved document chunks into a single context string
function formatDocs(docs: Document[]): string {
  return docs.map((doc) => doc.pageContent).join("\n\n");
}

// Connect to existing ChromaDB collection
async function getRetriever() {
  const vectorStore = await Chroma.fromExistingCollection(embeddings, {
    collectionName: "documents",
    url: "http://localhost:8000",
  });
  return vectorStore.asRetriever({ k: 3 });
}

askRouter.post("/", async (req, res) => {
  const { question } = req.body;

  // Retrieve the 3 most relevant chunks
  const retriever = await getRetriever();
  const retrievedDocs = await retriever.invoke(question);

  // Build the LCEL chain: prompt -> model -> output
  const chain = RAG_PROMPT.pipe(model).pipe(new StringOutputParser());
  const answer = await chain.invoke({
    context: formatDocs(retrievedDocs),
    question,
  });

  // Extract source metadata from retrieved docs
  const sources = retrievedDocs.map((doc) => ({
    source: doc.metadata.source,
    content: doc.pageContent.slice(0, 150) + "...",
  }));

  res.json({ answer, sources });
});
