import axiosInstance from "./axiosInstance";

export const reportsApi = {
  vendorPerformance: () => axiosInstance.get("/reports/vendor-performance"),

  inventorySummary: () => axiosInstance.get("/reports/inventory-summary"),

  procurementSpending: () => axiosInstance.get("/reports/procurement-spending"),

  deliveryDelays: () => axiosInstance.get("/reports/delivery-delays"),

  itemIssues: () => axiosInstance.get("/reports/item-issues"),

  complianceSummary: () => axiosInstance.get("/reports/compliance-summary"),
};
