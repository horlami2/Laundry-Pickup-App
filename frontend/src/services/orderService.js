import { apiRequest } from "./apiClient";

export const orderService = {
  getDashboard: () => apiRequest("/orders/dashboard"),
  createOrder: (data) => apiRequest("/orders", { method: "POST", body: data }),
  getMyOrders: () => apiRequest("/orders/my-orders"),
  getOrder: (id) => apiRequest(`/orders/${id}`),
  trackOrder: (id) => apiRequest(`/orders/${id}/tracking`),
  cancelOrder: (id) => apiRequest(`/orders/${id}/cancel`, { method: "PATCH" }),
};
