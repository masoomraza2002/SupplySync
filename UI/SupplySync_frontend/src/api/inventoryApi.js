import axiosInstance from "./axiosInstance";

export const inventoryApi = {
  getAll: () => axiosInstance.get("/inventory"),

  getById: (id) => axiosInstance.get(`/inventory/${id}`),

  create: (data) => axiosInstance.post("/inventory", data),

  issueItem: (data) => axiosInstance.post("/inventory/issue", data),

  getAllIssues: () => axiosInstance.get("/inventory/issues"),

  getIssuesByItem: (id) =>
    axiosInstance.get(`/inventory/${id}/issues`),
};
