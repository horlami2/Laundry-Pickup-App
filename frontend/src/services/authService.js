import { apiRequest } from "./apiClient";

export const authService = {
  register: (data) =>
    apiRequest("/auth/register", { method: "POST", body: data }),
  login: (data) => apiRequest("/auth/login", { method: "POST", body: data }),
  getMe: () => apiRequest("/auth/me"),
};
