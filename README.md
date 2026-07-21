# Local RAG API with LangChain

A locally-run chat API built with Express, LangChain, and Ollama — no cloud LLM
calls, no API keys. ChromaDB runs alongside it for future document retrieval
(RAG).

## Architecture

```
┌─────────────┐        ┌──────────────┐        ┌───────────────┐
│   client/   │  HTTP  │   server/    │  HTTP  │     Ollama     │
│ React + Vite│ ─────► │ Express + TS │ ─────► │  (local LLM)   │
│  :5173      │        │    :3000     │        │    :11434      │
└─────────────┘        └──────┬───────┘        └───────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │   ChromaDB   │
                        │ (vector db)  │
                        │    :8000     │
                        └──────────────┘
```

- **`client/`** — React + Vite single-page chat UI. Sends `POST /chat`
  requests; Vite's dev server proxies `/chat` to the backend so there's no
  CORS setup needed in dev ([vite.config.ts](client/vite.config.ts)).
- **`server/`** — Express + TypeScript API. Builds a LangChain prompt
  (system + user message), sends it to a local Ollama model via
  `ChatOllama`, and returns the plain-text answer as JSON
  ([chat.ts](server/src/routes/chat.ts)).
- **Ollama** — runs the LLM itself (`llama3.1` by default) locally. The
  server talks to it over HTTP; it isn't a dependency you `npm install`.
- **ChromaDB** — a vector database, run via Docker
  ([docker-compose.yml](docker-compose.yml)), for storing document
  embeddings. Not yet wired into the chat endpoint — see **Status** below.

## Prerequisites

- **Node.js** (v20+ recommended)
- **[Ollama](https://ollama.com)** installed and running, with a chat model
  pulled:
  ```
  ollama pull llama3.1
  ```
- **Docker** (only needed once ChromaDB is actually used by the app)

## Running the app

From the repo root:

```
npm install       # installs concurrently (root dev-runner)
npm run dev
```

This starts the backend (`:3000`) and frontend (`:5173`) together, with
`[server]`/`[client]` prefixed logs. Open **http://localhost:5173** to chat.

`Ctrl+C` stops both.

Ollama isn't included in that script — most installs auto-start an Ollama
background service/tray app on boot. If yours isn't running, start it
separately with `ollama serve` before using the chat UI.

### Running services individually

```
cd server && npm install && npm run dev   # API on :3000
cd client && npm install && npm run dev   # UI on :5173
docker compose up -d                      # ChromaDB on :8000
```

## Status

This project follows a step-by-step tutorial and is a work in progress:

- ✅ Ollama + ChromaDB + TypeScript project set up
- ✅ Naive chat endpoint (`POST /chat`) — no document retrieval yet
- ⬜ Ingest documents into ChromaDB (`server/docs/`)
- ⬜ Retrieval chain with cited sources
- ⬜ Streamed responses (SSE) + conversation history
- ⬜ PDF document support

The `server/docs/` folder holds sample documents for the upcoming ingestion
step; nothing reads them yet.
