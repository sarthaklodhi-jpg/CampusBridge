# CampusBridge - Quick Fix Checklist

## CRITICAL FIXES (Do First - Week 1)

### Frontend Issues

#### [ ] Fix useEffect Dependencies
- [ ] [CollegeFeedPage.jsx](frontend/src/pages/CollegeFeedPage.jsx#L14) - Add missing dependencies and error handling
- [ ] [DashboardPage.jsx](frontend/src/pages/DashboardPage.jsx#L18) - Add `setLoading` dependency
- [ ] [CollegeManagementPage.jsx](frontend/src/pages/CollegeManagementPage.jsx#L61) - Fix debounce effect dependency
- [ ] Review all other pages for similar issues

#### [ ] Add Pagination Parameters
Frontend pages need `page` and `limit` params:
- [ ] [CollegeFeedPage.jsx](frontend/src/pages/CollegeFeedPage.jsx) - Add `?limit=20&page=1`
- [ ] [ResourcesPage.jsx](frontend/src/pages/ResourcesPage.jsx) - Add pagination to `resourceApi.list()`
- [ ] [NotificationsPage.jsx](frontend/src/pages/NotificationsPage.jsx) - Add pagination to `notificationApi.list()`
- [ ] [EventsPage.jsx](frontend/src/pages/EventsPage.jsx) - Add pagination to `eventApi.list()`
- [ ] [AnalyticsPage.jsx](frontend/src/pages/AnalyticsPage.jsx) - No pagination needed (admin only)

#### [ ] Memoize List Components
- [ ] Wrap [PostCard.jsx](frontend/src/components/feed/PostCard.jsx) with `React.memo()`
- [ ] Wrap [UserCard.jsx](frontend/src/components/profile/UserCard.jsx) with `React.memo()`
- [ ] Add proper comparison functions to memo wrappers

#### [ ] Optimize Search
- [ ] [SearchPage.jsx](frontend/src/pages/SearchPage.jsx) - Limit results per entity type
- [ ] Implement result limit constants (e.g., 5 users, 5 posts per search)

### Backend Issues

#### [ ] Fix N+1 Query in Post Service
- [ ] [post.service.js](backend/src/services/post.service.js#L29) - Fix `listTrendingPosts()` to use `.limit(8).lean()`
- [ ] [post.service.js](backend/src/services/post.service.js#L49) - Optimize `getSavedPosts()` populate
- [ ] Add `.lean()` to all list endpoints

#### [ ] Fix Comment Service N+1
- [ ] [comment.service.js](backend/src/services/comment.service.js#L43) - Verify populate indexes
- [ ] Test comment list performance with 1000+ comments

#### [ ] Optimize User Service
- [ ] [user.service.js](backend/src/services/user.service.js#L44) - Replace `getSuggestions()` with aggregation
- [ ] [user.service.js](backend/src/services/user.service.js#L30) - Paginate `connections` population

#### [ ] Add Missing Database Indexes
Run these in MongoDB:
```javascript
// Posts
db.posts.createIndex({ "author": 1, "college": 1, "createdAt": -1 })
db.posts.createIndex({ "college": 1, "isPublic": 1, "createdAt": -1 })
db.posts.createIndex({ "tags": 1 })

// Users
db.users.createIndex({ "college": 1, "role": 1 })
db.users.createIndex({ "username": 1 })

// Comments
db.comments.createIndex({ "post": 1, "parent": 1, "createdAt": 1 })

// Notifications
db.notifications.createIndex({ "recipient": 1, "readAt": 1, "createdAt": -1 })
db.notifications.createIndex({ "createdAt": 1 }, { "expireAfterSeconds": 7776000 })

// Connection Requests
db.connectionrequests.createIndex({ "recipient": 1, "status": 1, "createdAt": -1 })
```

#### [ ] Fix Analytics Query
- [ ] [analytics.service.js](backend/src/services/analytics.service.js) - Combine 7 queries into 1 aggregation

---

## MEDIUM PRIORITY FIXES (Week 2)

#### [ ] Split AuthContext
- [ ] Create `AuthContext` (token, isAuthenticated only)
- [ ] Create `UserContext` (user data, profile picture, etc.)
- [ ] Create `AuthActionsContext` (login, register, logout)
- [ ] Update all consumers to use appropriate context
- [ ] Measure re-renders with React DevTools Profiler

#### [ ] Add Redis Caching to Auth Middleware
- [ ] [auth.middleware.js](backend/src/middleware/auth.middleware.js) - Cache user lookup for 5 minutes
- [ ] Add Redis connection to backend
- [ ] Implement cache invalidation on user updates

#### [ ] Optimize Search Controller
- [ ] [search.controller.js](backend/src/controllers/search.controller.js) - Add result limits
- [ ] Change 6 parallel queries to optimized search
- [ ] Consider Elasticsearch for future scale

#### [ ] Fix Comment Like Operations
- [ ] [comment.service.js](backend/src/services/comment.service.js#L85) - Use MongoDB atomic operations
- [ ] Replace `post.likes.some()` with `$elemMatch` query

#### [ ] Implement Cursor Pagination
- [ ] Choose cursor field (use `_id` or `createdAt`)
- [ ] Implement `getCursor()` and `applyPaginationCursor()` utilities
- [ ] Update all list endpoints to use cursor pagination

---

## REAL-TIME INFRASTRUCTURE (Week 3-4)

#### [ ] Socket.io Setup
- [ ] [ ] `npm install socket.io socket.io-client`
- [ ] [ ] Configure Socket.io server in [server.js](backend/src/server.js)
- [ ] [ ] Add CORS config for socket.io
- [ ] [ ] Create [backend/src/realtime/socket.js](backend/src/realtime/socket.js)

#### [ ] Socket Authentication
- [ ] [ ] Create socket auth middleware in [backend/src/middleware/socket.auth.js](backend/src/middleware/socket.auth.js)
- [ ] [ ] Validate JWT token on socket connection
- [ ] [ ] Attach user to socket object
- [ ] [ ] Rate limit by user ID

#### [ ] Define Real-Time Events
- [ ] [ ] Update [backend/src/realtime/events.js](backend/src/realtime/events.js) with 10+ event types
- [ ] [ ] Add event payloads and documentation

#### [ ] Implement Socket Rooms
- [ ] [ ] Create college-based rooms: `college:${collegeId}`
- [ ] [ ] Create user-specific rooms: `user:${userId}`
- [ ] [ ] Join users to rooms on connection
- [ ] [ ] Leave rooms on disconnect

#### [ ] Frontend Socket Client
- [ ] [ ] Create [frontend/src/services/socket.js](frontend/src/services/socket.js)
- [ ] [ ] Initialize socket connection in [App.jsx](frontend/src/App.jsx)
- [ ] [ ] Create custom hooks for socket subscriptions
- [ ] [ ] Implement reconnection logic

#### [ ] Replace Custom Events with Socket Events
- [ ] [ ] [backend/src/services/comment.service.js](backend/src/services/comment.service.js) - Use socket.io instead of EventEmitter
- [ ] [ ] [backend/src/services/notification.service.js](backend/src/services/notification.service.js) - Use socket.io
- [ ] [ ] Update [useRealtimeReady.js](frontend/src/hooks/useRealtimeReady.js) to use actual socket

---

## TESTING & VALIDATION

#### [ ] Performance Testing
- [ ] Measure API response times before/after optimizations
- [ ] Monitor database query time (target: <100ms for 99th percentile)
- [ ] Profile React render times with DevTools
- [ ] Load test with 100 concurrent users

#### [ ] Test useEffect Fixes
- [ ] [ ] Verify no duplicate API calls on component mount
- [ ] [ ] Test with slow 3G to confirm behavior
- [ ] [ ] Check Network tab in DevTools for request deduplication

#### [ ] Test Pagination
- [ ] [ ] Verify pagination params are sent
- [ ] [ ] Test edge cases (page=0, limit=0, limit>max)
- [ ] [ ] Verify infinite scroll works if implemented

#### [ ] Test Memoization
- [ ] [ ] Profile component with React DevTools Profiler before fix
- [ ] [ ] Profile after wrapping with React.memo()
- [ ] [ ] Target: 60-80% reduction in renders

#### [ ] Real-Time Testing
- [ ] [ ] Open 2 browsers, verify comment appears in real-time
- [ ] [ ] Test notification push
- [ ] [ ] Verify offline behavior (should queue and sync)
- [ ] [ ] Test with 50+ concurrent socket connections

---

## ESTIMATED TIME BREAKDOWN

| Phase | Tasks | Duration | Risk |
|-------|-------|----------|------|
| Phase 1 | useEffect, pagination, memoization | 3 days | Low |
| Phase 2 | N+1 fixes, indexing, context split | 4 days | Low |
| Phase 3 | Socket.io setup, authentication | 5 days | Medium |
| Phase 4 | Socket events, room management | 3 days | Medium |
| Testing | Performance validation | 2 days | Low |
| **Total** | **All phases** | **~2 weeks** | **Low-Medium** |

---

## SUCCESS METRICS

### After Phase 1
- [ ] API calls per session: 150 → 50 (✅ 67% reduction)
- [ ] First Contentful Paint: 3s → 1.5s (✅ 50% faster)
- [ ] No console errors in 5-minute session

### After Phase 2
- [ ] DB queries per page load: 15 → 3 (✅ 80% reduction)
- [ ] Time to Interactive: 5s → 2s (✅ 60% faster)
- [ ] Search response: 3s → 500ms (✅ 85% faster)

### After Phase 3-4
- [ ] Notification delay: 60s → <500ms (✅ 99% faster)
- [ ] Comment appears in real-time across browsers
- [ ] Handles 100+ concurrent users without degradation

---

## REFERENCE: Code Snippets for Fixes

### Fix #1: useEffect Dependency Array
```javascript
// ❌ BEFORE
useEffect(() => {
  feedApi.college().then(({ data }) => setPosts(data.data.posts));
}, [user?.college]);

// ✅ AFTER
useEffect(() => {
  if (!user?.college) {
    setLoading(false);
    return;
  }
  
  feedApi.college({ page: 1, limit: 20 })
    .then(({ data }) => setPosts(data.data.posts))
    .catch(() => toast.error("Failed to load feed"))
    .finally(() => setLoading(false));
}, [user?.college]);
```

### Fix #2: React.memo for List Items
```javascript
// ❌ BEFORE
export default function PostCard({ post }) {
  // ...
}

// ✅ AFTER
export default React.memo(function PostCard({ post }) {
  // ...
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if post ID or likes changed
  return prevProps.post._id === nextProps.post._id &&
         prevProps.post.likes.length === nextProps.post.likes.length &&
         prevProps.post.commentsCount === nextProps.post.commentsCount;
});
```

### Fix #3: N+1 Query
```javascript
// ❌ BEFORE
export const listTrendingPosts = async () =>
  Post.find({ isPublic: true })
    .populate(populatePost)
    .sort({ commentsCount: -1, likes: -1, createdAt: -1 })
    .limit(8);

// ✅ AFTER
export const listTrendingPosts = async () =>
  Post.find({ isPublic: true })
    .populate(populatePost)
    .sort({ commentsCount: -1, likes: -1, createdAt: -1 })
    .limit(8)
    .lean()
    .exec();
```

### Fix #4: Pagination Parameters
```javascript
// ❌ BEFORE
feedApi.college()

// ✅ AFTER
feedApi.college({ 
  page: 1, 
  limit: 20  // or use cursor: lastPostId
})
```

---

**Last Updated:** May 10, 2026  
**Status:** Ready for implementation  
**Owner:** Dev Team
