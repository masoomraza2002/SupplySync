import axiosInstance from "./axiosInstance";

export const complianceApi = {
  getAll: () => axiosInstance.get("/compliance"),

  getByEntity: (entityType, entityId) =>
    axiosInstance.get(`/compliance/entity?entityType=${entityType}&entityId=${entityId}`),

  getFailed: () => axiosInstance.get("/compliance/failed"),

  performCheck: (data) => axiosInstance.post("/compliance", data),
};
