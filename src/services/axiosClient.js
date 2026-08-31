import axios from "axios";
import Cookies from "js-cookie";
import env from "../env";

const BASE_URL = env.REACT_APP_API_URL;

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    accept: "application/json",
  },
});

// Helper to check if a token string is valid
const isValidToken = (token) => {
  return (
    typeof token === "string" &&
    token.trim() !== "" &&
    token !== "undefined" &&
    token !== "null"
  );
};

// Helper to retrieve token from Cookies or localStorage (checking 'token' and 'access_token')
export const getStoredToken = () => {
  const cookieToken = Cookies.get("token");
  if (isValidToken(cookieToken)) return cookieToken;

  const cookieAccessToken = Cookies.get("access_token");
  if (isValidToken(cookieAccessToken)) return cookieAccessToken;

  const localToken = localStorage.getItem("token");
  if (isValidToken(localToken)) return localToken;

  const localAccessToken = localStorage.getItem("access_token");
  if (isValidToken(localAccessToken)) return localAccessToken;

  return null;
};

// Helper to set token in both Cookies and localStorage
export const setStoredToken = (token) => {
  if (!token) return;
  Cookies.set("token", token);
  Cookies.set("access_token", token);
  localStorage.setItem("token", token);
  localStorage.setItem("access_token", token);
};

// Helper to clear tokens from both Cookies and localStorage
export const clearStoredTokens = () => {
  Cookies.remove("token");
  Cookies.remove("access_token");
  localStorage.removeItem("token");
  localStorage.removeItem("access_token");
};

// Request interceptor to automatically attach Authorization token
axiosClient.interceptors.request.use(
  (config) => {
    const token = getStoredToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Check if existing Authorization header is valid
      const existingAuth = config.headers.Authorization;
      if (typeof existingAuth === "string") {
        const tokenPart = existingAuth.replace(/^Bearer\s+/i, "").trim();
        if (!isValidToken(tokenPart)) {
          delete config.headers.Authorization;
        }
      } else {
        delete config.headers.Authorization;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to format responses standardly
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error?.response?.status === 401) {
      clearStoredTokens();
    }
    console.error("API Request Error:", error?.response || error?.message || error);
    return Promise.reject(error);
  }
);

export default axiosClient;

