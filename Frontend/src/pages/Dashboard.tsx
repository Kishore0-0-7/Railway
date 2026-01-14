import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Plus,
  Search,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { analyticsAPI } from "@/services/api";
import { toast } from "sonner";
import useAppSettings from "@/lib/useAppSettings";
import { getAdminId } from "@/lib/cookieUtils";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Scroll to top on route change
  useScrollToTop();
  const [loading, setLoading] = useState(true);
  // table date range filter: all / today / week / month / year
  const [rangeFilter, setRangeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [chartLoading, setChartLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [needsScroll, setNeedsScroll] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Current month index for "this month" metrics
  const currentMonthIndex = useMemo(() => new Date().getMonth(), []);
  const currentMonthRevenue = useMemo(() => {
    return parseFloat(
      monthlyRevenue?.[currentMonthIndex]?.total_revenue || 0
    );
  }, [monthlyRevenue, currentMonthIndex]);
  const currentMonthBookings = useMemo(() => {
    return parseInt(
      monthlyRevenue?.[currentMonthIndex]?.total_bookings || 0
    );
  }, [monthlyRevenue, currentMonthIndex]);

  // App settings (dynamic seating type names) and enabled flags
  const { getTypeName, isTypeEnabled } = useAppSettings();

  // Check if chart needs scrolling based on window size
  const checkScrollNeeded = () => {
    // Enable scrolling when window width is below 1300px
    const scrollNeeded = window.innerWidth < 1300;
    setNeedsScroll(scrollNeeded);
  };

  // Check scroll requirements on mount and resize
  useEffect(() => {
    const handleResize = () => {
      checkScrollNeeded();
    };

    // Initial check
    checkScrollNeeded();

    // Listen for resize events
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Fetch main dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch chart data separately when year changes
  useEffect(() => {
    fetchChartData();
  }, [selectedYear]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Get admin_id from cookies
      const adminId = getAdminId();

      if (!adminId) {
        toast.error("Admin ID not found. Please login again.");
        return;
      }

      const [statsRes, bookingsRes] = await Promise.all([
        analyticsAPI.getDashboardStats({ admin_id: adminId }),
        analyticsAPI.getRecentBookings({
          admin_id: adminId,
          limit: 10000, // Fetch all bookings (high limit to avoid pagination)
        }),
      ]);

      console.log("Dashboard Stats Response:", statsRes.data);
      console.log("Recent Bookings Response:", bookingsRes.data);

      setDashboardStats(statsRes.data.data);

      // Handle multiple response shapes for bookings
      const bookingsData = bookingsRes.data.data || bookingsRes.data.bookings || [];
      console.log("Processed Bookings Data:", bookingsData);
      setRecentBookings(Array.isArray(bookingsData) ? bookingsData : []);

      await fetchChartData();
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      toast.error(
        error.response?.data?.error || "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      setChartLoading(true);

      // Get admin_id from cookies
      const adminId = getAdminId();

      if (!adminId) {
        toast.error("Admin ID not found. Please login again.");
        return;
      }

      const revenueRes = await analyticsAPI.getMonthlyRevenue({
        year: parseInt(selectedYear),
        months: 12,
        admin_id: adminId,
      });
      setMonthlyRevenue(revenueRes.data.data || []);
    } catch (error: any) {
      console.error("Error fetching chart data:", error);
      toast.error(error.response?.data?.error || "Failed to load chart data");
      setMonthlyRevenue([]);
    } finally {
      setChartLoading(false);
    }
  };

  // Filter bookings based on selected date range + search
  const filteredBookings = useMemo(() => {
    if (!recentBookings || recentBookings.length === 0) return [];

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

    const matchesSearch = (b: any) => {
      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;
      return (
        (b.guest_name || "").toString().toLowerCase().includes(q) ||
        (b.booking_id || "").toString().toLowerCase().includes(q) ||
        (b.worker_name || "").toString().toLowerCase().includes(q)
      );
    };

    const matchesStatus = (b: any) => {
      if (statusFilter === "all") return true;
      return (b.status || "").toLowerCase() === statusFilter.toLowerCase();
    };

    if (rangeFilter === "all") {
      return recentBookings.filter((b) => matchesSearch(b) && matchesStatus(b));
    }

    if (rangeFilter === "today") {
      return recentBookings.filter((b) => {
        if (!matchesSearch(b) || !matchesStatus(b)) return false;
        const d = parseDate(b);
        if (!d) return false;
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth() &&
          d.getDate() === now.getDate()
        );
      });
    }

    // For "week": Show only current calendar week (Monday-Sunday)
    if (rangeFilter === "week") {
      const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to get Monday
      const weekStart = new Date(now.setDate(diff));
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      return recentBookings.filter((b) => {
        if (!matchesSearch(b) || !matchesStatus(b)) return false;
        const d = parseDate(b);
        if (!d) return false;
        return d >= weekStart && d <= weekEnd;
      });
    }

    // For "month": Show only current calendar month
    if (rangeFilter === "month") {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      monthStart.setHours(0, 0, 0, 0);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);

      return recentBookings.filter((b) => {
        if (!matchesSearch(b) || !matchesStatus(b)) return false;
        const d = parseDate(b);
        if (!d) return false;
        return d >= monthStart && d <= monthEnd;
      });
    }

    // For "year": Show only current calendar year
    if (rangeFilter === "year") {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      yearStart.setHours(0, 0, 0, 0);
      const yearEnd = new Date(now.getFullYear(), 11, 31);
      yearEnd.setHours(23, 59, 59, 999);

      return recentBookings.filter((b) => {
        if (!matchesSearch(b) || !matchesStatus(b)) return false;
        const d = parseDate(b);
        if (!d) return false;
        return d >= yearStart && d <= yearEnd;
      });
    }

    return recentBookings.filter((b) => matchesSearch(b) && matchesStatus(b));
  }, [recentBookings, rangeFilter, searchTerm, statusFilter]);

  // Debug: log filtered bookings count when range changes
  useEffect(() => {
    console.log(`Filter: ${rangeFilter}, Total bookings: ${recentBookings.length}, Filtered: ${filteredBookings.length}`);
  }, [rangeFilter, filteredBookings, recentBookings.length]);

  // Reset to page 1 when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [rangeFilter, searchTerm, statusFilter]);

  // Pagination logic
  const ITEMS_PER_PAGE = 30;
  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Transform monthly revenue data for bar chart
  const bookingData =
    monthlyRevenue.length > 0
      ? monthlyRevenue.map((item) => ({
        month: item.month?.substring(0, 3) || "N/A",
        // map backend fields to generic type1/type2/type3 so labels can be dynamic
        type1: item.sitting_bookings || 0,
        type2: item.sleeper_bookings || 0,
        type3: item.type3_bookings || 0,
      }))
      : [
        { month: "Jan", type1: 0, type2: 0, type3: 0 },
        { month: "Feb", type1: 0, type2: 0, type3: 0 },
        { month: "Mar", type1: 0, type2: 0, type3: 0 },
        { month: "Apr", type1: 0, type2: 0, type3: 0 },
        { month: "May", type1: 0, type2: 0, type3: 0 },
        { month: "Jun", type1: 0, type2: 0, type3: 0 },
        { month: "Jul", type1: 0, type2: 0, type3: 0 },
        { month: "Aug", type1: 0, type2: 0, type3: 0 },
        { month: "Sep", type1: 0, type2: 0, type3: 0 },
        { month: "Oct", type1: 0, type2: 0, type3: 0 },
        { month: "Nov", type1: 0, type2: 0, type3: 0 },
        { month: "Dec", type1: 0, type2: 0, type3: 0 },
      ];

  // Compute booking counts from recent bookings (fallback when backend is empty)
  const bookingTypeCounts = useMemo(() => {
    const counts = { sitting: 0, sleeper: 0, type3: 0 };
    recentBookings.forEach((b) => {
      const t = (b.booking_type || "").toLowerCase();
      if (t === "sitting") counts.sitting += 1;
      else if (t === "sleeper" || t === "sleeping") counts.sleeper += 1;
      else if (t === "type3") counts.type3 += 1;
    });
    return counts;
  }, [recentBookings]);

  // Derived active counts from recent bookings (fallback when backend active_bookings misses items)
  const derivedActiveCounts = useMemo(() => {
    const counts = { sitting: 0, sleeper: 0, type3: 0 };
    recentBookings.forEach((b) => {
      const status = (b.status || "").toLowerCase();
      if (status !== "active") return;
      const t = (b.booking_type || "").toLowerCase();
      if (t === "sitting") counts.sitting += 1;
      else if (t === "sleeper" || t === "sleeping") counts.sleeper += 1;
      else if (t === "type3") counts.type3 += 1;
    });
    return counts;
  }, [recentBookings]);

  // Booked counts: prefer backend active_bookings, but use derived active counts when backend is zero
  const bookedCounts = {
    sitting: Math.max(
      dashboardStats?.active_bookings?.sitting?.count || 0,
      derivedActiveCounts.sitting
    ),
    sleeper: Math.max(
      dashboardStats?.active_bookings?.sleeper?.count || 0,
      derivedActiveCounts.sleeper
    ),
    type3: Math.max(
      dashboardStats?.active_bookings?.type3?.count || 0,
      derivedActiveCounts.type3
    ),
  };

  const bookedCapacities = {
    // Prefer backend capacity; if absent, fall back to the count so bar compares to itself
    sitting: dashboardStats?.active_bookings?.sitting?.capacity || bookedCounts.sitting || 1,
    sleeper: dashboardStats?.active_bookings?.sleeper?.capacity || bookedCounts.sleeper || 1,
    type3: dashboardStats?.active_bookings?.type3?.capacity || bookedCounts.type3 || 1,
  };

  // Total for percentage comparison across types
  const bookedTotal = bookedCounts.sitting + bookedCounts.sleeper + bookedCounts.type3;

  // Donut chart should match the "Booked" progress bar (active bookings)
  const topCategoryData = (() => {
    const sittingCount = bookedCounts.sitting || 0;
    const sleeperCount = bookedCounts.sleeper || 0;
    const type3Count = bookedCounts.type3 || 0;
    const total = sittingCount + sleeperCount + type3Count;

    if (total === 0) return [];

    const result = [];
    if (isTypeEnabled(1) && sittingCount > 0) {
      result.push({ type: 1, name: getTypeName(1), value: sittingCount });
    }
    if (isTypeEnabled(2) && sleeperCount > 0) {
      result.push({ type: 2, name: getTypeName(2), value: sleeperCount });
    }
    if (isTypeEnabled(3) && type3Count > 0) {
      result.push({ type: 3, name: getTypeName(3), value: type3Count });
    }

    return result;
  })();
  
  // Debug logging
  console.log("=== PIE CHART DEBUG ===");
  console.log("Top Category Data for chart:", topCategoryData);
  console.log("Backend top_category:", dashboardStats?.top_category);
  console.log("Computed counts from recent bookings:", bookingTypeCounts);

  // type1 -> blue, type2 -> orange, type3 -> green
  const COLORS = ["#3B82F6", "#F59E0B", "#10B981"];

  const handleBookingClick = (booking: any) => {
    if (booking.status === "active") {
      navigate(`/booking-details-active/${booking.booking_id}`, {
        state: { from: "/dashboard" },
      });
    } else {
      navigate(`/booking-details-completed/${booking.booking_id}`, {
        state: { from: "/dashboard" },
      });
    }
  };

  // Progress bar component
  const ProgressBar = ({
    value,
    max,
    color,
    label,
    percent,
  }: {
    value: number;
    max: number;
    color: string;
    label: string;
    percent?: number;
  }) => {
    // percentage based on provided percent override; otherwise use value/max (or value when max missing)
    const denominator = max > 0 ? max : value || 1;
    const rawPercent = percent !== undefined ? percent : (value / denominator) * 100;
    const percentage = Math.min(100, Math.max(0, rawPercent));
    const overCapacity = rawPercent > 100;
    const rightText = `${value} (${Math.round(rawPercent)}%${overCapacity ? " over" : ""})`;

    return (
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-xs text-gray-600">{rightText}</span>
        </div>

        {/* outer bar clips overflow */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-2.5 rounded-full"
            style={{
              width: `${percentage}%`,
              backgroundColor: overCapacity ? "#EF4444" : color,
              maxWidth: "100%",
              boxSizing: "border-box",
            }}
          ></div>
        </div>
      </div>
    );
  };

  // Year selection options - dynamically generate from 2022 to current year + 5 years
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 2022 + 6 },
    (_, i) => (currentYear + 5 - i).toString()
  );

  // Calendar-style year navigation
  const handleYearChange = (direction: "prev" | "next") => {
    const currentIndex = years.indexOf(selectedYear);
    if (direction === "prev" && currentIndex < years.length - 1) {
      setSelectedYear(years[currentIndex + 1]);
    } else if (direction === "next" && currentIndex > 0) {
      setSelectedYear(years[currentIndex - 1]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="p-2 md:p-4">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-lg text-gray-600">Loading dashboard...</div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-black rounded-xl p-3 md:p-4 mb-3 md:mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-lg">
              <div className="mb-2 sm:mb-0">
                <h1 className="text-lg md:text-xl font-bold text-white">
                  Good morning, Admin!
                </h1>
                <p className="text-gray-300 mt-0.5 text-xs">
                  Welcome to your dashboard
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3 w-full sm:w-auto">
                <div className="flex items-center space-x-2 text-gray-300 bg-gray-800 px-3 py-2 rounded-lg">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs md:text-sm">
                    {new Date().toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <Button
                  onClick={() => navigate("/manage-login")}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                >
                  <Plus className="w-4 h-4 mr-1 md:mr-2" />
                  Manage Login
                </Button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 md:gap-3 mb-3 md:mb-4">
              <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-lg p-3 md:p-4 shadow-sm h-40 md:h-40 flex flex-col justify-between">
                <p className="text-xs mb-1 font-semibold text-pacity-90">
                  Total Revenue
                </p>
                <div>
                  <p className="text-lg md:text-xl font-bold">
                    ₹ {currentMonthRevenue.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs mt-0.5 text-green-300">
                    {currentMonthBookings} bookings this month
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-lg p-3 md:p-4 shadow-sm h-40 flex flex-col justify-between">
                <p className="text-sm font-semibold mb-3">Top category</p>
                <div className="flex items-center justify-between">
                  <div className="w-20 h-20">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={topCategoryData}
                          innerRadius={30}
                          outerRadius={40}
                          paddingAngle={topCategoryData.length > 1 ? 2 : 0}
                          cornerRadius={8}
                          dataKey="value"
                          stroke="none"
                          minAngle={5}
                        >
                          {topCategoryData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[entry.type - 1]}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-1">
                    {isTypeEnabled(1) && (
                      <div className="flex items-center space-x-1">
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        <span className="text-xs">{getTypeName(1)}</span>
                      </div>
                    )}
                    {isTypeEnabled(2) && (
                      <div className="flex items-center space-x-1">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                        <span className="text-xs">{getTypeName(2)}</span>
                      </div>
                    )}
                    {isTypeEnabled(3) && (
                      <div className="flex items-center space-x-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="text-xs">{getTypeName(3)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm h-40 md:h-40 flex flex-col justify-between">
                <p className="text-xs  font-semibold text-black mb-1">
                  Total Bookings
                </p>
                <div>
                  <p className="text-lg md:text-xl font-bold text-gray-800">
                    {dashboardStats?.bookings?.total || 0}
                  </p>
                  <p
                    className={`text-xs mt-0.5 ${dashboardStats?.bookings?.trend === "up"
                      ? "text-green-500"
                      : "text-red-500"
                      }`}
                  >
                    {dashboardStats?.bookings?.change >= 0 ? "+" : ""}
                    {dashboardStats?.bookings?.change || 0} From last day
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm h-40 md:h-40 flex flex-col justify-between">
                <p className="text-xs font-semibold text-black mb-2">
                  Completed
                </p>
                <div>
                  <p className="text-lg md:text-xl font-bold text-gray-800">
                    {dashboardStats?.completed?.total || 0}
                  </p>
                  <p
                    className={`text-xs mt-0.5 ${dashboardStats?.completed?.trend === "up"
                      ? "text-green-500"
                      : "text-red-500"
                      }`}
                  >
                    {dashboardStats?.completed?.trend === "up" ? "+" : ""}
                    {dashboardStats?.completed?.percentage_change || 0}% From
                    last month
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm h-40 md:h-40 flex flex-col justify-between">
                <h3 className="text-xs font-semibold text-gray mb-1">
                  Booked
                </h3>
                <div className="space-y-1 md:space-y-1.5">
                  {isTypeEnabled(1) && (
                    <ProgressBar
                      value={bookedCounts.sitting || 0}
                      max={bookedCapacities.sitting}
                      percent={
                        bookedTotal > 0
                          ? (bookedCounts.sitting / bookedTotal) * 100
                          : 0
                      }
                      color="#3B82F6"
                      label={getTypeName(1)}
                    />
                  )}
                  {isTypeEnabled(2) && (
                    <ProgressBar
                      value={bookedCounts.sleeper || 0}
                      max={bookedCapacities.sleeper}
                      percent={
                        bookedTotal > 0
                          ? (bookedCounts.sleeper / bookedTotal) * 100
                          : 0
                      }
                      color="#F59E0B"
                      label={getTypeName(2)}
                    />
                  )}
                  {isTypeEnabled(3) && (
                    <ProgressBar
                      value={bookedCounts.type3 || 0}
                      max={bookedCapacities.type3}
                      percent={
                        bookedTotal > 0
                          ? (bookedCounts.type3 / bookedTotal) * 100
                          : 0
                      }
                      color="#10B981"
                      label={getTypeName(3)}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Booking List and Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
              {/* Booking List */}
              <div className="lg:col-span-2 bg-white border rounded-lg shadow-sm flex flex-col h-[420px]">
                <div className="p-3 md:p-4 border-b">
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <h2 className="text-sm md:text-base font-semibold text-gray-800">
                      Booking list
                    </h2>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <Input
                        placeholder="Search by name or ID"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full text-sm"
                      />
                    </div>

                    <Select
                      value={rangeFilter}
                      onValueChange={(v) => setRangeFilter(v)}
                    >
                      <SelectTrigger className="w-full sm:w-28 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex-1 overflow-auto">
                  <div className="min-w-0">
                    <table className="w-full">
                      <thead className="bg-black sticky top-0 z-10">
                        <tr>
                          <th className="text-left p-2 md:p-3 font-medium text-white text-xs uppercase min-w-[100px]">
                            Booking ID
                          </th>
                          <th className="text-left p-3 md:p-4 font-medium text-white text-xs uppercase min-w-[120px]">
                            Worker Name
                          </th>
                          <th className="text-left p-3 md:p-4 font-medium text-white text-xs uppercase min-w-[120px]">
                            Guest Name
                          </th>
                          <th className="text-left p-3 md:p-4 font-medium text-white text-xs uppercase min-w-[120px]">
                            Phone No.
                          </th>
                          <th className="text-left p-3 md:p-4 font-medium text-white text-xs uppercase min-w-[100px]">
                            Type
                          </th>
                          <th className="text-left p-3 md:p-4 font-medium text-white text-xs uppercase min-w-[100px]">
                            In Time
                          </th>
                          <th className="text-left p-3 md:p-4 font-medium text-white text-xs min-w-[100px]">
                            <Select
                              value={statusFilter}
                              onValueChange={(v) => setStatusFilter(v)}
                            >
                              <SelectTrigger className="w-full bg-transparent border-0 text-white text-xs uppercase h-auto p-0 font-medium hover:text-gray-300 [&>svg]:text-white focus:ring-0 focus:ring-offset-0">
                                <SelectValue placeholder="STATUS" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </th>
                          <th className="w-10 md:w-12 text-white min-w-[40px]">
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedBookings.length > 0 ? (
                          paginatedBookings.map((booking, index) => (
                            <tr
                              key={index}
                              className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => handleBookingClick(booking)}
                            >
                              <td className="p-3 md:p-4 text-xs md:text-sm font-medium text-blue-600 min-w-[120px]">
                                {booking.booking_id}
                              </td>
                              <td className="p-3 md:p-4 text-xs md:text-sm text-gray-800 min-w-[120px]">
                                {booking.worker_name || "N/A"}
                              </td>
                              <td className="p-3 md:p-4 text-xs md:text-sm text-gray-800 min-w-[120px]">
                                {booking.guest_name}
                              </td>
                              <td className="p-3 md:p-4 text-xs md:text-sm text-gray-600 min-w-[120px]">
                                {booking.phone_number}
                              </td>
                              <td className="p-3 md:p-4 text-xs md:text-sm text-gray-800 capitalize min-w-[100px]">
                                {(() => {
                                  const bt = (booking.booking_type || "")
                                    .toString()
                                    .toLowerCase();
                                  if (
                                    bt.includes("sit") ||
                                    bt === "sitting" ||
                                    bt === "type1" ||
                                    bt === "1"
                                  )
                                    return getTypeName(1);
                                  if (
                                    bt.includes("sleep") ||
                                    bt === "sleeper" ||
                                    bt === "type2" ||
                                    bt === "2"
                                  )
                                    return getTypeName(2);
                                  if (bt === "type3" || bt === "3")
                                    return getTypeName(3);
                                  // fallback to raw value
                                  return booking.booking_type || "-";
                                })()}
                              </td>
                              <td className="p-3 md:p-4 text-xs md:text-sm text-gray-800 min-w-[100px]">
                                {booking.in_time
                                  ? booking.in_time.split(" ")[0].split(".")[0]
                                  : "N/A"}
                              </td>
                              <td className="p-3 md:p-4 min-w-[100px]">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${booking.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-amber-100 text-amber-800"
                                    }`}
                                >
                                  {booking.status}
                                </span>
                              </td>
                              <td className="p-3 md:p-4 min-w-[40px]">
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={8}
                              className="p-6 md:p-8 text-center text-gray-500 text-sm"
                            >
                              No bookings found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination Controls */}
                {filteredBookings.length > 0 && (
                  <div className="px-3 md:px-4 py-2 border-t flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {startIndex + 1}-{Math.min(endIndex, filteredBookings.length)} of {filteredBookings.length}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                      </button>
                      <button
                        onClick={handleNextPage}
                        disabled={currentPage >= totalPages}
                        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        aria-label="Next page"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Chart - Scrollable when window < 1300px */}
              <div className="bg-white border rounded-lg p-4 md:p-6 shadow-sm h-[420px] flex flex-col">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm md:text-base">
                      Booking
                    </h3>
                    <p className="text-xs text-gray-500">
                      Monthly booking and revenue
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 md:space-x-2">
                    {isTypeEnabled(1) && (
                      <>
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        <span className="text-xs text-gray-600">
                          {getTypeName(1)}
                        </span>
                      </>
                    )}
                    {isTypeEnabled(2) && (
                      <>
                        <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                        <span className="text-xs text-gray-600">
                          {getTypeName(2)}
                        </span>
                      </>
                    )}
                    {isTypeEnabled(3) && (
                      <>
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="text-xs text-gray-600">
                          {getTypeName(3)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Calendar-style Year Selection */}
                <div className="flex items-center justify-center mb-3 md:mb-4">
                  <button
                    onClick={() => handleYearChange("prev")}
                    className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
                    disabled={years.indexOf(selectedYear) >= years.length - 1}
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>

                  <div className="mx-4 flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="text-lg font-bold text-gray-800">
                      {selectedYear}
                    </span>
                  </div>

                  <button
                    onClick={() => handleYearChange("next")}
                    className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
                    disabled={years.indexOf(selectedYear) <= 0}
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                {/* Scrollable Chart Container */}
                <div
                  ref={chartContainerRef}
                  className={`flex-1 relative ${needsScroll
                    ? "overflow-x-auto overflow-y-hidden scrollable-chart"
                    : "overflow-hidden"
                    }`}
                >
                  {chartLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-sm text-gray-500">
                        Loading chart data...
                      </div>
                    </div>
                  ) : (
                    <div
                      className="h-full"
                      style={{ minWidth: needsScroll ? "600px" : "auto" }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={bookingData}
                          barSize={needsScroll ? 20 : 24}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#EEE"
                          />
                          <XAxis
                            dataKey="month"
                            stroke="#888"
                            fontSize={needsScroll ? 10 : 11}
                            interval={0}
                          />
                          <YAxis
                            stroke="#888"
                            fontSize={needsScroll ? 10 : 11}
                            domain={[0, 'auto']}
                            allowDecimals={false}
                          />
                          <Tooltip />
                          {isTypeEnabled(1) && (
                            <Bar
                              dataKey="type1"
                              fill="#3B82F6"
                              radius={[4, 4, 0, 0]}
                              name={`${getTypeName(1)} Bookings`}
                            />
                          )}
                          {isTypeEnabled(2) && (
                            <Bar
                              dataKey="type2"
                              fill="#F59E0B"
                              radius={[4, 4, 0, 0]}
                              name={`${getTypeName(2)} Bookings`}
                            />
                          )}
                          {isTypeEnabled(3) && (
                            <Bar
                              dataKey="type3"
                              fill="#10B981"
                              radius={[4, 4, 0, 0]}
                              name={`${getTypeName(3)} Bookings`}
                            />
                          )}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Add CSS for scrollbar styling */}
      <style>{`
        .scrollable-chart::-webkit-scrollbar {
          height: 8px;
        }
        
        .scrollable-chart::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        
        .scrollable-chart::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }
        
        .scrollable-chart::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
