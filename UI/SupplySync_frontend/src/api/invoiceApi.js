import axiosInstance from "./axiosInstance";

export const invoiceApi = {
  getAll: () => axiosInstance.get("/invoice"),

  getById: (id) => axiosInstance.get(`/invoice/${id}`),

  getByVendor: (vendorId) =>
    axiosInstance.get(`/invoice/vendor/${vendorId}`),

  submit: (data) => axiosInstance.post("/invoice", data),

  review: (id, data) =>
    axiosInstance.put(`/invoice/${id}/review`, data),

  processPayment: (data) =>
    axiosInstance.post("/invoice/payment", data),
};
