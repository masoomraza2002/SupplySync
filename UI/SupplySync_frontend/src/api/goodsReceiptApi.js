import axiosInstance from "./axiosInstance";

export const goodsReceiptApi = {
  getAll: () => axiosInstance.get("/goodsreceipt"),

  getById: (id) => axiosInstance.get(`/goodsreceipt/${id}`),

  getByPO: (poId) => axiosInstance.get(`/goodsreceipt/po/${poId}`),

  create: (data) => axiosInstance.post("/goodsreceipt", data),
};
