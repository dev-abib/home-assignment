# Chat Platform API Documentation

> **Version:** 1.0.0  
> **Base REST URL:** `https://frontend-task-chatapp.onrender.com/api`  
> **WebSocket URL:** `https://frontend-task-chatapp.onrender.com` (Socket.io)  
> **Author:** Frontend Candidate Specification Deliverable  

---

## 1. Overview & Architecture

This API provides a real-time messaging backend supporting direct (1-to-1) and multi-user group conversations. Communication occurs over a dual-channel architecture:
1. **REST API (`/api/*`):** Standard HTTP endpoints for authentication, conversation lifecycle management, membership management, historical message retrieval with cursor-based pagination, and sending messages.
2. **WebSocket (`/socket.io/`):** Real-time bi-directional events for instant message delivery, live synchronization across client tabs, and real-time conversation/group metadata updates.

---

## 2. Authentication & Authorization

All protected REST endpoints and WebSocket connections require authentication via a JSON Web Token (JWT).

### Flow
1. Obtain token via `POST /api/auth/login`.
2. For REST requests, provide the header:
   ```http
   Authorization: Bearer <jwt-token>
   ```
3. For WebSocket connections, pass the token in the Socket.io handshake auth object:
   ```javascript
   const socket = io('https://frontend-task-chatapp.onrender.com', {
     auth: { token: '<jwt-token>' },
     transports: ['websocket', 'polling']
   });
   ```

---

## 3. Data Models & Schemas

### User Object
```typescript
interface User {
  _id: string;          // Unique MongoDB ObjectID (e.g. "6a8883d9e5d6aac97523781a")
  name: string;         // Full user display name (e.g. "Ada Lovelace")
  phone: string;        // Phone number in E.164 format (e.g. "+15551234567")
  createdAt?: string;   // ISO 8601 creation timestamp
  updatedAt?: string;   // ISO 8601 update timestamp
}
```

### Message Object
```typescript
interface Message {
  _id: string;          // Unique Message ObjectID
  conversation: string; // Target Conversation ObjectID
  sender: string;       // Sender User ObjectID
  text: string;         // Message body content (non-empty string)
  createdAt: string;    // ISO 8601 creation timestamp
}
```

### Direct Conversation Object
```typescript
interface DirectConversation {
  _id: string;
  type: "direct";
  participants: string[] | User[]; // Array of 2 User IDs or populated User objects
  participant?: User;              // Populated other participant object when listed
  lastMessage?: {
    text: string;
    sender: string;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

### Group Conversation Object
```typescript
interface GroupConversation {
  _id: string;
  type: "group";
  name: string;                    // Group display name (e.g. "Engineering Team")
  createdBy: string;               // Creator User ObjectID
  admins: string[];                // Array of Admin User ObjectIDs
  participants: User[];            // Populated array of participant User objects
  lastMessage?: {
    text?: string;
    sender?: string;
    createdAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

---

## 4. REST Endpoints Reference

### 4.1 System & Health

#### `GET /health`
*Note: Located at the server root origin, outside `/api`.*
- **Auth:** Public
- **Success (200 OK):**
```json
{
  "status": "ok"
}
```

---

### 4.2 Authentication (`/api/auth`)

#### `POST /api/auth/login`
Logs in an existing user or automatically creates a new account if the phone number does not exist.
- **Auth:** Public
- **Request Body (`application/json`):**
```json
{
  "phone": "+15551234567",
  "name": "Ada Lovelace"
}
```
- **Success (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "6a8883d9e5d6aac97523781a",
    "name": "Ada Lovelace",
    "phone": "+15551234567",
    "createdAt": "2026-08-21T16:59:05.368Z"
  }
}
```
- **Error (400 Bad Request):**
```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [{ "path": "phone", "message": "Required" }]
  }
}
```

#### `GET /api/auth/me`
Retrieves profile for the authenticated token. Useful for session restoration on page reload.
- **Auth:** Bearer Token
- **Success (200 OK):**
```json
{
  "user": {
    "_id": "6a8883d9e5d6aac97523781a",
    "name": "Ada Lovelace",
    "phone": "+15551234567",
    "createdAt": "2026-08-21T16:59:05.368Z"
  }
}
```
- **Error (401 Unauthorized):**
```json
{
  "error": {
    "message": "Unauthorized or invalid token",
    "code": "UNAUTHORIZED"
  }
}
```

---

### 4.3 User Discovery (`/api/users`)

#### `GET /api/users/search?q={query}`
Searches users by partial name or phone number.
- **Auth:** Bearer Token
- **Query Parameters:**
  - `q` *(required, string)*: Search substring (e.g. `Ada` or `+1555`).
- **Success (200 OK):**
```json
[
  {
    "_id": "6a8883dae5d6aac975237825",
    "name": "Bob Tester",
    "phone": "+15550007241"
  }
]
```

---

### 4.4 Conversations (`/api/conversations`)

#### `GET /api/conversations`
Lists all direct and group conversations the authenticated user belongs to, ordered by recent activity.
- **Auth:** Bearer Token
- **Success (200 OK):**
```json
{
  "data": [
    {
      "_id": "6a8883dfe5d6aac97523786b",
      "type": "group",
      "name": "Alpha Engineering Squad",
      "createdBy": "6a8883d9e5d6aac97523781a",
      "admins": ["6a8883d9e5d6aac97523781a"],
      "participants": [
        { "_id": "6a8883d9e5d6aac97523781a", "name": "Ada Lovelace", "phone": "+15551234567" },
        { "_id": "6a8883dae5d6aac975237825", "name": "Bob Tester", "phone": "+15550007241" },
        { "_id": "6a8883dee5d6aac975237859", "name": "Carol Danvers", "phone": "+15550008465" }
      ],
      "lastMessage": {
        "text": "Latest squad update",
        "sender": "6a8883d9e5d6aac97523781a",
        "createdAt": "2026-08-21T17:05:00.000Z"
      },
      "updatedAt": "2026-08-21T17:05:00.000Z"
    },
    {
      "_id": "6a8883dbe5d6aac975237832",
      "type": "direct",
      "participant": {
        "_id": "6a8883dae5d6aac975237825",
        "name": "Bob Tester",
        "phone": "+15550007241"
      },
      "lastMessage": {
        "text": "Hello Bob!",
        "sender": "6a8883d9e5d6aac97523781a",
        "createdAt": "2026-08-21T16:59:08.352Z"
      },
      "updatedAt": "2026-08-21T16:59:08.586Z"
    }
  ]
}
```

#### `POST /api/conversations`
Starts or opens an existing direct 1-to-1 conversation with another user.
- **Auth:** Bearer Token
- **Request Body:**
```json
{
  "userId": "6a8883dae5d6aac975237825"
}
```
- **Success (200 OK / 201 Created):**
```json
{
  "_id": "6a8883dbe5d6aac975237832",
  "participants": [
    "6a8883d9e5d6aac97523781a",
    "6a8883dae5d6aac975237825"
  ],
  "createdAt": "2026-08-21T16:59:07.386Z"
}
```

#### `POST /api/conversations/group`
Creates a new group conversation. The creator automatically becomes an admin.
- **Constraint:** Group requires at least 3 total members (`participantIds` array must contain at least 2 distinct user IDs besides creator).
- **Auth:** Bearer Token
- **Request Body:**
```json
{
  "name": "Design & Frontend Squad",
  "participantIds": [
    "6a8883dae5d6aac975237825",
    "6a8883dee5d6aac975237859"
  ]
}
```
- **Success (201 Created):**
```json
{
  "_id": "6a8883dfe5d6aac97523786b",
  "type": "group",
  "name": "Design & Frontend Squad",
  "createdBy": "6a8883d9e5d6aac97523781a",
  "admins": ["6a8883d9e5d6aac97523781a"],
  "participants": [
    { "_id": "6a8883d9e5d6aac97523781a", "name": "Ada Lovelace", "phone": "+15551234567" },
    { "_id": "6a8883dae5d6aac975237825", "name": "Bob Tester", "phone": "+15550007241" },
    { "_id": "6a8883dee5d6aac975237859", "name": "Carol Danvers", "phone": "+15550008465" }
  ],
  "createdAt": "2026-08-21T16:59:11.226Z",
  "updatedAt": "2026-08-21T16:59:11.226Z"
}
```

---

### 4.5 Group Governance (`/api/conversations/{id}`)

#### `PATCH /api/conversations/{id}`
Renames an existing group (Admins only).
- **Auth:** Bearer Token
- **Request Body:**
```json
{
  "name": "New Squad Name"
}
```
- **Success (200 OK):** Returns updated `GroupConversation` object.

#### `POST /api/conversations/{id}/admins`
Promotes an existing member to admin status (Admins only).
- **Auth:** Bearer Token
- **Request Body:**
```json
{
  "userId": "6a8883dae5d6aac975237825"
}
```
- **Success (200 OK):** Returns updated `GroupConversation` object with updated `admins` array.

#### `POST /api/conversations/{id}/participants`
Adds one or more users to an existing group (Admins only).
- **Auth:** Bearer Token
- **Request Body:**
```json
{
  "userIds": ["6a888400e5d6aac97523797e"]
}
```
- **Success (200 OK):** Returns updated `GroupConversation` object.

#### `DELETE /api/conversations/{id}/participants/{userId}`
Removes a member from a group (Admins only). Passing own `userId` leaves the group (available to any member).
- **Auth:** Bearer Token
- **Success (200 OK):** Returns updated `GroupConversation` object.

---

### 4.6 Messaging (`/api/messages` & History)

#### `POST /api/messages`
Sends a new message to a direct or group conversation.
- **Auth:** Bearer Token
- **Request Body:**
```json
{
  "conversationId": "6a8883dbe5d6aac975237832",
  "text": "Hello, world!"
}
```
- **Success (201 Created):**
```json
{
  "_id": "6a8883dce5d6aac97523783f",
  "conversation": "6a8883dbe5d6aac975237832",
  "sender": "6a8883d9e5d6aac97523781a",
  "text": "Hello, world!",
  "createdAt": "2026-08-21T16:59:08.352Z"
}
```

#### `GET /api/conversations/{id}/messages`
Retrieves chronological message history with pagination. Messages are returned in descending chronological order (newest first).
- **Auth:** Bearer Token
- **Query Parameters:**
  - `limit` *(optional, integer, default: 20)*: Page size.
  - `before` *(optional, string)*: Cursor ObjectID to fetch messages created before this message.
- **Success (200 OK):**
```json
{
  "messages": [
    {
      "_id": "6a88842ce5d6aac975237b83",
      "conversation": "6a888426e5d6aac975237b12",
      "sender": "6a888424e5d6aac975237ae5",
      "text": "Latest message",
      "createdAt": "2026-08-21T17:00:28.626Z"
    }
  ],
  "hasMore": true
}
```
*Note on Client Deduplication:* The backend `before` query includes the boundary message ID in edge conditions; client state must maintain an ID map or filter by unique `_id`.

---

## 5. WebSocket Specification (Socket.io)

### Connection
- **URL:** `https://frontend-task-chatapp.onrender.com`
- **Handshake Auth:** `{ "token": "<JWT>" }`

### Client → Server Events

#### `message:send`
Sends a message via WebSocket with optional server acknowledgment.
```typescript
socket.emit(
  "message:send",
  {
    conversationId: "6a8883dbe5d6aac975237832",
    text: "Live message over socket"
  },
  (ackResponse: { status: "ok"; message: Message } | { error: string }) => {
    // Ack handler
  }
);
```

---

### Server → Client Events

#### `message:new`
Fires whenever any participant sends a message in a conversation the authenticated user belongs to.
- **Payload:**
```json
{
  "_id": "6a88840ae5d6aac975237a0b",
  "conversation": "6a888401e5d6aac975237985",
  "sender": "6a8883fee5d6aac97523795a",
  "text": "Live incoming update",
  "createdAt": "2026-08-21T17:00:00.000Z"
}
```

#### `conversation:updated`
Fires when a group is created, renamed, or membership/admin status changes.
- **Payload:** Updated `GroupConversation` or `DirectConversation` object.

---

## 6. Standard Error Format

All error responses return a standardized JSON structure:
```json
{
  "error": {
    "message": "Human-readable error description",
    "code": "ERROR_CODE_STRING",
    "details": [
      {
        "path": "fieldName",
        "message": "Specific validation failure"
      }
    ]
  }
}
```

| HTTP Status | Error Code | Typical Cause |
| :--- | :--- | :--- |
| `400 Bad Request` | `VALIDATION_ERROR` | Empty text, invalid phone format, fewer than 3 members in group |
| `401 Unauthorized`| `UNAUTHORIZED` | Missing or expired JWT token in Authorization header |
| `403 Forbidden`   | `FORBIDDEN` | Non-admin attempting to rename, add members, or promote in group |
| `404 Not Found`     | `NOT_FOUND` | User or Conversation ID does not exist |
| `500 Server Error` | `SERVER_ERROR` | Internal server exception |
