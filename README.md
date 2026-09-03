<div align="center">

# Arfa AI

**A premium personal AI companion for ideas, learning, building, and innovation.**

</div>

> A production-grade, full-stack personal AI assistant featuring a sophisticated rose-inspired interface, streaming multi-model responses, modular long-term memory, persistent conversations, and secure multi-user authentication.

---

## About

Arfa AI is a premium web-based personal AI companion that pairs a curated AI identity — **Arfa** — with a polished, editorial-grade chat experience. Every response is grounded in a structured knowledge profile covering Arfa's core values, interests, learning journey, featured projects, and communication style (see [`server/ai/arfaProfile.ts`](server/ai/arfaProfile.ts)).

The application is built on a **React 19 + TypeScript** frontend and an **Express + TypeScript** backend. It delivers server-side streaming responses from **Google Gemini** and **OpenAI** with seamless provider failover, persistent per-user conversation history, a modular long-term memory system, and complete privacy controls — all presented in an elegant, responsive rose-themed interface with Light, Dark, and System modes.

## Core Features

### AI Engine & Chat
- Token-by-token streaming via Server-Sent Events (SSE)
- Multi-model support: **Gemini 3.8 Flash**, **Gemini 3.1 Flash Lite**, and **OpenAI GPT-4o**
- Automatic failover between providers for uninterrupted responses
- GitHub-flavored Markdown rendering with syntax-highlighted code blocks
- File & image attachments, voice input (Web Speech API), and on-demand stream stop

### Memory & Personalization
- Curated **Arfa knowledge profile** keeps responses authentic and consistent
- Long-term memory across preferences, facts, projects, and instructions
- Per-user settings: model & provider, temperature, voice, and custom instructions

### Conversations
- Persistent history organized by **Today / Previous 7 Days / Older**
- Search, rename, delete, and one-click new conversation
- Auto-generated titles from your first message

### Security, Privacy & Data
- Email/password authentication with salted & hashed passwords and signed session tokens
- Isolated guest sessions with zero cross-user data sharing
- Full data ownership: JSON **export**, clear/delete conversations, and memory management
- Rate limiting and per-user usage analytics (requests, tokens, model history)

### Experience & Design
- Refined rose **soft editorial** design system — Light / Dark / System themes
- Landing view, responsive sidebar, and keyboard shortcuts
- Motion-driven micro-interactions for a polished, premium feel

## Architecture

The Express server ([`server.ts`](server.ts)) exposes a REST + SSE API and serves the Vite-built SPA. Chat requests flow through the AI orchestration layer ([`server/ai/aiService.ts`](server/ai/aiService.ts)), which selects the active provider (Gemini or OpenAI), streams tokens back over SSE, and falls back across providers when needed. All user data — accounts, sessions, conversations, memories, settings, and usage metrics — persists to a JSON data store ([`server/db.ts`](server/db.ts)).

```
Browser (React 19 SPA)
          │  REST + SSE
          ▼
Express API  —  server.ts
          │
          ├── Auth & session management
          ├── Conversation & memory APIs
          └── AI orchestration  —  server/ai/
                 ├── systemPrompt + arfaProfile (persona)
                 ├── Gemini streaming client (primary)
                 └── OpenAI streaming client (optional / failover)
          │
          ▼
JSON data store  —  data/arfa-store.json
```

## Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19 · TypeScript · Vite · Tailwind CSS 4 · react-markdown · Motion · lucide-react |
| Backend | Node.js · Express 4 · TypeScript · Server-Sent Events (SSE) |
| AI Providers | Google Gemini (`@google/genai`) · OpenAI |
| Persistence | JSON data store ([`data/arfa-store.json`](data/arfa-store.json)) |

## Project Structure

```
.
├── server/
│   ├── ai/
│   │   ├── aiService.ts       # Provider routing & orchestration
│   │   ├── systemPrompt.ts    # Persona & system prompt builder
│   │   ├── arfaProfile.ts     # Curated Arfa knowledge profile
│   │   ├── geminiClient.ts    # Gemini streaming client
│   │   └── openaiClient.ts    # OpenAI streaming client
│   └── db.ts                  # Persistence layer
├── src/
│   ├── components/            # Chat, modals, sidebar, landing, UI
│   ├── lib/api.ts             # API client
│   ├── types.ts               # Shared domain types
│   └── App.tsx                # Root application
├── data/                      # JSON data store
├── server.ts                  # Express server + API routes
└── index.html
```

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key for AI responses |
| `OPENAI_API_KEY` | — | OpenAI API key (optional; enables GPT-4o routing & failover) |
| `OPENAI_MODEL` | — | OpenAI model name (defaults to `gpt-4o`) |
| `DEFAULT_MODEL_PROVIDER` | — | Default provider: `gemini` or `openai` |
| `SESSION_SECRET` | — | Secret used for signing session tokens |
| `APP_URL` | — | Public base URL for callbacks & self-referential links |

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server (Vite + Express, hot reload) |
| `npm run build` | Production build (frontend bundle + server) |
| `npm start` | Run the production server |
| `npm run lint` | Type-check the codebase (`tsc --noEmit`) |
| `npm run clean` | Remove build artifacts |
