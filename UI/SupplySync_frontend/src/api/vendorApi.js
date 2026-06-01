import axiosInstance from "./axiosInstance";

export const vendorApi = {
  getAll: () => axiosInstance.get("/vendor"),

  getById: (id) => axiosInstance.get(`/vendor/${id}`),

  getMyProfile: () => axiosInstance.get("/vendor/my-profile"),

  updateStatus: (id, data) =>
    axiosInstance.put(`/vendor/${id}/status`, data),

  suspend: (id) => axiosInstance.put(`/vendor/${id}/suspend`),

  reapply: (data) => axiosInstance.put("/vendor/reapply", data),
};
