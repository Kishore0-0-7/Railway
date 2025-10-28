import axios from "axios";

// Base API URL - Backend server address
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies
});

// Request interceptor for adding auth token if needed
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("username");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// ==================== ADMIN APIs ====================

export const adminAPI = {
  login: (email: string, password: string) =>
    apiClient.post("/admin/login", { email, password }),

  register: (adminData: any) => apiClient.post("/admin/register", adminData),

  getAllAdmins: () => apiClient.get("/admin/get-all-admins"),

  getAdminById: (id: string) => apiClient.get(`/admin/get-admin/${id}`),

  updateAdmin: (id: string, data: any) =>
    apiClient.put(`/admin/update-admin/${id}`, data),

  updatePassword: (id: string, data: any) =>
    apiClient.put(`/admin/update-password/${id}`, data),

  deleteAdmin: (id: string) => apiClient.delete(`/admin/delete-admin/${id}`),
};

// ==================== WORKER APIs ====================

export const workerAPI = {
  getAllWorkers: () => apiClient.get("/worker/get-all-workers"),

  getWorkerById: (id: string) => apiClient.get(`/worker/get-worker/${id}`),

  createWorker: (workerData: any) =>
    apiClient.post("/worker/create-worker", workerData),

  updateWorker: (id: string, data: any) =>
    apiClient.put(`/worker/update-worker/${id}`, data),

  updateWorkerPassword: (id: string, data: any) =>
    apiClient.put(`/worker/update-password/${id}`, data),

  deleteWorker: (id: string) => apiClient.delete(`/worker/delete-worker/${id}`),
};

// ==================== BOOKING APIs ====================

export const bookingAPI = {
  getAllBookings: (params?: Record<string, any>) =>
    apiClient.get("/bookings/get-all-bookings", { params }),

  getBookingById: (id: string) => apiClient.get(`/bookings/get-booking/${id}`),

  createBooking: (bookingData: any) =>
    apiClient.post("/bookings/create-booking", bookingData),

  submitBooking: (id: string, data: any) =>
    apiClient.put(`/bookings/submit-booking/${id}`, data),

  updateBookingPayment: (id: string, data: any) =>
    apiClient.put(`/bookings/update-payment/${id}`, data),

  deleteBooking: (id: string) =>
    apiClient.delete(`/bookings/delete-booking/${id}`),

  getWorkerBookings: (workerId: string) =>
    apiClient.get("/bookings/get-all-bookings", {
      params: { worker_id: workerId },
    }),
};

// ==================== ANALYTICS/DASHBOARD APIs ====================

export const analyticsAPI = {
  getDashboardStats: () => apiClient.get("/analytics/dashboard/stats"),

  getMonthlyRevenue: (params?: { year?: number; months?: number }) =>
    apiClient.get("/analytics/dashboard/monthly-revenue", { params }),

  getDailyRevenue: (params?: { month?: number; year?: number }) =>
    apiClient.get("/analytics/dashboard/daily-revenue", { params }),

  getTopWorkers: (params?: { limit?: number; month?: number; year?: number }) =>
    apiClient.get("/analytics/dashboard/top-workers", { params }),

  getRecentBookings: (params?: { limit?: number; status?: string }) =>
    apiClient.get("/analytics/dashboard/recent-bookings", { params }),

  getPaymentAnalytics: (params?: { month?: number; year?: number }) =>
    apiClient.get("/analytics/dashboard/payment-analytics", { params }),
};

export default apiClient;
