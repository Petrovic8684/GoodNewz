import axios from "axios";
import baseUrl from "./baseUrl";

const api = axios.create({
  baseURL: baseUrl,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      error.response.data &&
      error.response.data.message === "Invalid or expired token!"
    ) {
      window.alert("Your session has expired. Please log in again.");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
