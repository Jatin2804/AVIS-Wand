import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:9091/wand",
  withCredentials: true,
  timeout: 15000,
});

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;
