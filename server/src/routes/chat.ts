import { Router } from "express";
import { ChatOllama } from "@langchain/ollama";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

export const chatRouter = Router();

// Initialize the LLM with deterministic output (temperature 0)
const model = new ChatOllama({ model: "llama3.1", temperature: 0 });
// Define system instruction and user message slot
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant. Answer the user's question."],
  ["human", "{question}"],
]);
// Chain: prompt -> model -> parse output as plain string
const chain = prompt.pipe(model).pipe(new StringOutputParser());

chatRouter.post("/", async (req, res) => {
  const { question } = req.body;
  const answer = await chain.invoke({ question });
  console.log("debug: answer ->", answer);

  res.json({ answer });
});
