import { apiRequest } from "./apiClient";

export const deliveryService = {
  getDashboard: () => apiRequest("/delivery/dashboard"),
  getAssignedOrders: (params) => apiRequest("/delivery/orders", { params }),
  getOrder: (id) => apiRequest(`/delivery/orders/${id}`),
  updateAvailability: (isAvailable) =>
    apiRequest("/delivery/availability", {
      method: "PATCH",
      body: { isAvailable },
    }),
  updateStatus: (orderId, status, note) =>
    apiRequest(`/delivery/orders/${orderId}/status`, {
      method: "PATCH",
      body: { status, note },
    }),
  confirmPickup: (id) =>
    apiRequest(`/delivery/orders/${id}/pickup`, { method: "PATCH" }),
  markProcessing: (id) =>
    apiRequest(`/delivery/orders/${id}/processing`, { method: "PATCH" }),
  markReady: (id) =>
    apiRequest(`/delivery/orders/${id}/ready`, { method: "PATCH" }),
  markOutForDelivery: (id) =>
    apiRequest(`/delivery/orders/${id}/out-for-delivery`, { method: "PATCH" }),
  markDelivered: (id) =>
    apiRequest(`/delivery/orders/${id}/delivered`, { method: "PATCH" }),
};
