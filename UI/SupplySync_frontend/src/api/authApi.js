import axiosInstance from "./axiosInstance";

export const authApi = {
  login: (data) =>
    axiosInstance.post("/auth/login", data),

  register: (data) =>
    axiosInstance.post("/auth/register", data),

  vendorRegister: (data) =>
    axiosInstance.post("/auth/vendor-register", data),
};
