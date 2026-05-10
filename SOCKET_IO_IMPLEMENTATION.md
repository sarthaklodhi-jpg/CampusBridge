# Socket.io Real-Time Architecture Plan

## Current Status: 0% Implementation

The backend has EventEmitter-based stubs but **no socket.io setup**. This document outlines the complete real-time infrastructure needed.

---

## Phase 1: Socket.io Installation & Configuration

### Step 1.1: Install Dependencies
```bash
# Backend
npm install socket.io redis socket.io-redis

# Frontend
npm install socket.io-client
```

### Step 1.2: Server Configuration
**File:** [backend/src/server.js](backend/src/server.js) (NEW)

```javascript
import app from "./app.js";
import { createServer } from "http";
import { Server as SocketIO } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";

const startServer = async () => {
  try {
    await connectDB();
    
    // Create HTTP server
    const httpServer = createServer(app);
    
    // Initialize Socket.io
    const io = new SocketIO(httpServer, {
      cors: {
        origin: env.clientUrl,
        credentials: true
      },
      transports: ["websocket", "polling"],
      pingInterval: 25000,
      pingTimeout: 60000,
      maxHttpBufferSize: 1e6  // 1MB
    });

    // Redis adapter for multi-server support
    if (env.nodeEnv === "production") {
      const pubClient = createClient({ url: env.redisUrl });
      const subClient = pubClient.duplicate();
      
      await Promise.all([pubClient.connect(), subClient.connect()]);
      io.adapter(createAdapter(pubClient, subClient));
    }

    // Socket.io middleware
    io.use(require("./middleware/socket.auth.js").default);

    // Socket.io event handlers
    const { initializeSocketHandlers } = require("./realtime/handlers.js");
    initializeSocketHandlers(io);

    // Server listening
    httpServer.listen(env.port, () => {
      console.log(`🚀 API + WebSocket running on port ${env.port}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
```

**Changes to package.json:**
```json
{
  "dependencies": {
    "socket.io": "^4.7.0",
    "redis": "^4.6.0",
    "@socket.io/redis-adapter": "^8.1.0"
  }
}
```

---

## Phase 2: Socket Authentication

### Step 2.1: Socket Auth Middleware
**File:** [backend/src/middleware/socket.auth.js](backend/src/middleware/socket.auth.js) (NEW)

```javascript
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";

export default async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || 
                  socket.handshake.headers.authorization?.split(" ")[1];

    if (!token) {
      return next(new ApiError(401, "Authentication required"));
    }

    // Verify JWT
    const payload = jwt.verify(token, env.jwtAccessSecret);
    const user = await User.findById(payload.sub)
      .select("_id name username profilePicture college role isActive");

    if (!user || !user.isActive) {
      return next(new ApiError(401, "Invalid authentication session"));
    }

    // Attach user to socket
    socket.user = user;
    socket.userId = user._id.toString();
    socket.collegeId = user.college?.toString();

    // Rate limiting per user
    socket.rateLimit = {
      messages: 0,
      lastReset: Date.now()
    };

    next();
  } catch (error) {
    next(new ApiError(401, "Invalid or expired token"));
  }
};
```

---

## Phase 3: Real-Time Event System

### Step 3.1: Define Event Types & Payloads
**File:** [backend/src/realtime/events.js](backend/src/realtime/events.js) (UPDATED)

```javascript
export const REALTIME_EVENTS = {
  // Comment events
  COMMENT_CREATED: "comment:created",
  COMMENT_LIKED: "comment:liked",
  COMMENT_DELETED: "comment:deleted",
  COMMENT_REPLY: "comment:reply",

  // Post events
  POST_CREATED: "post:created",
  POST_LIKED: "post:liked",
  POST_DELETED: "post:deleted",
  POST_UPDATED: "post:updated",

  // Notification events
  NOTIFICATION_CREATED: "notification:created",
  NOTIFICATION_READ: "notification:read",

  // Connection events
  CONNECTION_REQUEST: "connection:request",
  CONNECTION_ACCEPTED: "connection:accepted",

  // Presence events
  USER_ONLINE: "user:online",
  USER_OFFLINE: "user:offline",
  USER_TYPING: "user:typing",
  USER_STOPPED_TYPING: "user:stopped_typing",

  // Announcement events
  ANNOUNCEMENT_CREATED: "announcement:created",
  ANNOUNCEMENT_UPDATED: "announcement:updated",

  // College events
  COLLEGE_ACTIVITY: "college:activity"
};

export const EVENT_PAYLOADS = {
  [REALTIME_EVENTS.COMMENT_CREATED]: {
    commentId: "ObjectId",
    postId: "ObjectId",
    authorId: "ObjectId",
    authorName: "string",
    content: "string",
    parent: "ObjectId | null",
    createdAt: "ISO8601"
  },
  
  [REALTIME_EVENTS.COMMENT_LIKED]: {
    commentId: "ObjectId",
    userId: "ObjectId",
    liked: "boolean",
    likesCount: "number"
  },

  [REALTIME_EVENTS.POST_CREATED]: {
    postId: "ObjectId",
    collegeId: "ObjectId",
    authorId: "ObjectId",
    authorName: "string",
    content: "string",
    type: "discussion|question|announcement",
    isPublic: "boolean",
    createdAt: "ISO8601"
  },

  [REALTIME_EVENTS.NOTIFICATION_CREATED]: {
    notificationId: "ObjectId",
    recipientId: "ObjectId",
    type: "like|comment|reply|connection_request|announcement",
    message: "string",
    createdAt: "ISO8601"
  },

  [REALTIME_EVENTS.USER_TYPING]: {
    userId: "ObjectId",
    userName: "string",
    postId: "ObjectId",
    isTyping: "boolean"
  }
};

export const publishRealtimeEvent = (io, event, payload, room) => {
  if (!room) {
    // Broadcast to all connected clients
    io.emit(event, payload);
  } else {
    // Emit to specific room
    io.to(room).emit(event, payload);
  }
};
```

---

## Phase 4: Socket.io Event Handlers

### Step 4.1: Connection & Room Management
**File:** [backend/src/realtime/handlers.js](backend/src/realtime/handlers.js) (NEW)

```javascript
import { REALTIME_EVENTS } from "./events.js";

export const initializeSocketHandlers = (io) => {
  // Track active users
  const activeUsers = new Map(); // userId -> Set<socketId>

  io.on("connection", (socket) => {
    const { userId, collegeId } = socket.user;

    console.log(`✅ User ${userId} connected: ${socket.id}`);

    // Join college room
    if (collegeId) {
      socket.join(`college:${collegeId}`);
      console.log(`📍 User joined college room: college:${collegeId}`);
    }

    // Join user room for direct messages
    socket.join(`user:${userId}`);

    // Track active user
    if (!activeUsers.has(userId)) {
      activeUsers.set(userId, new Set());
    }
    activeUsers.get(userId).add(socket.id);

    // Broadcast user online status to college
    if (collegeId) {
      io.to(`college:${collegeId}`).emit(REALTIME_EVENTS.USER_ONLINE, {
        userId,
        userName: socket.user.name,
        profilePicture: socket.user.profilePicture
      });
    }

    // ============ COMMENT EVENTS ============
    socket.on(REALTIME_EVENTS.COMMENT_CREATED, (payload) => {
      // Broadcast to post room
      io.to(`post:${payload.postId}`).emit(REALTIME_EVENTS.COMMENT_CREATED, payload);
    });

    socket.on(REALTIME_EVENTS.COMMENT_LIKED, (payload) => {
      io.to(`comment:${payload.commentId}`).emit(REALTIME_EVENTS.COMMENT_LIKED, payload);
    });

    socket.on(REALTIME_EVENTS.COMMENT_DELETED, (payload) => {
      io.to(`post:${payload.postId}`).emit(REALTIME_EVENTS.COMMENT_DELETED, payload);
    });

    // ============ POST EVENTS ============
    socket.on(REALTIME_EVENTS.POST_CREATED, (payload) => {
      // Broadcast to college feed
      if (collegeId) {
        io.to(`college:${collegeId}`).emit(REALTIME_EVENTS.POST_CREATED, payload);
      }
      // Also broadcast to public feed
      if (payload.isPublic) {
        io.emit(REALTIME_EVENTS.POST_CREATED, payload);
      }
    });

    socket.on(REALTIME_EVENTS.POST_LIKED, (payload) => {
      io.to(`post:${payload.postId}`).emit(REALTIME_EVENTS.POST_LIKED, payload);
    });

    // ============ NOTIFICATION EVENTS ============
    socket.on(REALTIME_EVENTS.NOTIFICATION_CREATED, (payload) => {
      // Send to recipient's room
      io.to(`user:${payload.recipientId}`).emit(REALTIME_EVENTS.NOTIFICATION_CREATED, payload);
    });

    // ============ PRESENCE EVENTS ============
    socket.on(REALTIME_EVENTS.USER_TYPING, (payload) => {
      socket.broadcast.to(`post:${payload.postId}`).emit(REALTIME_EVENTS.USER_TYPING, payload);
    });

    socket.on(REALTIME_EVENTS.USER_STOPPED_TYPING, (payload) => {
      socket.broadcast.to(`post:${payload.postId}`).emit(REALTIME_EVENTS.USER_STOPPED_TYPING, payload);
    });

    // ============ SUBSCRIBE TO ROOMS ============
    socket.on("subscribe:post", (postId) => {
      socket.join(`post:${postId}`);
      console.log(`🔔 User subscribed to post:${postId}`);
    });

    socket.on("unsubscribe:post", (postId) => {
      socket.leave(`post:${postId}`);
    });

    socket.on("subscribe:comment", (commentId) => {
      socket.join(`comment:${commentId}`);
    });

    socket.on("unsubscribe:comment", (commentId) => {
      socket.leave(`comment:${commentId}`);
    });

    // ============ DISCONNECTION ============
    socket.on("disconnect", () => {
      console.log(`❌ User ${userId} disconnected: ${socket.id}`);

      // Remove from active users
      const userSockets = activeUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          activeUsers.delete(userId);
          
          // Broadcast user offline
          if (collegeId) {
            io.to(`college:${collegeId}`).emit(REALTIME_EVENTS.USER_OFFLINE, {
              userId,
              userName: socket.user.name
            });
          }
        }
      }
    });

    // ============ ERROR HANDLING ============
    socket.on("error", (error) => {
      console.error(`❌ Socket error for user ${userId}:`, error);
    });
  });
};
```

---

## Phase 5: Service Layer Integration

### Step 5.1: Update Comment Service
**File:** [backend/src/services/comment.service.js](backend/src/services/comment.service.js) (UPDATED)

```javascript
import { publishRealtimeEvent } from "../realtime/events.js";

export const createComment = async (payload, user, io) => {
  // ... existing validation ...

  const comment = await Comment.create({
    post: post._id,
    author: user._id,
    parent: payload.parent || null,
    content: payload.content
  });

  // ... existing notification logic ...

  const populated = await Comment.findById(comment._id)
    .populate("author", "name username profilePicture role");

  // PUBLISH REAL-TIME EVENT
  const room = `post:${post._id}`;
  publishRealtimeEvent(io, "comment:created", {
    commentId: comment._id,
    postId: post._id,
    authorId: user._id,
    authorName: user.name,
    content: comment.content,
    parent: comment.parent,
    createdAt: comment.createdAt
  }, room);

  return populated;
};
```

### Step 5.2: Update Post Service
```javascript
export const createPost = async (payload, user, io) => {
  // ... existing logic ...

  const post = await Post.findById(post._id).populate(populatePost);

  // PUBLISH REAL-TIME EVENT
  const room = payload.isPublic ? null : `college:${user.college}`;
  publishRealtimeEvent(io, "post:created", {
    postId: post._id,
    collegeId: user.college,
    authorId: user._id,
    content: post.content,
    type: post.type
  }, room);

  return post;
};
```

### Step 5.3: Update Notification Service
```javascript
import { publishRealtimeEvent } from "../realtime/events.js";

export const createNotification = async (payload, io) => {
  const notification = await Notification.create(payload);

  // PUBLISH REAL-TIME EVENT
  publishRealtimeEvent(io, "notification:created", {
    notificationId: notification._id,
    recipientId: payload.recipient,
    type: notification.type,
    message: notification.message,
    createdAt: notification.createdAt
  }, `user:${payload.recipient}`);

  return notification;
};
```

---

## Phase 6: Controller Updates

### Step 6.1: Pass IO to Services
**File:** [backend/src/controllers/comment.controller.js](backend/src/controllers/comment.controller.js) (UPDATED)

```javascript
export const createComment = asyncHandler(async (req, res, next) => {
  // Get io from request (attached in middleware)
  const { data } = await commentService.createComment(
    req.body,
    req.user,
    req.io  // Pass io instance
  );
  
  sendResponse(res, 201, "Comment created", { comment: data });
});
```

### Step 6.2: Attach IO to Request
**File:** [backend/src/middleware/attach-io.js](backend/src/middleware/attach-io.js) (NEW)

```javascript
export const attachIO = (io) => (req, _res, next) => {
  req.io = io;
  next();
};
```

Update [backend/src/app.js](backend/src/app.js):
```javascript
// After initializing io in server.js
app.use(attachIO(io));
```

---

## Phase 7: Frontend Socket Client

### Step 7.1: Socket Service
**File:** [frontend/src/services/socket.js](frontend/src/services/socket.js) (NEW)

```javascript
import { io } from "socket.io-client";
import { REALTIME_EVENTS } from "../constants/events";

let socket = null;

export const initializeSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(import.meta.env.VITE_API_URL, {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ["websocket", "polling"]
  });

  socket.on("connect", () => {
    console.log("✅ Connected to real-time server");
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Disconnected from real-time server:", reason);
  });

  socket.on("error", (error) => {
    console.error("❌ Socket error:", error);
  });

  return socket;
};

export const getSocket = () => socket;

export const subscribeToPost = (postId, callback) => {
  if (!socket) return;
  
  socket.emit("subscribe:post", postId);
  socket.on(`comment:created:${postId}`, callback);
  
  return () => {
    socket.off(`comment:created:${postId}`, callback);
    socket.emit("unsubscribe:post", postId);
  };
};

export const subscribeToNotifications = (callback) => {
  if (!socket) return;
  
  socket.on("notification:created", callback);
  
  return () => {
    socket.off("notification:created", callback);
  };
};

export const subscribeToPosts = (callback) => {
  if (!socket) return;
  
  socket.on("post:created", callback);
  
  return () => {
    socket.off("post:created", callback);
  };
};

export const emitTyping = (postId, isTyping) => {
  if (!socket) return;
  
  socket.emit("user:typing", {
    postId,
    isTyping
  });
};
```

### Step 7.2: Initialize Socket in App
**File:** [frontend/src/App.jsx](frontend/src/App.jsx) (UPDATED)

```javascript
import { useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { initializeSocket } from "./services/socket";

export default function App() {
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      const socket = initializeSocket(token);
      
      return () => {
        // Optionally disconnect on unmount
        // socket.disconnect();
      };
    }
  }, [token]);

  // ... rest of App
}
```

### Step 7.3: Custom Hook for Real-Time Comments
**File:** [frontend/src/hooks/useRealtimeComments.js](frontend/src/hooks/useRealtimeComments.js) (NEW)

```javascript
import { useEffect, useState, useCallback } from "react";
import { getSocket } from "../services/socket";

export const useRealtimeComments = (postId) => {
  const [newComment, setNewComment] = useState(null);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Subscribe to post
    socket.emit("subscribe:post", postId);

    const handleNewComment = (payload) => {
      setNewComment(payload);
    };

    socket.on("comment:created", handleNewComment);

    return () => {
      socket.off("comment:created", handleNewComment);
      socket.emit("unsubscribe:post", postId);
    };
  }, [postId]);

  return { newComment, clearNewComment: () => setNewComment(null) };
};
```

### Step 7.4: Update CommentSection Component
**File:** [frontend/src/components/feed/CommentSection.jsx](frontend/src/components/feed/CommentSection.jsx) (UPDATED)

```javascript
import { useRealtimeComments } from "../../hooks/useRealtimeComments";

export default function CommentSection({ postId, onCountChange }) {
  const { newComment } = useRealtimeComments(postId);

  useEffect(() => {
    if (newComment) {
      // Add new comment to list
      setComments(current => [newComment, ...current]);
      onCountChange(1);
    }
  }, [newComment]);

  // ... rest of component
}
```

---

## Phase 8: Database & Environment Configuration

### Step 8.1: Environment Variables
**File:** [backend/.env](backend/.env) (ADD)

```env
# Socket.io
SOCKET_HOST=0.0.0.0
SOCKET_PORT=3001

# Redis (for socket.io adapter in production)
REDIS_URL=redis://localhost:6379

# CORS for socket.io
CLIENT_URL=http://localhost:5173
```

### Step 8.2: Redis Setup (Production)
```bash
# Using Docker
docker run -d -p 6379:6379 redis:7-alpine

# Or using brew (macOS)
brew install redis
brew services start redis

# Test connection
redis-cli ping
# Should return: PONG
```

---

## Phase 9: Testing Checklist

### Local Testing
- [ ] Socket connects on app load with token
- [ ] Socket disconnects on logout
- [ ] Comment appears in real-time on other tab
- [ ] Notification appears in real-time
- [ ] Post appears in feed in real-time
- [ ] User online/offline status updates
- [ ] Typing indicators work
- [ ] Message delivery on reconnect
- [ ] Offline queue works

### Load Testing
```bash
# Install socket.io load test tool
npm install -g artillery

# Test with 100 concurrent users
artillery run socket-load-test.yml
```

### Browser DevTools
- [ ] WebSocket tab shows messages
- [ ] No console errors
- [ ] Memory usage stable over time
- [ ] CPU usage <20% idle

---

## Phase 10: Deployment Considerations

### Multi-Server Setup
```javascript
// In production, use Redis adapter for multiple servers
const io = new SocketIO(server);
const pubClient = createClient({ url: env.redisUrl });
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));

// Sticky sessions (important!)
// Configure load balancer to route same user to same server
```

### Error Handling
```javascript
socket.on_error_handler = (error) => {
  console.error('Socket error:', error);
  // Implement error tracking (Sentry)
  // Send alert to admin dashboard
};
```

### Monitoring
- Set up alerts for socket connection failures
- Monitor Redis memory usage
- Track real-time event throughput
- Monitor CPU/memory per socket connection

---

## Estimated Timeline

| Phase | Tasks | Days |
|-------|-------|------|
| 1 | Installation & server config | 1 |
| 2 | Authentication middleware | 1 |
| 3 | Event types & payloads | 0.5 |
| 4 | Socket handlers | 2 |
| 5 | Service integration | 2 |
| 6 | Controller updates | 1 |
| 7 | Frontend socket client | 2 |
| 8 | Environment setup | 0.5 |
| 9 | Testing | 2 |
| 10 | Deployment prep | 1 |
| **Total** | **Implementation** | **~13 days** |

---

## Success Criteria

✅ Connections:
- [ ] 100+ concurrent connections stable
- [ ] Connection establishment <500ms
- [ ] Reconnection automatic within 3s

✅ Real-Time Events:
- [ ] Comments appear <200ms on all connected clients
- [ ] Notifications delivered <500ms
- [ ] No event loss on disconnect/reconnect

✅ Performance:
- [ ] Memory per socket: <1MB
- [ ] CPU usage: <0.1% per idle socket
- [ ] Event throughput: 1000+ events/sec

✅ Reliability:
- [ ] 99.9% uptime
- [ ] Automatic reconnection
- [ ] No duplicate events

---

**Next Step:** Begin Phase 1 implementation
