import { apiRequest } from "./apiClient";

export const adminService = {
  getDashboard: () => apiRequest("/admin/dashboard"),
  getDeliveryAgents: () => apiRequest("/admin/delivery-agents"),
  getOrders: (params) => apiRequest("/admin/orders", { params }),
  getOrder: (id) => apiRequest(`/admin/orders/${id}`),
  assignAgent: (id, deliveryAgentId) =>
    apiRequest(`/admin/orders/${id}/assign-agent`, {
      method: "PATCH",
      body: { deliveryAgentId },
    }),
  updateStatus: (id, status, note) =>
    apiRequest(`/admin/orders/${id}/status`, {
      method: "PATCH",
      body: { status, note },
    }),
};
