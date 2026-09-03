<div align="center">

# Arfa AI

**A premium personal AI companion for ideas, learning, building, and innovation.**

![Status](https://img.shields.io/badge/status-Active%20Development-2ea44f?style=flat-square)
![React](https://img.shields.io/badge/React%2019-TypeScript-3178c6?style=flat-square)
![Node](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square)

</div>

> **Status: 🟢 Active** — Arfa AI is under active development. Features, fixes, and improvements are shipped on an ongoing basis.

---

**Arfa AI** is a production-grade, full-stack personal AI assistant. It pairs a curated AI persona — **Arfa** — with a polished rose-inspired interface, streaming multi-model responses, modular long-term memory, persistent conversations, and secure multi-user authentication. The frontend is **React 19 + TypeScript**; the backend is **Express + TypeScript** with server-side streaming from **Google Gemini** and **OpenAI**.

## Core Features

- **AI Engine** — Token-by-token SSE streaming, multi-model support (Gemini 3.8 Flash, Gemini 3.1 Flash Lite, OpenAI GPT-4o), automatic provider failover, GFM Markdown with syntax-highlighted code.
- **Memory & Personalization** — Curated Arfa knowledge profile ([server/ai/arfaProfile.ts](server/ai/arfaProfile.ts)), long-term memory, and per-user settings for model, temperature, voice, and custom instructions.
- **Conversations** — Persistent history (Today / Previous 7 Days / Older), search, rename, delete, and auto-generated titles.
- **Security & Privacy** — Email/password auth with hashed passwords and signed sessions, isolated guest sessions, JSON export, rate limiting, and per-user usage analytics.
- **Experience** — Refined rose editorial design system with Light / Dark / System themes, landing view, responsive sidebar, and keyboard shortcuts.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19 · TypeScript · Vite · Tailwind CSS 4 · Motion |
| Backend | Node.js · Express 4 · Server-Sent Events (SSE) |
| AI Providers | Google Gemini · OpenAI (optional / failover) |
| Persistence | JSON data store ([data/arfa-store.json](data/arfa-store.json)) |

## Quick Start

```bash
npm install                # install dependencies
cp .env.example .env       # configure API keys (or set env vars)
npm run dev                # start development server (hot reload)
```

### Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key |
| `OPENAI_API_KEY` | — | OpenAI key (enables GPT-4o routing & failover) |
| `OPENAI_MODEL` | — | OpenAI model (defaults to `gpt-4o`) |
| `DEFAULT_MODEL_PROVIDER` | — | Default provider: `gemini` or `openai` |
| `SESSION_SECRET` | — | Secret for signing session tokens |
| `APP_URL` | — | Public base URL for callbacks |

### Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server (hot reload) |
| `npm run build` | Production build (frontend + server) |
| `npm start` | Run the production server |
| `npm run lint` | Type-check the codebase (`tsc --noEmit`) |

## Contributing

Arfa AI is an evolving project. Suggestions, feedback, and feature ideas are welcome — the project is actively maintained and improved.

---

**Status:** 🟢 **Active** — currently in development and actively worked on.
