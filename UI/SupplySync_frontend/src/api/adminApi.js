import axiosInstance from "./axiosInstance";

export const adminApi = {
  getUsers: () => axiosInstance.get("/admin/users"),

  toggleActive: (id) =>
    axiosInstance.put(`/admin/users/${id}/toggle-active`),

  resetPassword: (id, newPassword) =>
    axiosInstance.put(`/admin/users/${id}/reset-password`, JSON.stringify(newPassword)),

  changeRole: (id, role) =>
    axiosInstance.put(`/admin/users/${id}/change-role`, JSON.stringify(role)),
};
