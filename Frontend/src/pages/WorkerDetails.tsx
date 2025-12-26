import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useMemo } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Search, Calendar } from "lucide-react";
import { toast } from "sonner";
import { getCookie } from "@/lib/cookieUtils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { workerAPI, bookingAPI } from "@/services/api";
import {
  getEnabledSeatingTypes,
  formatSeatingTypeLabel,
  mapLegacyBookingType,
  getSeatingTypePrice,
} from "@/lib/settingsUtils";
import { useScrollToTop } from "@/hooks/useScrollToTop";

const WorkerDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const mainContainerRef = useRef<HTMLDivElement>(null);

  // navigation may pass worker object in state; start with that as a seed while we fetch fresh data
  const seedWorker = location.state?.worker || {
    id: 1,
    worker_id: "#1223",
    loginId: "#1223",
    name: "Paul Walker",
    gender: "Male",
    phone: "9516155854",
    joiningDate: "20 Sep 2025",
    status: "active",
  };

  // helper to determine worker id to call backend with. Prefer worker_id from API/other pages.
  const workerId =
    location.state?.worker?.worker_id ||
    location.state?.worker?.id ||
    seedWorker.worker_id ||
    seedWorker.id ||
    seedWorker.loginId;

  const [worker, setWorker] = useState<any>(seedWorker);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Dynamic stats based on Settings seating types
  const enabledSeatingTypes = getEnabledSeatingTypes();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    completedBookings: 0,
    activeBookings: 0,
    // Dynamic seating type counters
    seatingTypeStats: {} as Record<string, number>,
  });
  // Balance amount state - persisted in localStorage
  const [balanceAmount, setBalanceAmount] = useState<number>(() => {
    const stored = localStorage.getItem(`worker_balance_${workerId}`);
    return stored ? parseFloat(stored) : 0;
  });
  const [todaysAmount, setTodaysAmount] = useState<number>(0);
  const [balanceDays, setBalanceDays] = useState<number>(() => {
    const stored = localStorage.getItem(`worker_balance_days_${workerId}`);
    return stored ? parseInt(stored) : 0;
  });
  const [lastBalanceDate, setLastBalanceDate] = useState<string>(() => {
    return localStorage.getItem(`worker_balance_date_${workerId}`) || "";
  });
  // Confirmation dialog state
  const [showCloseConfirm, setShowCloseConfirm] = useState<boolean>(false);
  // table filter range: today / week / month / year
  const [rangeFilter, setRangeFilter] = useState<string>("today");
  // search term for filtering bookings
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Scroll to top on route change
  useScrollToTop();

  // Check if it's a new day and increment balance days
  useEffect(() => {
    const today = new Date().toDateString();
    if (balanceAmount > 0 || todaysAmount > 0) {
      if (!lastBalanceDate) {
        // First day with balance
        setBalanceDays(1);
        setLastBalanceDate(today);
        localStorage.setItem(`worker_balance_days_${workerId}`, "1");
        localStorage.setItem(`worker_balance_date_${workerId}`, today);
      } else if (lastBalanceDate !== today) {
        // New day - increment counter
        const newDays = balanceDays + 1;
        setBalanceDays(newDays);
        setLastBalanceDate(today);
        localStorage.setItem(`worker_balance_days_${workerId}`, newDays.toString());
        localStorage.setItem(`worker_balance_date_${workerId}`, today);
      }
    }
  }, [balanceAmount, todaysAmount, lastBalanceDate, balanceDays, workerId]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get admin ID from cookies
        const adminId = getCookie("adminId");
        console.log("Admin ID from cookies:", adminId);
        console.log("Worker ID:", workerId);

        // Fetch fresh worker details if we have an id
        if (workerId) {
          const wResp = await workerAPI.getWorkerById(String(workerId));
          if (wResp?.data?.worker) {
            const wk = wResp.data.worker;
            setWorker({
              ...wk,
              status:
                wk.status || wk.worker_status || wk.workerStatus || "active",
            });
          } else if (wResp?.data) {
            // some APIs return the object at data directly
            const wk = wResp.data;
            setWorker({
              ...wk,
              status:
                wk.status || wk.worker_status || wk.workerStatus || "active",
            });
          }

          // Call new API endpoints with adminId and workerId
          let fetchedBookings: any[] = [];
          let dashboardData: any = null;

          if (adminId) {
            console.log("\n=== Calling get-bookings-worker API ===");
            const bookingsWorkerResp = await bookingAPI.getBookingsWorker(
              adminId,
              String(workerId)
            );
            console.log("get-bookings-worker Response:", bookingsWorkerResp.data);

            // Use bookings from get-bookings-worker if available
            if (bookingsWorkerResp?.data?.success && bookingsWorkerResp?.data?.bookings) {
              fetchedBookings = bookingsWorkerResp.data.bookings;
            } else if (Array.isArray(bookingsWorkerResp?.data?.bookings)) {
              fetchedBookings = bookingsWorkerResp.data.bookings;
            }

            console.log("\n=== Calling worker-dashboard API ===");
            const workerDashboardResp = await bookingAPI.getWorkerDashboard(
              adminId,
              String(workerId)
            );
            console.log("worker-dashboard Response:", workerDashboardResp.data);
            dashboardData = workerDashboardResp?.data;
          } else {
            console.warn("Admin ID not found in cookies");
          }

          // Robust fallback: if bookings are still empty or adminId missing, fetch by worker_id param
          if (!fetchedBookings || fetchedBookings.length === 0) {
            console.log("\n=== Fallback: Calling bookings/get-all-bookings?worker_id ===");
            const workerBookingsResp = await bookingAPI.getWorkerBookings(String(workerId));
            const wb = workerBookingsResp?.data;
            // Support multiple response shapes
            if (Array.isArray((wb as any)?.bookings)) {
              fetchedBookings = (wb as any).bookings;
            } else if (Array.isArray((wb as any)?.data)) {
              fetchedBookings = (wb as any).data as any[];
            } else if (Array.isArray(wb)) {
              fetchedBookings = wb as any[];
            } else {
              fetchedBookings = [];
            }
          }

          setBookings(fetchedBookings);

          // Use data from worker-dashboard API if available, otherwise calculate
          if (dashboardData && dashboardData.success !== false) {
            // Update stats from API response
            const seatingTypeStats: Record<string, number> = {};

            // Map API response to seating type stats
            enabledSeatingTypes.forEach((seatingType) => {
              if (seatingType.key === 'sitting') {
                seatingTypeStats[seatingType.key] = dashboardData.sittingCount || dashboardData.sitting_count || 0;
              } else if (seatingType.key === 'sleeper') {
                seatingTypeStats[seatingType.key] = dashboardData.sleeperCount || dashboardData.sleeper_count || 0;
              } else {
                // For other types, try to find in response
                seatingTypeStats[seatingType.key] = dashboardData[`${seatingType.key}Count`] || dashboardData[`${seatingType.key}_count`] || 0;
              }
            });

            setStats({
              totalRevenue: parseFloat(dashboardData.totalRevenue || dashboardData.total_revenue || 0),
              totalBookings: parseInt(dashboardData.totalBookings || dashboardData.total_bookings || 0),
              completedBookings: parseInt(dashboardData.completedBookings || dashboardData.completed_bookings || 0),
              activeBookings: parseInt(dashboardData.activeBookings || dashboardData.active_bookings || 0),
              seatingTypeStats,
            });

            // Update balance and today's amount from dashboard data
            if (dashboardData.balanceAmount !== undefined || dashboardData.balance_amount !== undefined) {
              const balance = parseFloat(dashboardData.balanceAmount || dashboardData.balance_amount || 0);
              setBalanceAmount(balance);
              localStorage.setItem(`worker_balance_${workerId}`, balance.toString());
            }

            if (dashboardData.todaysAmount !== undefined || dashboardData.todays_amount !== undefined) {
              setTodaysAmount(parseFloat(dashboardData.todaysAmount || dashboardData.todays_amount || 0));
            }
          } else {
            // Fallback: Calculate statistics from bookings if API data not available
            const totalRevenue = fetchedBookings.reduce((sum, booking) => {
              return (
                sum + parseFloat(booking.total_amount || booking.totalAmount || 0)
              );
            }, 0);

            const completedBookings = fetchedBookings.filter(
              (b) => b.status === "completed" || b.status === "Completed"
            ).length;

            const activeBookings = fetchedBookings.filter(
              (b) =>
                b.status === "active" ||
                b.status === "Active" ||
                b.status === "Booked"
            ).length;

            // Calculate stats for each enabled seating type
            const seatingTypeStats: Record<string, number> = {};
            enabledSeatingTypes.forEach((seatingType) => {
              seatingTypeStats[seatingType.key] = fetchedBookings.filter((b) => {
                const bookingType = mapLegacyBookingType(
                  b.booking_type || b.type || ""
                );
                return (
                  bookingType === seatingType.key &&
                  (b.status === "active" ||
                    b.status === "Active" ||
                    b.status === "Booked")
                );
              }).length;
            });

            setStats({
              totalRevenue,
              totalBookings: fetchedBookings.length,
              completedBookings,
              activeBookings,
              seatingTypeStats,
            });
          }
        }
      } catch (err: any) {
        console.error("Error fetching worker or bookings:", err);
        setError(
          err.response?.data?.message || err.message || "Failed to load data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workerId]);

  const handleStatusToggle = async () => {
    try {
      // normalize status to lowercase for API (DB uses 'active'/'inactive')
      const current = (worker?.status || "active").toString().toLowerCase();
      const newStatus = current === "active" ? "inactive" : "active";
      // Prefer using worker_id for API calls
      const idForApi = worker?.worker_id || worker?.id || workerId;
      if (!idForApi) {
        throw new Error("No worker id available to update status");
      }

      // Call backend to update worker status
      // send both keys to be compatible with remote/backwards-compatible APIs
      await workerAPI.updateWorker(String(idForApi), {
        status: newStatus,
        worker_status: newStatus,
      });

      // update local state for immediate UI feedback
      setWorker((prev: any) => ({ ...(prev || {}), status: newStatus }));

      // Navigate back to worker list
      navigate(-1);
    } catch (err) {
      console.error("Error updating worker status:", err);
      setError(
        (err as any)?.response?.data?.message ||
        (err as any)?.message ||
        "Failed to update status"
      );
    }
  };

  const handleEditDetails = () => {
    // Pull seating types from localStorage so edit screen can show the current selection
    const storedSeatingTypes = JSON.parse(
      localStorage.getItem("workerSeatingTypes") || "{}"
    );
    const workerSeatingTypes =
      storedSeatingTypes[worker.worker_id || worker.id || worker.loginId] ||
      worker.seating_types ||
      [];

    // Navigate to ManageLogin page with worker data
    navigate("/manage-login", {
      state: {
        editingWorker: {
          worker_id: worker.worker_id || worker.id || worker.loginId,
          full_name: worker.full_name || worker.name,
          mobile_number: worker.mobile_number || worker.phone,
          joining_date: worker.created_at || worker.joiningDate,
          gender: worker.gender,
          user_name: worker.user_name || worker.loginId,
          created_at: worker.created_at,
          status: worker.status || "active",
          total_bookings: stats.totalBookings,
          seating_types: workerSeatingTypes,
        },
      },
    });
  };

  // derive bookings to show in table based on selected range and search term
  const filteredBookings = useMemo(() => {
    if (!bookings || bookings.length === 0) return [];

    const now = new Date();
    const msInDay = 24 * 60 * 60 * 1000;

    const parseDate = (b: any): Date | null => {
      const ds =
        b.booking_date ||
        b.created_at ||
        b.date ||
        b.bookingDate ||
        b.in_date ||
        null;
      if (!ds) return null;
      const d = new Date(ds);
      if (isNaN(d.getTime())) return null;
      return d;
    };

    // First filter by date range
    let dateFiltered: any[] = [];

    if (rangeFilter === "today") {
      dateFiltered = bookings.filter((b) => {
        const d = parseDate(b);
        if (!d) return false;
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth() &&
          d.getDate() === now.getDate()
        );
      });
    } else {
      const days =
        rangeFilter === "week" ? 7 : rangeFilter === "month" ? 30 : 365;
      const cutoff = new Date(now.getTime() - days * msInDay);

      dateFiltered = bookings.filter((b) => {
        const d = parseDate(b);
        if (!d) return false;
        return d >= cutoff && d <= now;
      });
    }

    // Then filter by search term (booking ID and guest name)
    if (!searchTerm.trim()) {
      return dateFiltered;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    return dateFiltered.filter((b) => {
      const bookingId = (b.booking_id || b.id || "").toString().toLowerCase();
      const guestName = (b.guest_name || b.name || "").toString().toLowerCase();
      return bookingId.includes(lowerSearchTerm) || guestName.includes(lowerSearchTerm);
    });
  }, [bookings, rangeFilter, searchTerm]);

  // Today's bookings count (independent of selected range)
  const todaysBookingsCount = useMemo(() => {
    if (!bookings || bookings.length === 0) return 0;
    const now = new Date();
    const isToday = (d: Date) =>
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
    const parseDate = (b: any): Date | null => {
      const ds =
        b.booking_date ||
        b.created_at ||
        b.date ||
        b.bookingDate ||
        b.in_date ||
        null;
      if (!ds) return null;
      const d = new Date(ds);
      if (isNaN(d.getTime())) return null;
      return d;
    };
    return bookings.filter((b) => {
      const d = parseDate(b);
      return d ? isToday(d) : false;
    }).length;
  }, [bookings]);
  // Handle balance close confirmation
  const handleCloseBalance = async () => {
    try {
      const adminId = getCookie("adminId");
      if (!adminId) {
        toast.error("Admin ID not found. Please log in again.");
        return;
      }
      
      // Call the API to update worker balance
      const response = await bookingAPI.updateWorkerBalance(adminId, String(workerId));
      
      if (response?.data?.success) {
        setBalanceAmount(0);
        localStorage.setItem(`worker_balance_${workerId}`, "0");
        setShowCloseConfirm(false);
        toast.success("Balance reset to ₹0");
      } else {
        toast.error(response?.data?.message || "Failed to reset balance");
      }
    } catch (err: any) {
      console.error("Error resetting worker balance:", err);
      toast.error(
        err?.response?.data?.message || 
        err?.message || 
        "Failed to reset balance"
      );
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="p-4 sm:p-6" ref={mainContainerRef}>
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-medium">Error loading data</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Header */}
          <div className="bg-black text-white rounded-xl p-4 sm:p-6 lg:p-8">
            {/* Desktop layout */}
            <div className="hidden sm:flex items-center justify-between">
              <h1 className="text-2xl sm:text-3xl font-bold">
                {worker.full_name || worker.name}
              </h1>
              <div className="flex items-center gap-3">
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base px-4 sm:px-5 py-2 sm:py-2.5 h-auto whitespace-nowrap"
                  onClick={() => setShowCloseConfirm(true)}
                >
                  Close Balance
                </Button>
                <Button
                  variant="destructive"
                  className={`text-sm sm:text-base px-4 sm:px-5 py-2 sm:py-2.5 h-auto whitespace-nowrap ${(worker.status || "active").toString().toLowerCase() ===
                    "active"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                    } text-white`}
                  onClick={handleStatusToggle}
                >
                  {(worker.status || "active").toString().toLowerCase() ===
                    "active"
                    ? "Inactive Worker"
                    : "Re-Join"}
                </Button>
                <Button
                  variant="outline"
                  className="bg-white text-black hover:bg-gray-100 text-sm sm:text-base px-4 sm:px-5 py-2 sm:py-2.5 h-auto whitespace-nowrap"
                  onClick={handleEditDetails}
                >
                  Edit Details
                </Button>
              </div>
            </div>

            {/* Mobile layout */}
            <div className="sm:hidden space-y-3">
              <h1 className="text-xl font-bold mb-4">
                {worker.full_name || worker.name}
              </h1>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="destructive"
                  className={`text-sm px-3 py-2 h-auto whitespace-nowrap w-full ${(worker.status || "active").toString().toLowerCase() ===
                    "active"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                    } text-white`}
                  onClick={handleStatusToggle}
                >
                  {(worker.status || "active").toString().toLowerCase() ===
                    "active"
                    ? "Inactive Worker"
                    : "Re-Join"}
                </Button>
                <Button
                  variant="outline"
                  className="bg-white text-black hover:bg-gray-100 text-sm px-3 py-2 h-auto whitespace-nowrap w-full"
                  onClick={handleEditDetails}
                >
                  Edit Details
                </Button>
              </div>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 h-auto whitespace-nowrap w-full"
                onClick={() => setShowCloseConfirm(true)}
              >
                Close Balance
              </Button>
            </div>
          </div>

          {/* Stats - Dashboard Style */}
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
            {/* Balance Amount - 1x width */}
            <div className="flex-1 bg-white border border-gray-200 p-4 sm:p-6 rounded-xl shadow-sm">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Balance Amount</p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    ₹{loading ? "..." : (balanceAmount + todaysAmount).toLocaleString("en-IN")}
                  </h2>
                </div>
                <div className="border-l border-gray-300 pl-6">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Today's bookings</p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{loading ? "..." : todaysBookingsCount}</h2>
                </div>
              </div>
            </div>

            {/* Completed - 0.7x width (narrower) */}
            <div className="flex-[0.7] bg-white border border-gray-200 p-4 sm:p-6 rounded-xl shadow-sm">
              <p className="text-xs sm:text-sm text-gray-600 mb-2">Completed</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {loading ? "..." : stats.completedBookings}
              </h2>
              <p className="text-green-500 text-xs font-medium">
                {stats.totalBookings > 0
                  ? `${(
                    (stats.completedBookings / stats.totalBookings) *
                    100
                  ).toFixed(1)}% completion rate`
                  : "No bookings yet"}
              </p>
            </div>

            {/* Active Bookings by Type - 1.5x width */}
            <div className="flex-1.5 bg-white border border-gray-200 p-4 sm:p-6 rounded-xl shadow-sm">
              <p className="text-xs sm:text-sm text-gray-600 mb-3">Active Bookings by Type</p>
              <div className="grid grid-cols-2 gap-6">
                {enabledSeatingTypes.map((seatingType) => (
                  <div key={seatingType.key} className="text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {loading
                        ? "..."
                        : stats.seatingTypeStats[seatingType.key] || 0}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">{seatingType.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Revenue - 1.5x width */}
            <div className="flex-1 bg-black text-white p-4 sm:p-6 rounded-xl shadow-lg">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs sm:text-sm text-gray-300 mb-1">Total Revenue</p>
                  <h2 className="text-2xl sm:text-3xl font-bold">
                    ₹{loading ? "..." : stats.totalRevenue.toLocaleString("en-IN")}
                  </h2>
                </div>
                <div className="border-l border-gray-600 pl-6">
                  <p className="text-xs sm:text-sm text-gray-300 mb-1">Total Bookings</p>
                  <h2 className="text-2xl sm:text-3xl font-bold">{loading ? "..." : stats.totalBookings}</h2>
                </div>
              </div>
            </div>
          </div>

          {/* Bookings and Worker Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Bookings Table - Made scrollable for both mobile and desktop */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-3 sm:p-5 shadow-sm flex flex-col h-[400px] sm:h-[580px]">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                  Bookings by {worker.name}
                </h2>

                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center">
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search by ID or Name"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full sm:w-[160px] pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                    />
                  </div>

                  <Select
                    value={rangeFilter}
                    onValueChange={(v) => setRangeFilter(v)}
                  >
                    <SelectTrigger className="w-full sm:w-[120px]">
                      <Calendar className="mr-2 w-4 h-4" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Week</SelectItem>
                      <SelectItem value="month">Month</SelectItem>
                      <SelectItem value="year">Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Table Container with Scroll - Fixed height for consistent scrolling */}
              <div className="overflow-x-auto overflow-y-auto flex-1">
                <table className="w-full text-sm text-gray-700">
                  <thead className="bg-gray-100 text-left text-gray-800 sticky top-0 z-10">
                    <tr>
                      <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm">
                        Booking ID
                      </th>
                      <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm">
                        Name
                      </th>
                      <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm">
                        Phone Number
                      </th>
                      <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm">
                        Persons
                      </th>
                      <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm">
                        Type
                      </th>
                      <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-8 text-center text-gray-500"
                        >
                          Loading bookings...
                        </td>
                      </tr>
                    ) : bookings.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-8 text-center text-gray-500"
                        >
                          No bookings found for this worker
                        </td>
                      </tr>
                    ) : filteredBookings.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-8 text-center text-gray-500"
                        >
                          No bookings match the selected range
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((b, i) => (
                        <tr
                          key={i}
                          className="border-t hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm">
                            {b.booking_id || b.id}
                          </td>
                          <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm">
                            {b.guest_name || b.name}
                          </td>
                          <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm">
                            {b.phone_number || b.phone}
                          </td>
                          <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm">
                            {b.number_of_persons || b.persons}
                          </td>
                          <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm">
                            {b.booking_type || b.type}
                          </td>
                          <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm">
                            <span
                              className={`font-medium ${b.status === "completed" ||
                                b.status === "Completed"
                                ? "text-green-600"
                                : "text-orange-500"
                                }`}
                            >
                              {b.status
                                ? b.status.charAt(0).toUpperCase() +
                                b.status.slice(1)
                                : b.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Worker Details - Ends at Total Revenue */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 ">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 sm:mb-6">
                Worker Details
              </h2>
              {loading ? (
                <div className="text-center text-gray-500 py-8">Loading...</div>
              ) : (
                <div className="space-y-3 sm:space-y-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs sm:text-sm">Login ID</p>
                    <p className="text-gray-900 font-medium text-sm sm:text-base">
                      {worker.worker_id || worker.loginId || worker.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs sm:text-sm">Name</p>
                    <p className="text-gray-900 font-medium text-sm sm:text-base">
                      {worker.full_name || worker.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs sm:text-sm">Gender</p>
                    <p className="text-gray-900 font-medium text-sm sm:text-base">
                      {worker.gender || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs sm:text-sm">
                      Phone No.
                    </p>
                    <p className="text-gray-900 font-medium text-sm sm:text-base">
                      {worker.mobile_number || worker.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs sm:text-sm">
                      Joining Date
                    </p>
                    <p className="text-gray-900 font-medium text-sm sm:text-base">
                      {worker.created_at
                        ? new Date(worker.created_at).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )
                        : worker.joiningDate || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs sm:text-sm">Status</p>
                    <p
                      className={`font-medium text-sm sm:text-base ${(worker.status || "active").toString().toLowerCase() ===
                        "active"
                        ? "text-green-600"
                        : "text-amber-500"
                        }`}
                    >
                      {((worker.status || "active") as string)
                        .charAt(0)
                        .toUpperCase() +
                        ((worker.status || "active") as string).slice(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs sm:text-sm">
                      Total Bookings
                    </p>
                    <p className="text-gray-900 font-medium text-sm sm:text-base">
                      {stats.totalBookings}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs sm:text-sm">
                      Total Revenue
                    </p>
                    <p className="text-gray-900 font-medium text-sm sm:text-base">
                      ₹{stats.totalRevenue.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Dialog */}
      <AlertDialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Close Balance</AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-2">
              Are you sure you want to close the balance? This will reset the balance amount to ₹0. It will not affect today's amount or balance days.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCloseBalance}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Close Balance
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WorkerDetails;
