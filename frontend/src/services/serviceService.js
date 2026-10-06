import { apiRequest } from "./apiClient";

export const serviceService = {
  getActive: (category) =>
    apiRequest("/services/active", {
      params: category ? { category } : undefined,
    }),
  getAll: () => apiRequest("/services"),
  getOne: (id) => apiRequest(`/services/${id}`),
  create: (formData) =>
    apiRequest("/services", {
      method: "POST",
      body: formData,
      isFormData: true,
    }),
  update: (id, formData) =>
    apiRequest(`/services/${id}`, {
      method: "PATCH",
      body: formData,
      isFormData: true,
    }),
  toggleStatus: (id) =>
    apiRequest(`/services/${id}/toggle-status`, { method: "PATCH" }),
  remove: (id) => apiRequest(`/services/${id}`, { method: "DELETE" }),
};
