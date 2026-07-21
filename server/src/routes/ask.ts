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
