import axios from "axios"
//import { logout } from "../hooks/useAuth"

const API = axios.create({
  baseURL: "http://localhost:3001", // ✅ BACKEND PORT
  timeout: 10000
})

API.interceptors.request.use(config => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
      return;
    }

    throw new Error(err.response?.data?.message || "Request failed");
  }
);

export default API
