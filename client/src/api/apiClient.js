import axios from "axios";
let getAuthState = () => ({ token: null });
export const setAuthGetter = (fn) => {
  getAuthState = fn;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // || 'http://localhost:5008/api',
  timeout: 15000,
  withCredentials: true, // IMPORTANT: send cookies
});

// You can still keep interceptor for Authorization header if you want hybrid behavior
api.interceptors.request.use(
  (config) => {
    const { token } = getAuthState();
    if (token) config.headers.Authorization = `Bearer ${token}`; // optional
    return config;
  },
  (err) => Promise.reject(err)
);

export default api;
