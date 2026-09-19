<div align="center">

# 🌹 Arfa AI

**A premium personal AI companion for ideas, learning, building, and innovation.**

![Status](https://img.shields.io/badge/Status-Completed-2ea44f?style=flat-square)
![React](https://img.shields.io/badge/React%2019-TypeScript-3178c6?style=flat-square)
![Node](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-arfa-ai.ai.studio-EC4899?style=flat-square)](https://arfa-ai.ai.studio)

</div>

> **Status: ✅ Completed** — Arfa AI is fully built and live at **[arfa-ai.ai.studio](https://arfa-ai.ai.studio)**.

---

## Overview

**Arfa AI** is a production-grade, full-stack AI chat board. It pairs a curated AI persona — **Arfa** — with a polished rose-inspired interface, sub-3-second token streaming, multimodal generation, modular long-term memory, persistent conversations, and secure multi-user authentication.

- **Frontend:** React 19 · TypeScript · Vite · Tailwind CSS · Motion
- **Backend:** Express · TypeScript · Server-Sent Events (SSE)
- **AI:** Google Gemini (server-side) · OpenAI (failover) · Veo video · Imagen image

## 🔗 Live Demo

> ### **[arfa-ai.ai.studio](https://arfa-ai.ai.studio)**
>
> The chat board is deployed and publicly accessible — try it now.

## ✨ Core Features

**AI Chat Engine**
- Token-by-token SSE streaming with sub-3-second first response
- Multi-model support (Gemini Flash family, GPT-4o) with automatic provider failover
- GFM Markdown rendering with syntax-highlighted code blocks

**Multimodal Creation**
- Image generation & editing (Imagen / Gemini Vision)
- Cinematic video generation (Google Veo) with async rendering & live progress
- Speech-to-text transcription for voice input
- File & document analysis right inside the conversation
- Auto-generated presentation decks (multi-language, RTL-aware)

**Memory & Personalization**
- Curated Arfa knowledge profile ([server/ai/arfaProfile.ts](server/ai/arfaProfile.ts))
- Long-term memory with automatic fact extraction & recall
- Per-user settings: model, temperature, voice input, custom instructions & persona

**Conversations & Accounts**
- Persistent history (Today / Previous 7 Days / Older) with search, rename & delete
- Auto-generated conversation titles
- Email/password + Google sign-in, hashed passwords, signed sessions, isolated guest sessions

**Security & Privacy**
- Rate limiting on auth, chat & media endpoints
- Security headers (CSP, nosniff, frame options, permissions policy)
- JSON export, per-user usage analytics & safe production logging

**Experience**
- Refined rose editorial design system · Light / Dark / System themes
- Living particle background · soft glassmorphism · custom luxury scrollbars
- Responsive sidebar & keyboard shortcuts · landing view

## 🛠 Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19 · TypeScript · Vite · Tailwind CSS 4 · Motion · lucide-react |
| Backend | Node.js · Express 4 · Server-Sent Events (SSE) · zod |
| AI Providers | Google Gemini · Google Veo · Imagen · OpenAI (optional / failover) |
| Persistence | JSON data store ([data/arfa-store.json](data/arfa-store.json)) · Supabase (optional) |
| Deployment | Netlify (serverless functions via [netlify.toml](netlify.toml)) |

## 🚀 Quick Start

```bash
npm install                # install dependencies
cp .env.example .env       # configure API keys (or set env vars)
npm run dev                # start development server (hot reload)
```

### Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key (server-side) |
| `OPENAI_API_KEY` | — | OpenAI key (enables GPT-4o routing & failover) |
| `OPENAI_MODEL` | — | OpenAI model (defaults to `gpt-4o`) |
| `DEFAULT_MODEL_PROVIDER` | — | Default provider: `gemini` or `openai` |
| `SESSION_SECRET` | — | Secret for signing session tokens |
| `APP_URL` | — | Public base URL for callbacks (e.g. `https://arfa-ai.ai.studio`) |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | — | Optional production cloud database |

### Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server (hot reload) |
| `npm run build` | Production build (frontend + server) |
| `npm start` | Run the production server |
| `npm test` | Run the backend test suite |
| `npm run lint` | Type-check the codebase (`tsc --noEmit`) |

## 📁 Project Structure

```
├── src/            # React frontend (components, hooks, lib)
├── server/         # Express backend (ai, db, middleware, validation)
│   └── ai/         # Gemini/OpenAI clients, memory, intent routing
├── public/         # Static assets (hero image, background)
├── supabase/       # Optional production database migrations (RLS)
├── netlify/        # Serverless function deployment
├── data/           # JSON data store (persistence)
└── tests/          # Backend tests
```

## 🧡 Acknowledgments

Built and maintained with care by [Arfa Munam](https://github.com/ArfaMunam47).
