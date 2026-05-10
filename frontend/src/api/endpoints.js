import { api } from "./client";

export const authApi = {
  register: (payload) => api.post("/auth/register", payload),
  login: (payload) => api.post("/auth/login", payload),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me")
};

export const feedApi = {
  public: (params) => api.get("/posts/public", { params }),
  college: (params) => api.get("/posts/college", { params }),
  trending: () => api.get("/posts/trending"),
  create: (payload) => api.post("/posts", payload),
  like: (id) => api.post(`/posts/${id}/like`),
  save: (id) => api.post(`/posts/${id}/save`),
  saved: (params) => api.get("/posts/saved", { params })
};

export const userApi = {
  profile: (username) => api.get(`/users/${username}`),
  update: (payload) => api.patch("/users/me", payload),
  uploadProfilePicture: (formData, onUploadProgress) => api.patch("/users/me/profile-picture", formData, { onUploadProgress }),
  uploadCoverImage: (formData, onUploadProgress) => api.patch("/users/me/cover-image", formData, { onUploadProgress }),
  suggestions: () => api.get("/users/suggestions"),
  search: (params) => api.get("/users/search", { params })
};

export const collegeApi = {
  list: (params) => api.get("/colleges", { params }),
  create: (payload) => api.post("/colleges", payload),
  join: (payload) => api.post("/colleges/join", payload),
  detail: (slug) => api.get(`/colleges/${slug}`),
  mine: () => api.get("/colleges/me/current"),
  leave: () => api.delete("/colleges/leave"),
  members: (params) => api.get("/colleges/members/list", { params }),
  createInvite: (payload) => api.post("/colleges/invites", payload),
  invites: () => api.get("/colleges/invites"),
  revokeInvite: (id) => api.patch(`/colleges/invites/${id}/revoke`),
  updateRole: (collegeId, memberId, role) => api.patch(`/colleges/${collegeId}/members/${memberId}/role`, { role }),
  removeMember: (memberId) => api.delete(`/colleges/members/${memberId}`),
  transferOwner: (memberId) => api.patch(`/colleges/members/${memberId}/transfer-owner`),
  update: (payload) => api.patch("/colleges/update", payload),
  uploadLogo: (formData, onUploadProgress) => api.patch("/colleges/logo", formData, { onUploadProgress }),
  uploadBanner: (formData, onUploadProgress) => api.patch("/colleges/banner", formData, { onUploadProgress })
};

export const notificationApi = {
  list: (params) => api.get("/notifications", { params }),
  markAllRead: () => api.patch("/notifications/read-all")
};

export const announcementApi = {
  list: (params) => api.get("/announcements", { params }),
  create: (payload) => api.post("/announcements", payload),
  update: (id, payload) => api.patch(`/announcements/${id}`, payload),
  remove: (id) => api.delete(`/announcements/${id}`),
  react: (id) => api.post(`/announcements/${id}/react`)
};

export const commentApi = {
  list: (postId, params) => api.get(`/comments/post/${postId}`, { params }),
  create: (payload) => api.post("/comments", payload),
  like: (id) => api.post(`/comments/${id}/like`),
  remove: (id) => api.delete(`/comments/${id}`)
};

export const resourceApi = {
  list: (params) => api.get("/resources", { params }),
  create: (payload) => api.post("/resources", payload),
  save: (id) => api.post(`/resources/${id}/save`),
  remove: (id) => api.delete(`/resources/${id}`)
};

export const eventApi = {
  list: (params) => api.get("/events", { params }),
  create: (payload) => api.post("/events", payload),
  rsvp: (id) => api.post(`/events/${id}/rsvp`),
  bookmark: (id) => api.post(`/events/${id}/bookmark`)
};

export const reportApi = {
  create: (payload) => api.post("/reports", payload),
  list: (params) => api.get("/reports", { params }),
  update: (id, payload) => api.patch(`/reports/${id}`, payload)
};

export const analyticsApi = {
  college: () => api.get("/analytics/college")
};

export const searchApi = {
  global: (params) => api.get("/search", { params })
};
