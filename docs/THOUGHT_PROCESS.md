# Part 3: Thought Process & Architectural Write-up

This document details the architectural decisions, design philosophies, AI tooling transparency, future extensions, and live API quirks encountered during the implementation of the **PulseChat Platform** (Parts 1 & 2).

---

## 1. Architecture, Libraries & Approach (Part 1)

### 1.1 Technology Stack & Architectural Decisions
- **Framework (Next.js 14 + React 18/19 + TypeScript):**  
  We chose Next.js App Router for unified client-side interactivity, fast routing, type safety, and seamless deployment to Vercel/Netlify.
- **Real-Time Dual-Channel Engine (Socket.io + REST):**  
  A dual-pipeline approach was adopted:
  - **Socket.io Client** maintains a persistent bi-directional connection to root origin for instant zero-latency message broadcast (`message:new`, `conversation:updated`) and sending (`message:send`).
  - **REST Client (`/api/*`)** handles initial loads, historical paging (`before` cursor), user search, and acts as an immediate fallback if WebSocket reconnects.
- **Smart Scroll Hook (`useSmartScroll`):**  
  To solve the critical requirement of auto-scrolling by default without annoying users who scrolled up to read earlier history, we engineered a dedicated container observer:
  - Tracks distance from scroll bottom with a 120px threshold.
  - Automatically scrolls down on outgoing messages and when already at the bottom.
  - Suppresses auto-scroll when user is scrolled up and displays an animated floating **"↓ X new messages"** pill.
  - Preserves scroll height offsets (`scrollHeight - previousScrollHeight`) when prepending older pages so the user's viewport never jerks.
- **Web Audio API Sound Synthesis (`sounds`):**  
  Instead of relying on external audio asset files (which risk broken CDN links, CORS issues, or slow network downloads), we built a lightweight synthesizer using the native browser Web Audio API oscillator nodes for outgoing chimes and incoming notification pings.

### 1.2 Trade-offs Considered
| Decision | Chosen Approach | Alternative Considered | Trade-off Rationale |
| :--- | :--- | :--- | :--- |
| **State Management** | Custom Hooks + React Context (`useChat`, `AuthContext`) | Redux Toolkit / Zustand | Reduced bundle size and complexity; React Context + custom hooks provide clean, isolated reactivity without boilerplate overhead for this application scale. |
| **Styling System** | Tailwind CSS + CSS Variables (Hues) | Vanilla CSS Modules | Rapid prototyping with token-level consistency, dark/light theme switching via CSS variables, and zero runtime CSS overhead. |
| **Message Deduplication** | In-memory ID Map / Set Filtering | Strict Array Indexing | Eliminates backend boundary duplication bugs during cursor pagination. |

---

## 2. Design Choices (Part 2 — Creative Showcase Landing Page)

### 2.1 Visual Direction & Brand Identity
- **Color Palette & Glassmorphism:** Deep space background (`hsl(224, 71%, 4%)`) paired with high-contrast electric indigo/violet gradients, frosted glass cards (`backdrop-filter: blur(16px)`), and crisp typography hierarchy.
- **Interactive Live Simulator (Bonus Addition):**  
  Rather than presenting static screenshots or mockups, we created an embedded, interactive 2-user sandbox right on the landing page. Visitors can switch personas ("Alex" and "Taylor"), send real messages, trigger simulated audio notes, observe live typing indicators, and test the smart scroll behavior directly before signing in.
- **Clarity & Transparency:** Included an interactive API explorer (`/docs`) where reviewers can execute live HTTP requests against the backend and copy curl commands with 1 click.

---

## 3. AI Tool Usage & Transparency

In compliance with the assignment instructions, below is an honest and complete log of how AI tools were utilized:

### 3.1 Tools Used
- **Antigravity AI Assistant (Google DeepMind):** Used for rapid exploration, scripting automated API probe test harnesses, boilerplate generation, and edge-case validation.

### 3.2 What Was Automated / Drafted with AI
- Initial drafting of the OpenAPI/Markdown documentation structure in `API_DOCUMENTATION.md`.
- Generating synthetic Web Audio API frequency curves for audio chimes.
- Automated API probing scripts (`probe_all_endpoints.ps1`) to reverse-engineer exact response shapes and error schemas from the Render server.

### 3.3 What Was Hand-Crafted, Adjusted, or Rejected
- **Rejected Naive Auto-Scroll:** AI initially suggested simple `scrollIntoView()` on every message update. We rejected this because it violates the core requirement of not forcing scroll when the user is reviewing history. We hand-coded the `useSmartScroll` threshold calculations and height offset preservation for upward paging.
- **Corrected URL Routing Paths:** AI initial assumptions attempted to call REST endpoints at root origin; our probe scripts verified that REST is mounted at `/api/*`, while `/health` and `/socket.io` are at root origin.
- **Hand-Coded Group Creation Validation:** Verified that the API requires $\ge 3$ members, adding multi-select participant chip management and validation warnings before calling `POST /api/conversations/group`.
- **Deduplication Logic:** Hand-crafted ID map filtering to resolve the inclusive boundary cursor quirk in `GET /api/conversations/{id}/messages`.

---

## 4. Future Improvements (With More Time)

1. **End-to-End Encryption (E2EE):** Implement Signal Protocol (Double Ratchet + X3DH) with client-side Web Crypto key pairs.
2. **Direct Media Upload Pipeline:** Implement presigned S3/Cloudflare R2 multipart uploads for high-resolution images, videos, and PDF documents.
3. **Read Receipts & Delivery Sync:** Add granular message-level read markers (`message:read` event) and typing indicator broadcasting over Socket.io.
4. **Offline Persistence (IndexedDB + PWA):** Store message history in local IndexedDB with service worker background sync for offline message queuing.
5. **Push Notifications:** Web Push API / Service Worker integration for background browser notifications when tabs are inactive.

---

## 5. Live API Quirks, Inconsistencies & Resolutions

During our systematic probing of `https://frontend-task-chatapp.onrender.com`, we identified the following real-world behaviors:

### 1. Root vs `/api` Routing Separation
- **Observation:** `GET /health` and Socket.io are mounted at the root origin (`https://frontend-task-chatapp.onrender.com`), while all REST routes (`/auth/login`, `/conversations`, `/messages`) require the `/api` prefix (`/api/auth/login`, `/api/conversations`). Requesting `/auth/login` at root returns `404 Not Found`.
- **Resolution:** Centralized API client base URL to `https://frontend-task-chatapp.onrender.com/api` and socket client URL to root origin.

### 2. Group Minimum Participant Rule
- **Observation:** Calling `POST /api/conversations/group` with 1 participant in `participantIds` returns a `400 Bad Request` validation error: `"a group needs at least 3 members"`. The backend counts creator (1) + `participantIds` ($\ge 2$).
- **Resolution:** Added client-side validation in `NewGroupModal` requiring at least 2 other participants to be selected, with live counter badges showing "X more needed".

### 3. Cursor Pagination Inclusive Boundary Duplication
- **Observation:** When requesting older messages via `GET /api/conversations/{id}/messages?limit=2&before={oldestMessageId}`, the backend query uses inclusive comparison ($\le$), returning `{oldestMessageId}` again in the next page.
- **Resolution:** In `useChat`, we implemented Map/Set deduplication based on `_id` before prepending older messages to the state:
  ```typescript
  setMessages((prev) => {
    const existingIds = new Set(prev.map((m) => m._id));
    const newUnique = olderMessages.filter((m) => !existingIds.has(m._id));
    return [...newUnique, ...prev];
  });
  ```

### 4. Normalized ObjectID Schema
- **Observation:** User and conversation objects return MongoDB ObjectID strings in `_id`. Some responses populate full user objects while others return string IDs.
- **Resolution:** Created flexible TypeScript union types (`string | User`) and normalized accessors throughout the UI.
