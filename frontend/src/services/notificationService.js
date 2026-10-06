import { apiRequest } from "./apiClient";

export const notificationService = {
  getMy: () => apiRequest("/notifications"),
  getUnreadCount: () => apiRequest("/notifications/unread-count"),
  markAllRead: () => apiRequest("/notifications/read-all", { method: "PATCH" }),
  markRead: (id) =>
    apiRequest(`/notifications/${id}/read`, { method: "PATCH" }),
};
