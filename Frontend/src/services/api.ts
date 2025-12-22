import axios from "axios";

// Base API URL - Backend server address
const API_BASE_URL = 
  import.meta.env.VITE_API_URL || "https://railway-api.artechnology.pro/api";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
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
      // Unauthorized - clear authentication and redirect to login
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("email");
      localStorage.removeItem("adminId");
      localStorage.removeItem("adminName");

      // Only redirect if not already on login page
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
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
  getAllWorkers: (params?: { admin_id?: string }) =>
    apiClient.get("/worker/get-all-workers", { params }),

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
  
  // New endpoints for worker dashboard
  getBookingsWorker: (adminId: string, workerId: string) =>
    apiClient.get(`/closebook/get-bookings-worker/${adminId}/${workerId}`),
  
  getWorkerDashboard: (adminId: string, workerId: string) =>
    apiClient.get(`/closebook/worker-dashboard/${adminId}/${workerId}`),
};

// ==================== ANALYTICS/DASHBOARD APIs ====================

export const analyticsAPI = {
  getDashboardStats: (params?: { admin_id?: string }) =>
    apiClient.get("/analytics/dashboard/stats", { params }),

  getMonthlyRevenue: (params?: {
    year?: number;
    months?: number;
    admin_id?: string;
  }) => apiClient.get("/analytics/dashboard/monthly-revenue", { params }),

  getDailyRevenue: (params?: {
    month?: number;
    year?: number;
    admin_id?: string;
  }) => apiClient.get("/analytics/dashboard/daily-revenue", { params }),

  getTopWorkers: (params?: {
    limit?: number;
    month?: number;
    year?: number;
    admin_id?: string;
  }) => apiClient.get("/analytics/dashboard/top-workers", { params }),

  getRecentBookings: (params?: {
    limit?: number;
    status?: string;
    admin_id?: string;
  }) => apiClient.get("/analytics/dashboard/recent-bookings", { params }),

  getPaymentAnalytics: (params?: {
    month?: number;
    year?: number;
    admin_id?: string;
  }) => apiClient.get("/analytics/dashboard/payment-analytics", { params }),
};

// ==================== SETTINGS APIs ====================

export const settingsAPI = {
  // Settings table endpoints - WORKING!
  getSettings: (adminId: string) =>
    apiClient.get(`/settings/get-settings/${adminId}`),

  upsertSettings: (adminId: string, data: any) =>
    apiClient.post(`/settings/${adminId}`, data),

  uploadLogo: (adminId: string, file: File) => {
    const formData = new FormData();
    formData.append("logo", file);
    // backend may expect multipart/form-data; axios will set headers automatically
    return apiClient.post(`/settings/upload-logo/${adminId}`, formData);
  },

  deleteSettings: (adminId: string) =>
    apiClient.delete(`/settings/delete-settings/${adminId}`),

  // Printer table endpoints
  getPrinterSettings: (adminId: string) =>
    apiClient.get(`/printer/get-printer/${adminId}`),

  // Type2 amounts endpoints
  getType2Amounts: (adminId: string) =>
    apiClient.get(`/type2-amount/get-amounts/${adminId}`).catch(() => ({ data: { data: [] } })),

  upsertType2Amounts: (adminId: string, data: any[]) =>
    apiClient
      .post(`/type2-amount/update-amounts/${adminId}`, { amounts: data })
      .catch(() => ({ data: { success: false } })),
};

export default apiClient;
