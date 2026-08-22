# PulseChat — Real-Time Messaging Platform

> **Candidate:** Md. Abib Ahmed Dipto  
> **Frontend Developer Take-Home Assignment Deliverable**  
> Complete implementation for **Part 1** (API Documentation & Chat Application), **Part 2** (Creative Landing Page with Live Simulator), and **Part 3** (Thought Process & Architecture Write-up), connecting directly to the live Render cloud backend (`https://frontend-task-chatapp.onrender.com`).

---

## 🌟 Live Hosted URLs & Demos

| Deliverable | Live Production URL | Description |
| :--- | :--- | :--- |
| **Part 2 — Creative Landing Page** | [**`https://home-assignment-smoky.vercel.app/`**](https://home-assignment-smoky.vercel.app/) | Showcase page with an **embedded 2-user live simulator sandbox** |
| **Part 1 — Chat Application** | [**`https://home-assignment-smoky.vercel.app/chat`**](https://home-assignment-smoky.vercel.app/chat) | Full 1-to-1 & group chat with smart auto-scroll & Web Audio chimes |
| **Part 1 — Login / Auto-Register** | [**`https://home-assignment-smoky.vercel.app/login`**](https://home-assignment-smoky.vercel.app/login) | Phone + name auto-registration authentication |
| **Part 1 — Interactive API Explorer** | [**`https://home-assignment-smoky.vercel.app/docs`**](https://home-assignment-smoky.vercel.app/docs) | In-app API test console with real server requests & cURL generator |
| **Live Swagger UI Documentation** | [**`https://frontend-task-chatapp.onrender.com/docs/`**](https://frontend-task-chatapp.onrender.com/docs/) | Official interactive Swagger UI testable documentation on Render |
| **Part 1 — OpenAPI 3.0 / Swagger JSON** | [**`https://home-assignment-smoky.vercel.app/openapi.json`**](https://home-assignment-smoky.vercel.app/openapi.json) | Downloadable standard OpenAPI 3.0 / Swagger JSON spec |
| **Testable Postman Collection** | [**`https://home-assignment-smoky.vercel.app/postman_collection.json`**](https://home-assignment-smoky.vercel.app/postman_collection.json) | 1-click importable Postman / Bruno API test collection |
| **Master Architecture Guide** | [`PROJECT_OVERVIEW_AND_ARCHITECTURE.md`](./PROJECT_OVERVIEW_AND_ARCHITECTURE.md) | **Deep-dive on what was built, how it was built, full folder guide & fixes** |
| **Part 1 — Standalone API Docs** | [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md) | Formal specification of all REST & WebSocket endpoints |
| **Part 3 — Thought Process Write-up** | [`THOUGHT_PROCESS.md`](./THOUGHT_PROCESS.md) | Architectural rationale, AI transparency, and live API quirks |
| **Live Cloud Backend (Render)** | [`https://frontend-task-chatapp.onrender.com`](https://frontend-task-chatapp.onrender.com) | Express + Socket.io + MongoDB live production backend API |
| **GitHub Repository** | [`https://github.com/dev-abib/home-assignment`](https://github.com/dev-abib/home-assignment) | Complete clean frontend source code & documentation |

---

## 🏗️ Clean Project Architecture & Structure

```
./
│
├── 📂 frontend/                    # NEXT.JS 14 FRONTEND APPLICATION
│   ├── 📂 src/
│   │   ├── 📂 app/
│   │   │   ├── 📄 page.tsx         # Part 2: Landing Page + Live Simulator Sandbox
│   │   │   ├── 📂 chat/page.tsx    # Part 1: Chat Application Panel
│   │   │   ├── 📂 login/page.tsx   # Part 1: Auth Screen (Phone + Name Auto-Registration)
│   │   │   ├── 📂 docs/page.tsx    # Part 1: Interactive API Playground
│   │   │   ├── 📄 globals.css      # Tailwind v4 theme tokens & glassmorphic styling
│   │   │   └── 📄 layout.tsx       # Auth & Dark/Light Theme Providers
│   │   ├── 📂 components/chat/     # Sidebar, Header, MessageList, Bubble, Input, Modals, Drawer
│   │   ├── 📂 components/ui/       # Avatar, Badge, Modal dialogs
│   │   ├── 📂 hooks/               # useChat, useSmartScroll (smart auto-scroll continuity)
│   │   ├── 📂 lib/                 # api.ts (REST client), socket.ts, sound.ts (Web Audio chimes)
│   │   ├── 📂 context/             # AuthContext, ThemeContext
│   │   └── 📂 types/               # TypeScript interfaces
│   ├── 📂 public/
│   │   ├── 📄 openapi.json         # Static OpenAPI 3.0 / Swagger specification
│   │   └── 📄 postman_collection.json # Testable Postman collection JSON
│   ├── 📄 package.json             # Frontend package configuration (Tailwind v4, Next 14)
│   ├── 📄 tsconfig.json            # Frontend TypeScript configuration
│   ├── 📄 next.config.mjs          # Next.js configuration
│   └── 📄 postcss.config.mjs       # PostCSS Tailwind v4 configuration
│
├── 📄 API_DOCUMENTATION.md         # Top-level standalone API specification
├── 📄 openapi.json                 # Complete OpenAPI 3.0 / Swagger JSON specification
├── 📄 postman_collection.json      # Testable Postman API collection
├── 📄 PROJECT_OVERVIEW_AND_ARCHITECTURE.md # Master project overview and architecture
├── 📄 THOUGHT_PROCESS.md           # Top-level architectural write-up & API quirks
├── 📄 README.md                    # Master setup & assignment guide
├── 📄 package.json                 # Root script runner (npm run dev, npm run build)
├── 📄 .env.example                 # Environment variable template
└── 📄 .gitignore                   # Ignore node_modules, .next, dist, env, etc.
```

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js 18.18.0 or higher (LTS v20+ recommended)
- npm 9.0.0 or higher (v10+ recommended)

---

### Quickstart (Connecting to Live Render Backend)

The application is pre-configured to connect directly to the live Render cloud backend (`https://frontend-task-chatapp.onrender.com`). No local database setup is required.

```bash
# 1. Install all dependencies from root
npm run install:all

# 2. Start Frontend Dev Server (Next.js at http://localhost:3000)
npm run dev

# 3. Build & Validate for Production
npm run build
```

---

## 🧪 Verified Features & Assignment Coverage

### Part 1: API Documentation & Feature Implementation
- **Standalone API Docs & Swagger:** Complete Markdown specification in [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md), interactive playground at `/docs`, and OpenAPI 3.0 JSON at [`/openapi.json`](https://home-assignment-smoky.vercel.app/openapi.json).
- **Zero-Friction Auth:** Auto-registers new phone numbers or logs in existing numbers with JWT session recovery.
- **Direct & Group Conversations:** Real-time search (`/api/users/search`) and multi-user group creator enforcing the backend at least 3 members rule.
- **Group Governance Drawer:** Admin promotion (`POST /api/conversations/:id/admins`), participant addition, group rename, and member departure.
- **Smart Auto-Scroll (`useSmartScroll`):** Auto-scrolls on new messages by default; preserves scroll position when viewing history and displays an animated **"↓ X new messages"** pill.
- **Upward Infinite Scroll & Deduplication:** Loads older pages with `before` cursor and client-side message deduplication.
- **Audio Synthesizer:** Web Audio API synthesized chimes for sending, receiving, and audio note simulations (zero asset dependencies).

### Part 2: Creative Landing Page
- Modern glassmorphic aesthetic with dark/light mode toggle.
- **Interactive 2-User Simulator Sandbox:** Playable live demo embedded directly on the landing page where visitors can test real-time chat latency and auto-replies before logging in.
- Architecture visualizer and feature deep-dives.

### Part 3: Thought Process & API Quirks
- Read [`THOUGHT_PROCESS.md`](./THOUGHT_PROCESS.md) for full architectural trade-offs, AI tooling transparency, and client-side resolutions to live API quirks (routing prefixes, group sizes, and cursor pagination boundaries).
