import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useMemo } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Search, Calendar } from "lucide-react";
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
  // table filter range: today / week / month / year
  const [rangeFilter, setRangeFilter] = useState<string>("today");
 
  // helper to determine worker id to call backend with. Prefer worker_id from API/other pages.
  const workerId =
    location.state?.worker?.worker_id ||
    location.state?.worker?.id ||
    seedWorker.worker_id ||
    seedWorker.id ||
    seedWorker.loginId;

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
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

          // Fetch bookings assigned to this worker
          const bResp = await bookingAPI.getWorkerBookings(String(workerId));
          let fetchedBookings: any[] = [];

          if (bResp?.data?.bookings) {
            fetchedBookings = bResp.data.bookings;
          } else if (Array.isArray(bResp?.data)) {
            fetchedBookings = bResp.data;
          } else if (bResp?.data?.data) {
            fetchedBookings = bResp.data.data;
          }

          setBookings(fetchedBookings);

          // Calculate statistics from bookings
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
          const sittingBooked = fetchedBookings.filter((b) => {
            const type = (b.booking_type || b.type || "").toString().toLowerCase();
            const status = (b.status || "").toString().toLowerCase();
            return (
              type.includes("sitting") &&
              (status.includes("active") || status.includes("booked"))
            );
          }).length;

          const sleeperBooked = fetchedBookings.filter((b) => {
            const type = (b.booking_type || b.type || "").toString().toLowerCase();
            const status = (b.status || "").toString().toLowerCase();
            return (
              type.includes("sleeper") &&
              (status.includes("active") || status.includes("booked"))
            );
          }).length;

          setStats({
            totalRevenue,
            totalBookings: fetchedBookings.length,
            completedBookings,
            activeBookings,
            seatingTypeStats,
          });
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
        },
      },
    });
  };

  // derive bookings to show in table based on selected range
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

    if (rangeFilter === "today") {
      return bookings.filter((b) => {
        const d = parseDate(b);
        if (!d) return false;
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth() &&
          d.getDate() === now.getDate()
        );
      });
    }

    const days =
      rangeFilter === "week" ? 7 : rangeFilter === "month" ? 30 : 365;
    const cutoff = new Date(now.getTime() - days * msInDay);

    return bookings.filter((b) => {
      const d = parseDate(b);
      if (!d) return false;
      return d >= cutoff && d <= now;
    });
  }, [bookings, rangeFilter]);

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
          <div className="bg-black text-white rounded-xl p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-semibold">
                {worker.full_name || worker.name}
              </h1>
            </div>
            <div className="flex gap-2 sm:gap-3 mt-4 md:mt-0">
              <Button
                variant="destructive"
                className={`text-sm sm:text-base ${
                  (worker.status || "active").toString().toLowerCase() ===
                  "active"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                } text-white`}
                onClick={handleStatusToggle}
              >
                {(worker.status || "active").toString().toLowerCase() ===
                "active"
                  ? "Remove Worker"
                  : "Re-Join"}
              </Button>
              <Button
                variant="outline"
                className="bg-white text-black hover:bg-gray-100 text-sm sm:text-base"
                onClick={handleEditDetails}
              >
                Edit Details
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-black text-white p-4 sm:p-5 rounded-xl">
              <p className="text-xs sm:text-sm text-gray-300">Total Revenue</p>
              <h2 className="text-2xl sm:text-3xl font-semibold mt-1 sm:mt-2">
                ₹{loading ? "..." : stats.totalRevenue.toLocaleString("en-IN")}
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">
                From all bookings
              </p>
            </div>

            <div className="bg-white border border-gray-200 p-4 sm:p-5 rounded-xl">
              <p className="text-gray-600 text-xs sm:text-sm">Total Bookings</p>
              <h2 className="text-2xl sm:text-3xl font-semibold mt-1 sm:mt-2">
                {loading ? "..." : stats.totalBookings}
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">
                All time bookings
              </p>
            </div>

            <div className="bg-white border border-gray-200 p-4 sm:p-5 rounded-xl">
              <p className="text-gray-600 text-xs sm:text-sm">Completed</p>
              <h2 className="text-2xl sm:text-3xl font-semibold mt-1 sm:mt-2">
                {loading ? "..." : stats.completedBookings}
              </h2>
              <p className="text-green-500 text-xs sm:text-sm mt-1">
                {stats.totalBookings > 0
                  ? `${(
                      (stats.completedBookings / stats.totalBookings) *
                      100
                    ).toFixed(1)}% completion rate`
                  : "No bookings yet"}
              </p>
            </div>

            <div className="bg-white border border-gray-200 p-4 sm:p-5 rounded-xl">
              <p className="text-gray-600 text-xs sm:text-sm">
                Active Bookings by Type
              </p>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {enabledSeatingTypes.map((seatingType) => (
                  <div key={seatingType.key} className="text-center">
                    <h2 className="text-lg sm:text-xl font-semibold">
                      {loading
                        ? "..."
                        : stats.seatingTypeStats[seatingType.key] || 0}
                    </h2>
                    <p className="text-xs text-gray-500">{seatingType.label}</p>
                    <p className="text-xs text-blue-600 font-medium">
                      ₹{seatingType.amount}/hr
                    </p>
                  </div>
                ))}
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
                      placeholder="Search"
                      className="w-full sm:w-[160px] pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                    />
                  </div>

                  <Select value={rangeFilter} onValueChange={(v) => setRangeFilter(v)}>
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
                <table className="w-full text-sm text-gray-700 min-w-[300px]">
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
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          No bookings match the selected range
                        </td>
                      </tr>
                    ) : (
                      bookings.map((b, i) => (
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
                              className={`font-medium ${
                                b.status === "completed" ||
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
                      filteredBookings.map((b, i) => {
                        const status = (b.status || "").toString().toLowerCase();
                        const bookingId = b.booking_id || b.id;
                        const handleRowNavigate = () => {
                          if (status.includes("active") || status.includes("booked")) {
                            navigate(`/submit-booking/${bookingId}`, { state: { booking: b } });
                            return;
                          }
                          if (status.includes("completed")) {
                            navigate(`/booking-details-completed/${bookingId}`, { state: { booking: b } });
                            return;
                          }
                          // fallback: open read-only booking details
                          navigate(`/booking-details/${bookingId}`, { state: { booking: b } });
                        };

                        return (
                          <tr
                            key={i}
                            className="border-t hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={handleRowNavigate}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                handleRowNavigate();
                              }
                            }}
                          >
                            <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm">{bookingId}</td>
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
                                className={`font-medium ${
                                  status.includes("completed") ? "text-green-600" : "text-orange-500"
                                }`}
                              >
                                {b.status ? b.status.charAt(0).toUpperCase() + b.status.slice(1) : b.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
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
                      className={`font-medium text-sm sm:text-base ${
                        (worker.status || "active").toString().toLowerCase() ===
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
    </div>
  );
};

export default WorkerDetails;
