import axiosInstance from "./axiosInstance";

export const contractApi = {
  getAll: () => axiosInstance.get("/contract"),

  getById: (id) => axiosInstance.get(`/contract/${id}`),

  getByVendor: (vendorId) =>
    axiosInstance.get(`/contract/vendor/${vendorId}`),

  create: (data) => axiosInstance.post("/contract", data),

  activate: (id) => axiosInstance.put(`/contract/${id}/activate`),

  close: (id) => axiosInstance.put(`/contract/${id}/close`),
};
