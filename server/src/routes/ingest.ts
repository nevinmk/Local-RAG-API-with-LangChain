import { Router } from "express";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OllamaEmbeddings } from "@langchain/ollama";
import { Chroma } from "@langchain/community/vectorstores/chroma";

export const ingestRouter = Router();

// Configure the embedding model for vector generation
const embeddings = new OllamaEmbeddings({ model: "nomic-embed-text" });

ingestRouter.post("/", async (req, res) => {
  const { directory } = req.body;

  try {
    // Read all Markdown files from the specified directory
    const files = readdirSync(directory).filter((f) => f.endsWith(".md"));
    const docs: Document[] = [];

    for (const file of files) {
      const content = readFileSync(join(directory, file), "utf-8");
      docs.push(
        new Document({ pageContent: content, metadata: { source: file } }),
      );
    }

    // Split documents into chunks for better retrieval accuracy
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const chunks = await splitter.splitDocuments(docs);

    // Generate embeddings and store in ChromaDB
    await Chroma.fromDocuments(chunks, embeddings, {
      collectionName: "documents",
      url: "http://localhost:8000",
    });

    res.json({
      message: `Ingested ${chunks.length} chunks from ${files.length} files`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ingestion failed";
    res.status(400).json({ error: message });
  }
});
