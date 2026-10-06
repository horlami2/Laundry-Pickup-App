import { apiRequest } from "./apiClient";

export const paymentService = {
  initialize: (orderId) =>
    apiRequest(`/payments/initialize/${orderId}`, { method: "POST" }),
  verify: (reference) => apiRequest(`/payments/verify/${reference}`),
};
