import { Router } from "express";
import { ChatOllama } from "@langchain/ollama";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

export const chatRouter = Router();

// Initialize the LLM with deterministic output (temperature 0).
// ChatOllama connects to a locally running Ollama server (default http://localhost:11434)
// and targets the "llama3.1" model that must already be pulled there.
const model = new ChatOllama({ model: "llama3.1", temperature: 0 });

// Define system instruction and user message slot.
// ChatPromptTemplate builds the list of messages sent to the model:
// a fixed "system" message (sets the assistant's behavior) plus a "human"
// message containing the {question} placeholder, filled in at invoke time.
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant. Answer the user's question."],
  ["human", "{question}"],
]);

// Chain: prompt -> model -> parse output as plain string.
// .pipe() wires the steps together (LangChain Expression Language / LCEL):
// 1. prompt formats the input into chat messages
// 2. model sends those messages to Ollama and gets back an AIMessage
// 3. StringOutputParser extracts just the text content from that AIMessage
const chain = prompt.pipe(model).pipe(new StringOutputParser());

chatRouter.post("/", async (req, res) => {
  // Pull the user's question out of the JSON request body.
  const { question } = req.body;

  // Run the full chain: fills the prompt template, calls the model,
  // and awaits the parsed string answer.
  const answer = await chain.invoke({ question });

  // Send the answer back to the client as JSON: { answer: "..." }.
  res.json({ answer });
});
