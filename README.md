# PulseChat — Real-Time Messaging Platform

> **Candidate:** Md. Abib Ahmed Dipto  
> **Frontend Developer Take-Home Assignment Deliverable**  
> Complete implementation for **Part 1** (API Documentation & Chat Application), **Part 2** (Creative Landing Page with Live Simulator), and **Part 3** (Thought Process & Architecture Write-up), plus a **Full TypeScript + Express + MongoDB Atlas Backend**.

---

## 🌟 Live Hosted URLs & Demos

| Deliverable | Live Production URL | Description |
| :--- | :--- | :--- |
| **Part 2 — Creative Landing Page** | [**`https://home-assignment-smoky.vercel.app/`**](https://home-assignment-smoky.vercel.app/) | Showcase page with an **embedded 2-user live simulator sandbox** |
| **Part 1 — Chat Application** | [**`https://home-assignment-smoky.vercel.app/chat`**](https://home-assignment-smoky.vercel.app/chat) | Full 1-to-1 & group chat with smart auto-scroll & Web Audio chimes |
| **Part 1 — Login / Auto-Register** | [**`https://home-assignment-smoky.vercel.app/login`**](https://home-assignment-smoky.vercel.app/login) | Phone + name auto-registration authentication |
| **Part 1 — Interactive API Explorer** | [**`https://home-assignment-smoky.vercel.app/docs`**](https://home-assignment-smoky.vercel.app/docs) | In-app API test console with real server requests & cURL generator |
| **Part 1 — OpenAPI 3.0 / Swagger JSON** | [**`https://home-assignment-smoky.vercel.app/openapi.json`**](https://home-assignment-smoky.vercel.app/openapi.json) | Downloadable standard OpenAPI 3.0 / Swagger JSON spec |
| **Part 1 — Standalone API Docs** | [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md) | Formal specification of all REST & WebSocket endpoints |
| **Part 3 — Thought Process Write-up** | [`THOUGHT_PROCESS.md`](./THOUGHT_PROCESS.md) | Architectural rationale, AI transparency, and live API quirks |
| **Live Cloud Backend (Render)** | [`https://frontend-task-chatapp.onrender.com`](https://frontend-task-chatapp.onrender.com) | Express + Socket.io + MongoDB Atlas production server |
| **GitHub Repository** | [`https://github.com/dev-abib/home-assignment`](https://github.com/dev-abib/home-assignment) | Complete clean fullstack source code |

---

## 🏗️ Clean Project Architecture & Structure

```
./
│
├── 📂 frontend/                    # DEDICATED NEXT.JS 14 FRONTEND APPLICATION
│   ├── 📂 src/
│   │   ├── 📂 app/
│   │   │   ├── 📄 page.tsx         # Part 2: Landing Page + Live Simulator Sandbox
│   │   │   ├── 📂 chat/page.tsx    # Part 1: Chat Application Panel
│   │   │   ├── 📂 login/page.tsx   # Part 1: Auth Screen (Phone + Name Auto-Registration)
│   │   │   ├── 📂 docs/page.tsx    # Part 1: Interactive API Playground
│   │   │   ├── 📂 openapi.json/    # Route handler for dynamic OpenAPI JSON spec
│   │   │   ├── 📄 globals.css      # Tailwind v4 theme tokens & glassmorphic styling
│   │   │   └── 📄 layout.tsx       # Auth & Dark/Light Theme Providers
│   │   ├── 📂 components/chat/     # Sidebar, Header, MessageList, Bubble, Input, Modals, Drawer
│   │   ├── 📂 components/ui/       # Avatar, Badge, Modal dialogs
│   │   ├── 📂 hooks/               # useChat, useSmartScroll (smart auto-scroll continuity)
│   │   ├── 📂 lib/                 # api.ts (REST client), socket.ts, sound.ts (Web Audio chimes)
│   │   ├── 📂 context/             # AuthContext, ThemeContext
│   │   └── 📂 types/               # TypeScript interfaces
│   ├── 📂 public/
│   │   └── 📄 openapi.json         # Static OpenAPI 3.0 / Swagger specification
│   ├── 📄 package.json             # Frontend package configuration (Tailwind v4, Next 14)
│   ├── 📄 tsconfig.json            # Frontend TypeScript configuration
│   ├── 📄 next.config.mjs          # Next.js configuration
│   └── 📄 postcss.config.mjs       # PostCSS Tailwind v4 configuration
│
├── 📂 backend/                     # DEDICATED EXPRESS + TYPESCRIPT BACKEND
│   ├── 📂 src/
│   │   ├── 📂 models/              # User, Conversation, Message (Mongoose)
│   │   ├── 📂 controllers/         # Auth, User, Conversation, Message controllers
│   │   ├── 📂 middleware/          # JWT bearer authentication middleware
│   │   ├── 📂 routes/api.ts        # REST router (/api/auth, /api/conversations, /api/messages, etc.)
│   │   ├── 📂 socket/              # Real-time Socket.io rooms & event dispatchers
│   │   └── 📄 server.ts            # Express HTTP + WebSocket server + MongoDB Atlas connection
│   ├── 📄 .env                     # Port 5000, MongoDB Atlas URI, JWT Secret
│   ├── 📄 package.json             # Backend dependencies & scripts
│   └── 📄 tsconfig.json            # Backend TypeScript configuration
│
├── 📂 docs/                        # DOCUMENTATION DIRECTORY
│   ├── 📄 API_DOCUMENTATION.md     # Standalone API documentation for all endpoints
│   ├── 📄 THOUGHT_PROCESS.md       # In-depth architectural write-up and API analysis
│   └── 📄 openapi.json             # Complete OpenAPI 3.0 / Swagger JSON specification
│
├── 📄 API_DOCUMENTATION.md         # Top-level standalone API specification
├── 📄 THOUGHT_PROCESS.md           # Top-level architectural write-up & API quirks
├── 📄 README.md                    # Master setup & assignment guide
├── 📄 package.json                 # Root script runner (npm run dev, npm run build)
└── 📄 .gitignore                   # Ignore node_modules, .next, dist, env, etc.
```

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js LTS (v20+)
- npm (v10+)

### 1-Command Startup (From Root Directory)

```bash
# Install dependencies
cd frontend && npm install && cd ..

# Start Frontend Dev Server (Next.js at http://localhost:3000)
npm run dev

# Build for production
npm run build
```

---

## 🧪 Verified Features & Assignment Coverage

### Part 1: API Documentation & Feature Implementation
- **Standalone API Docs & Swagger:** Complete Markdown specification in [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md), interactive playground at `/docs`, and OpenAPI 3.0 JSON at [`/openapi.json`](https://home-assignment-smoky.vercel.app/openapi.json).
- **Zero-Friction Auth:** Auto-registers new phone numbers or logs in existing numbers with JWT session recovery.
- **Direct & Group Conversations:** Real-time search (`/api/users/search`) and multi-user group creator enforcing the backend $\ge 3$ member rule.
- **Group Governance Drawer:** Admin promotion (`POST /conversations/:id/admins`), participant addition, group rename, and member departure.
- **Smart Auto-Scroll (`useSmartScroll`):** Auto-scrolls on new messages by default; preserves scroll position when viewing history and displays an animated **"↓ X new messages"** pill.
- **Upward Infinite Scroll & Deduplication:** Loads older pages with `before` cursor and client-side message deduplication.
- **Audio Synthesizer:** Web Audio API synthesized chimes for sending, receiving, and audio note simulations (zero asset dependencies).

### Part 2: Creative Landing Page
- Modern glassmorphic aesthetic with dark/light mode toggle.
- **Interactive 2-User Simulator Sandbox:** Playable live demo embedded directly on the landing page where visitors can test real-time chat latency and auto-replies before logging in.
- Architecture visualizer and feature deep-dives.

### Part 3: Thought Process & API Quirks
- Read [`THOUGHT_PROCESS.md`](./THOUGHT_PROCESS.md) for full architectural trade-offs, AI tooling transparency, and solutions to real-world live API quirks (routing prefixes, group sizes, and cursor pagination boundaries).
