import axiosInstance from "./axiosInstance";

export const purchaseOrderApi = {
  getAll: () => axiosInstance.get("/purchaseorder"),

  getById: (id) => axiosInstance.get(`/purchaseorder/${id}`),

  getByVendor: (vendorId) =>
    axiosInstance.get(`/purchaseorder/vendor/${vendorId}`),

  create: (data) => axiosInstance.post("/purchaseorder", data),

  updateStatus: (id, status) =>
    axiosInstance.put(`/purchaseorder/${id}/status?status=${status}`),

  cancel: (id) => axiosInstance.put(`/purchaseorder/${id}/cancel`),
};
