import { useState, useEffect, useRef } from "react";
import Navigation from "@/components/Navigation";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import apiClient, { analyticsAPI } from "@/services/api";
import { toast } from "sonner";
import {
  getEnabledSeatingTypes,
  formatSeatingTypeLabel,
  getSeatingTypePrice,
} from "@/lib/settingsUtils";
import { getAdminId } from "@/lib/cookieUtils";

const Report = () => {
  const [timePeriod, setTimePeriod] = useState("year");
  const [selectedYear, setSelectedYear] = useState("2025");

  // Scroll to top on route change
  useScrollToTop();
  const [selectedMonth, setSelectedMonth] = useState("Jan");
  const [showRevenue, setShowRevenue] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [graphAnimation, setGraphAnimation] = useState(false);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    data: any;
  }>({
    visible: false,
    x: 0,
    y: 0,
    data: null,
  });

  // State for backend data
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState<any[]>([]);
  const [dailyRevenueData, setDailyRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Available years & months
  const years = ["2025", "2024", "2023", "2022"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Set current month as default when component mounts
  useEffect(() => {
    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth();
    setSelectedMonth(months[currentMonthIndex]);
    setCurrentIndex(currentMonthIndex);
  }, []);

  // Fetch data from backend
  useEffect(() => {
    fetchReportData();
  }, [selectedYear, selectedMonth, timePeriod]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setFetchError(null);

      // Get admin_id from cookies
      const adminId = getAdminId();
      if (!adminId) {
        throw new Error("Admin ID not found. Please log in again.");
      }

      const parsedYear = Number(selectedYear);
      const year = Number.isNaN(parsedYear)
        ? new Date().getFullYear()
        : parsedYear;

      const [analyticsRes, bookingStatsRes, monthlyRes] = await Promise.all([
        analyticsAPI.getDashboardStats({ admin_id: adminId }),
        apiClient.get("/admin/booking-stats", {
          params: { admin_id: adminId },
        }),
        analyticsAPI.getMonthlyRevenue({ year, months: 12, admin_id: adminId }),
      ]);

      const analyticsData =
        analyticsRes?.data?.data ?? analyticsRes?.data ?? analyticsRes ?? {};
      const bookingStats =
        bookingStatsRes?.data?.stats ?? bookingStatsRes?.data ?? {};
      const monthlyPayload =
        monthlyRes?.data?.data ?? monthlyRes?.data ?? monthlyRes ?? [];

      const completedTotal = analyticsData?.completed?.total ?? 0;
      const totalBookings =
        bookingStats?.total_bookings ?? analyticsData?.bookings?.total ?? 0;
      const activeBookingsCount =
        (analyticsData?.active_bookings?.sitting?.count ?? 0) +
        (analyticsData?.active_bookings?.sleeper?.count ?? 0);
      const completionRate =
        totalBookings > 0 ? (completedTotal / totalBookings) * 100 : 0;

      // Combine analytics + admin aggregates so UI keeps existing field names
      setDashboardStats({
        rawAnalytics: analyticsData,
        totalRevenue:
          bookingStats?.total_revenue ?? analyticsData?.revenue?.total ?? 0,
        totalBookings,
        avgBookingHour: bookingStats?.avg_booking_hours ?? 0,
        todayBookings:
          bookingStats?.today_bookings ?? analyticsData?.bookings?.today ?? 0,
        completedBookings: completedTotal,
        activeBookings: activeBookingsCount,
        completionRate: Math.round(completionRate * 100) / 100,
      });

      console.log("Monthly Revenue Response (normalized):", monthlyPayload);
      setMonthlyRevenueData(
        Array.isArray(monthlyPayload) ? monthlyPayload : []
      );

      setDailyRevenueData([]);
      if (timePeriod === "month") {
        const monthNumber = months.indexOf(selectedMonth) + 1;
        if (monthNumber > 0) {
          try {
            const dailyRes = await analyticsAPI.getDailyRevenue({
              month: monthNumber,
              year,
              admin_id: adminId,
            });
            const dailyPayload =
              dailyRes?.data?.data ?? dailyRes?.data ?? dailyRes ?? [];
            console.log("Daily Revenue Response (normalized):", dailyPayload);
            setDailyRevenueData(
              Array.isArray(dailyPayload) ? dailyPayload : []
            );
          } catch (dailyError) {
            console.error("Error fetching daily revenue data:", dailyError);
            toast.error("Failed to load daily revenue data");
          }
        }
      }
    } catch (error: any) {
      console.error("Error fetching report data:", error);
      const message =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to load report data. Showing empty view.";
      setFetchError(message);
      toast.error("Failed to load report data", { description: message });
      setDashboardStats({
        totalRevenue: 0,
        totalBookings: 0,
        avgBookingHour: 0,
        todayBookings: 0,
        completedBookings: 0,
        activeBookings: 0,
        completionRate: 0,
      });
      setMonthlyRevenueData([]);
      setDailyRevenueData([]);
    } finally {
      setLoading(false);
    }
  };

  // Check screen size and device type on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    const checkTouchDevice = () => {
      setIsTouchDevice(
        "ontouchstart" in window || navigator.maxTouchPoints > 0
      );
    };

    checkScreenSize();
    checkTouchDevice();

    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Trigger graph animation when data changes
  useEffect(() => {
    setGraphAnimation(false);
    const timer = setTimeout(() => setGraphAnimation(true), 100);
    return () => clearTimeout(timer);
  }, [showRevenue, timePeriod, monthlyRevenueData]);

  // Process monthly revenue data from backend
  const data =
    monthlyRevenueData.length > 0
      ? monthlyRevenueData.map((item, index) => ({
          month: item.month || `Month ${index + 1}`, // Backend returns 'month' not 'month_name'
          year: selectedYear,
          revenue: parseFloat(item.total_revenue || 0),
          change: 0, // Growth percentage not provided by this endpoint
        }))
      : [];

  const current = data[currentIndex] || {
    month: "",
    year: selectedYear,
    revenue: 0,
    change: 0,
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : data.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < data.length - 1 ? prev + 1 : 0));
  };

  // Get enabled seating types from Settings
  const enabledSeatingTypes = getEnabledSeatingTypes();

  // Graph data points from backend
  // Filter data based on timePeriod (year vs month)
  let revenueData: number[];
  const seatingTypeData: Record<string, number[]> = {};
  let sleeperData: number[];
  let sittingData: number[];

  // Initialize seating type data arrays
  enabledSeatingTypes.forEach((seatingType) => {
    seatingTypeData[seatingType.key] = [];
  });

  if (timePeriod === "year") {
    // Year view: Show all 12 months
    revenueData =
      monthlyRevenueData.length > 0
        ? monthlyRevenueData.map(
            (item) => parseFloat(item.total_revenue || 0) / 1000
          )
        : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    // Process seating type data dynamically based on Settings
    enabledSeatingTypes.forEach((seatingType) => {
      const columnName = `${seatingType.key}_revenue`;
      seatingTypeData[seatingType.key] =
        monthlyRevenueData.length > 0
          ? monthlyRevenueData.map(
              (item) => parseFloat(item[columnName] || 0) / 1000
            )
          : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    });

    // Legacy support for existing chart code
    sleeperData = seatingTypeData.sleeper || [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ];
    sittingData = seatingTypeData.sitting || [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ];
  } else {
    // Month view: Show daily data for the selected month
    if (dailyRevenueData.length > 0) {
      revenueData = dailyRevenueData.map(
        (item) => parseFloat(item.total_revenue || 0) / 1000
      );

      // Process daily seating type data dynamically
      enabledSeatingTypes.forEach((seatingType) => {
        const columnName = `${seatingType.key}_revenue`;
        seatingTypeData[seatingType.key] = dailyRevenueData.map(
          (item) => parseFloat(item[columnName] || 0) / 1000
        );
      });

      // Legacy support
      sleeperData = seatingTypeData.sleeper || [];
      sittingData = seatingTypeData.sitting || [];
    } else {
      // No daily data available - create array of zeros for all days in the month
      const daysInMonth = new Date(
        parseInt(selectedYear),
        months.indexOf(selectedMonth) + 1,
        0
      ).getDate();
      revenueData = Array(daysInMonth).fill(0);

      enabledSeatingTypes.forEach((seatingType) => {
        seatingTypeData[seatingType.key] = Array(daysInMonth).fill(0);
      });

      // Legacy support
      sleeperData = seatingTypeData.sleeper || Array(daysInMonth).fill(0);
      sittingData = seatingTypeData.sitting || Array(daysInMonth).fill(0);
    }
  }

  // Debug: Log the graph data
  console.log("Time Period:", timePeriod);
  console.log("Selected Month:", selectedMonth);
  console.log("Selected Year:", selectedYear);
  console.log("Monthly Revenue Data:", monthlyRevenueData);
  console.log("Daily Revenue Data:", dailyRevenueData);
  console.log("Revenue Data for Graph:", revenueData);
  console.log("Sleeper Data:", sleeperData);
  console.log("Sitting Data:", sittingData);

  const getStatsForPeriod = (period: string) => {
    const formatCurrency = (amount: number) => {
      return `₹ ${amount.toLocaleString("en-IN")}`;
    };

    // safe helpers
    const totalRevenueYear = dashboardStats?.totalRevenue || 0;
    const totalBookingsYear = dashboardStats?.totalBookings || 0;
    const avgBookingHourYear = dashboardStats?.avgBookingHour || 0; // backend may not provide
    const todayBookings = dashboardStats?.todayBookings || 0; // backend may not provide

    if (period === "year") {
      return [
        {
          title: "Total Revenue",
          amount: formatCurrency(totalRevenueYear),
          change: `${totalBookingsYear} bookings`,
          period: selectedYear,
          trending: true,
        },
        {
          title: "Total Bookings",
          amount: totalBookingsYear.toString(),
          change: `${dashboardStats?.completedBookings || 0} completed`,
          period: selectedYear,
          trending: true,
        },
        {
          title: "Avg Booking Hour",
          amount: `${avgBookingHourYear}Hr`,
          change: "Average booking duration",
          period: selectedYear,
          trending: true,
        },
        {
          title: "Today Bookings",
          amount: todayBookings.toString(),
          change: "Bookings today",
          period: selectedYear,
          trending: true,
        },
      ];
    } else {
      // Month view - derive values from monthlyRevenueData (fallback to dashboardStats)
      const monthIndex = months.indexOf(selectedMonth);
      const selectedMonthKey = selectedMonth.toLowerCase();
      const normalizeLabel = (value?: string) =>
        value ? value.slice(0, 3).toLowerCase() : "";
      const currentMonthData = monthlyRevenueData.find((m) => {
        if (typeof m?.month_number === "number" && monthIndex >= 0) {
          return m.month_number === monthIndex + 1;
        }
        const label =
          normalizeLabel(m?.month?.toString()) ||
          normalizeLabel(m?.month_name?.toString());
        return label === selectedMonthKey;
      });
      const monthRevenue =
        parseFloat(currentMonthData?.total_revenue || "0") || 0;
      const monthBookings = currentMonthData?.total_bookings || 0;
      const avgBookingHourMonth =
        currentMonthData?.avg_booking_hour || avgBookingHourYear || 0;

      return [
        {
          title: "Total Revenue",
          amount: formatCurrency(monthRevenue),
          change: `${monthBookings} bookings`,
          period: selectedMonth,
          trending: monthBookings > 0,
        },
        {
          title: "Total Bookings",
          amount: monthBookings.toString(),
          change: `${selectedMonth} bookings`,
          period: selectedMonth,
          trending: true,
        },
        {
          title: "Avg Booking Hour",
          amount: `${avgBookingHourMonth}Hr`,
          change: "Average booking duration",
          period: selectedMonth,
          trending: true,
        },
        {
          title: "Today Bookings",
          amount: (dashboardStats?.todayBookings || 0).toString(),
          change: "Bookings today",
          period: selectedMonth,
          trending: true,
        },
      ];
    }
  };

  const stats = getStatsForPeriod(timePeriod);

  // Calculate dynamic max value for better graph scaling
  const allValues = [...sleeperData, ...sittingData, ...revenueData];
  const maxDataValue = Math.max(...allValues, 1); // Minimum 1 to avoid division by zero
  const dynamicMaxValue = Math.ceil(maxDataValue * 1.2); // Add 20% padding for better visualization

  console.log("Max Data Value:", maxDataValue);
  console.log("Dynamic Max Value for Graph:", dynamicMaxValue);

  // Dynamic X-axis labels
  const xLabels =
    timePeriod === "year"
      ? [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ]
      : Array.from({ length: 31 }, (_, i) => (i + 1).toString());

  // Calculate graph width based on data points for horizontal scrolling
  const graphWidth = isMobile
    ? Math.max(800, revenueData.length * 60) // Minimum 800px, or data points * 60px
    : "100%";

  // Responsive chart height
  const chartHeight = isMobile ? 320 : 480;

  // Calculate Y position for data points (inverted for SVG coordinate system)
  const calculateYPosition = (value: number, maxValue: number = 1200) => {
    return 220 - (value / maxValue) * 220;
  };

  // Make chart responsive: compute total points and helper to map index -> X coordinate
  const totalPoints = Math.max(
    sleeperData.length,
    sittingData.length,
    revenueData.length
  );
  const leftPadding = isMobile ? 40 : 50;
  const rightPadding = isMobile ? 40 : 50;

  // For mobile scrolling, we need to calculate the actual width
  const mobileChartWidth = Math.max(1000, totalPoints * 80); // Dynamic width based on data points

  const getX = (index: number) => {
    if (totalPoints <= 1) return leftPadding;
    const availableWidth = mobileChartWidth - leftPadding - rightPadding;
    return leftPadding + index * (availableWidth / (totalPoints - 1));
  };

  const buildPathString = (arr: number[], multiplier = 1, maxValue = 1200) => {
    if (!arr || arr.length === 0) return "";
    return arr
      .map(
        (v, i) => `${getX(i)} ${calculateYPosition(v * multiplier, maxValue)}`
      )
      .map((point, i) => (i === 0 ? `M ${point}` : `L ${point}`))
      .join(" ");
  };

  // Get data point from coordinates
  const getDataFromCoordinates = (clientX: number, clientY: number) => {
    if (!svgRef.current || !graphContainerRef.current) return null;

    const svgRect = svgRef.current.getBoundingClientRect();
    const containerRect = graphContainerRef.current.getBoundingClientRect();

    const x = clientX - svgRect.left;
    const y = clientY - svgRect.top;

    // Only process when within SVG bounds
    if (x < 0 || x > svgRect.width || y < 0 || y > svgRect.height) {
      return null;
    }

    // Calculate which data point is closest
    const actualDataLength = Math.max(
      sleeperData.length,
      sittingData.length,
      revenueData.length
    );
    const pointWidth = svgRect.width / (actualDataLength - 1);
    const pointIndex = Math.round(x / pointWidth);
    const clampedIndex = Math.max(
      0,
      Math.min(actualDataLength - 1, pointIndex)
    );

    // Get data for the point
    const currentData = !showRevenue
      ? {
          sleeper: sleeperData[clampedIndex],
          sitting: sittingData[clampedIndex],
          point: clampedIndex,
        }
      : {
          revenue: revenueData[clampedIndex],
          point: clampedIndex,
        };

    return {
      data: currentData,
      containerX: clientX - containerRect.left,
      containerY: clientY - containerRect.top,
    };
  };

  // Handle mouse move over graph (for desktop)
  const handleMouseMove = (event: React.MouseEvent) => {
    const result = getDataFromCoordinates(event.clientX, event.clientY);
    if (result) {
      setTooltip({
        visible: true,
        x: result.containerX,
        y: result.containerY,
        data: result.data,
      });
    } else {
      setTooltip((prev) => ({ ...prev, visible: false }));
    }
  };

  // Handle mouse leave (for desktop)
  const handleMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  // Handle touch move (for mobile)
  const handleTouchMove = (event: React.TouchEvent) => {
    event.preventDefault();
    const touch = event.touches[0];
    const result = getDataFromCoordinates(touch.clientX, touch.clientY);

    if (result) {
      setTooltip({
        visible: true,
        x: result.containerX,
        y: result.containerY,
        data: result.data,
      });
    }
  };

  // Handle touch end (for mobile)
  const handleTouchEnd = () => {
    setTimeout(() => {
      setTooltip((prev) => ({ ...prev, visible: false }));
    }, 2000);
  };

  // Handle touch start (for mobile)
  const handleTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    const result = getDataFromCoordinates(touch.clientX, touch.clientY);

    if (result) {
      setTooltip({
        visible: true,
        x: result.containerX,
        y: result.containerY,
        data: result.data,
      });
    }
  };

  // Compute tooltip position relative to container
  let tooltipLeft = 0;
  let tooltipTop = 0;
  if (tooltip.visible && graphContainerRef.current) {
    const containerRect = graphContainerRef.current.getBoundingClientRect();
    const maxLeft = Math.max(10, containerRect.width - 220);
    tooltipLeft = Math.max(10, Math.min(tooltip.x + 10, maxLeft));
    tooltipTop = Math.max(10, tooltip.y - 100);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="p-4 md:p-6">
        {/* Header */}
        <div className="bg-nav rounded-lg p-4 md:p-6 mb-4 md:mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-nav-foreground">
            Analytics Dashboard!
          </h1>
          <p className="text-nav-foreground/80 text-sm mt-1">
            {loading
              ? "Loading report data..."
              : "Real-time data from database"}
          </p>
        </div>

        {/* Inline error banner with retry */}
        {fetchError && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 flex items-start justify-between">
            <div>
              <div className="font-semibold">Error loading report</div>
              <div className="text-sm mt-1">{fetchError}</div>
            </div>
            <div className="ml-4 flex-shrink-0">
              <button
                onClick={() => fetchReportData()}
                className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              {stats.map((stat, index) => {
                if (index === 0) {
                  return (
                    <div
                      key={index}
                      className="text-white relative shadow-sm transition-all hover:shadow-md"
                      style={{
                        width: "100%",
                        minHeight: isMobile ? "140px" : "160px",
                        borderRadius: "8px",
                        background: "#212121",
                        opacity: 1,
                        padding: isMobile ? "12px" : "16px",
                      }}
                    >
                      <div className="flex items-center justify-between mb-3 md:mb-4">
                        <div className="flex-1">
                          <h3 className="text-sm md:text-base font-medium text-white md:mb-4">
                            {stat.title}
                          </h3>

                          <div className="mt-3">
                            <div
                              className={`${
                                isMobile ? "text-2xl" : "text-3xl"
                              } font-bold text-white`}
                            >
                              {stat.amount}
                            </div>
                            <div
                              className={`mt-2 text-xs md:text-sm font-medium ${
                                stat.change &&
                                stat.change.toString().includes("-")
                                  ? "text-red-400"
                                  : "text-green-400"
                              }`}
                            >
                              {stat.change}
                            </div>
                          </div>
                        </div>

                        {timePeriod === "year" && (
                          <div className="flex flex-col items-center justify-center ml-4 mt-6 space-y-2">
                            <button
                              onClick={handlePrev}
                              className="text-gray-400 hover:text-white transition-colors"
                              aria-label="Previous month"
                            >
                              <svg
                                width={isMobile ? "16" : "20"}
                                height={isMobile ? "16" : "20"}
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
                              </svg>
                            </button>

                            <div
                              className={`${
                                isMobile ? "text-base" : "text-lg"
                              } font-medium text-gray-400`}
                            >
                              {current.month.substring(0, 3)}
                            </div>

                            <button
                              onClick={handleNext}
                              className="text-gray-400 hover:text-white transition-colors"
                              aria-label="Next month"
                            >
                              <svg
                                width={isMobile ? "16" : "20"}
                                height={isMobile ? "16" : "20"}
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                } else {
                  // Use stat values prepared by getStatsForPeriod
                  return (
                    <div
                      key={index}
                      className="relative shadow-sm transition-all hover:shadow-md"
                      style={{
                        width: "100%",
                        minHeight: isMobile ? "140px" : "160px",
                        borderRadius: "8px",
                        background: "#FFFFFF",
                        opacity: 1,
                        padding: isMobile ? "12px" : "16px",
                        border: "1px solid #E5E5E5",
                      }}
                    >
                      <div className="flex items-center justify-between mb-3 md:mb-4">
                        <h3 className="text-sm md:text-base font-medium text-gray-500">
                          {stat.title}
                        </h3>
                      </div>

                      <div className="flex items-end justify-between mb-3 md:mb-2">
                        <div
                          className={`${
                            isMobile ? "text-2xl" : "text-3xl"
                          } font-bold text-gray-900`}
                        >
                          {stat.amount}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs md:text-sm font-medium flex align ${
                            stat.trending ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {stat.change}
                        </span>
                      </div>
                    </div>
                  );
                }
              })}
            </div>

            {/* Trends Chart */}
            <div
              ref={containerRef}
              className="bg-card border shadow-sm transition-all relative"
              style={{
                width: "100%",
                height: isMobile ? "500px" : "640px",
                borderRadius: "10px",
                opacity: 1,
                padding: isMobile ? "12px" : "20px",
                overflow: "hidden",
              }}
            >
              {/* Toggle + Period */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-3 md:gap-4">
                <h2 className="text-base md:text-lg font-semibold">
                  {showRevenue ? "Revenue Trends" : "Booking Trends"}
                </h2>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
                  {/* Legends */}
                  <div className="flex items-center space-x-4 md:space-x-4 md:mr-8 flex-wrap gap-2">
                    {!showRevenue ? (
                      <>
                        <div className="flex items-center space-x-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: "#f97316" }}
                          ></span>
                          <span className="text-xs md:text-sm font-medium text-gray-700">
                            Sleeper
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: "#9ca3af" }}
                          ></span>
                          <span className="text-xs md:text-sm font-medium text-gray-700">
                            Sitting
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 bg-primary rounded-full"></span>
                        <span className="text-xs md:text-sm font-medium text-gray-700">
                          Revenue
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Custom Toggle */}
                  <div className="flex bg-black rounded-full p-1 w-full sm:w-48 relative shrink-0">
                    <button
                      onClick={() => setShowRevenue(false)}
                      className={`flex-1 py-2 px-3 text-xs md:text-sm rounded-full transition-all ${
                        !showRevenue
                          ? "bg-white text-black font-semibold shadow"
                          : "text-white"
                      }`}
                    >
                      Bookings
                    </button>
                    <button
                      onClick={() => setShowRevenue(true)}
                      className={`flex-1 py-2 px-3 text-xs md:text-sm rounded-full transition-all ${
                        showRevenue
                          ? "bg-white text-black font-semibold shadow"
                          : "text-white"
                      }`}
                    >
                      Revenue
                    </button>
                  </div>

                  {/* Period Dropdown */}
                  <Select value={timePeriod} onValueChange={setTimePeriod}>
                    <SelectTrigger className="w-full sm:w-28 shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Month</SelectItem>
                      <SelectItem value="year">Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Scrollable Chart Area for Mobile */}
              <div
                ref={graphContainerRef}
                className="relative w-full bg-white"
                style={{
                  height: `${chartHeight}px`,
                  overflowX: isMobile ? "auto" : "hidden",
                  overflowY: "hidden",
                }}
              >
                {/* Chart Content with Dynamic Width */}
                <div
                  style={{
                    width: isMobile ? graphWidth : "100%",
                    height: "100%",
                    position: "relative",
                    minWidth: isMobile ? "800px" : "auto",
                  }}
                >
                  {/* Grid Lines */}
                  <div
                    className="absolute inset-0"
                    style={{
                      marginLeft: isMobile ? "40px" : "64px",
                      marginRight: isMobile ? "40px" : "40px",
                      paddingTop: isMobile ? "5px" : "20px",
                      paddingBottom: isMobile ? "30px" : "40px",
                    }}
                  >
                    {/* Horizontal grid lines */}
                    <div className="relative h-full">
                      {[1000, 750, 500, 250, 0].map((value, index) => (
                        <div
                          key={value}
                          className="absolute w-full border-b border-dotted border-gray-300"
                          style={{
                            top: `${(index / 4) * 100}%`,
                          }}
                        >
                          <span
                            className="absolute text-gray-500 font-medium"
                            style={{
                              left: isMobile ? "-30px" : "-50px",
                              top: "-7px",
                              width: isMobile ? "25px" : "40px",
                              textAlign: "right",
                              fontSize: isMobile ? "9px" : "12px",
                            }}
                          >
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Chart Area */}
                  <div
                    className="absolute"
                    style={{
                      top: isMobile ? "5px" : "20px",
                      left: isMobile ? "40px" : "64px",
                      right: isMobile ? "40px" : "40px",
                      bottom: isMobile ? "30px" : "40px",
                      width: isMobile
                        ? `calc(${graphWidth} - 80px)`
                        : "calc(100% - 104px)",
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onTouchMove={handleTouchMove}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                  >
                    {/* Chart Lines */}
                    <svg
                      ref={svgRef}
                      className="absolute w-full h-full"
                      viewBox={`0 0 ${mobileChartWidth} 220`}
                      preserveAspectRatio="none"
                    >
                      {!showRevenue ? (
                        <>
                          {/* Sleeper Line */}
                          <path
                            d={buildPathString(sleeperData, 1, dynamicMaxValue)}
                            stroke="#f97316"
                            strokeWidth={isMobile ? "2" : "3"}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={graphAnimation ? "animate-draw" : ""}
                            style={{
                              strokeDasharray: 4000,
                              strokeDashoffset: graphAnimation ? 0 : 4000,
                              transition: "stroke-dashoffset 1.5s ease-in-out",
                            }}
                          />
                          {/* Sitting Line */}
                          <path
                            d={buildPathString(sittingData, 1, dynamicMaxValue)}
                            stroke="#9ca3af"
                            strokeWidth={isMobile ? "2" : "3"}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={graphAnimation ? "animate-draw" : ""}
                            style={{
                              strokeDasharray: 4000,
                              strokeDashoffset: graphAnimation ? 0 : 4000,
                              transition:
                                "stroke-dashoffset 1.5s ease-in-out 0.3s",
                            }}
                          />

                          {/* Interactive points for Sleeper */}
                          {sleeperData.map((point, idx) => (
                            <circle
                              key={`sleeper-${idx}`}
                              cx={getX(idx)}
                              cy={calculateYPosition(point, dynamicMaxValue)}
                              r={isMobile ? "4" : "6"}
                              fill="#f97316"
                              opacity="0"
                              className="interactive-point"
                            />
                          ))}

                          {/* Interactive points for Sitting */}
                          {sittingData.map((point, idx) => (
                            <circle
                              key={`sitting-${idx}`}
                              cx={getX(idx)}
                              cy={calculateYPosition(point, dynamicMaxValue)}
                              r={isMobile ? "4" : "6"}
                              fill="#9ca3af"
                              opacity="0"
                              className="interactive-point"
                            />
                          ))}
                        </>
                      ) : (
                        <>
                          {/* Revenue Line */}
                          <path
                            d={buildPathString(revenueData, 1, dynamicMaxValue)}
                            stroke="#3b82f6"
                            strokeWidth={isMobile ? "2" : "3"}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={graphAnimation ? "animate-draw" : ""}
                            style={{
                              strokeDasharray: 4000,
                              strokeDashoffset: graphAnimation ? 0 : 4000,
                              transition: "stroke-dashoffset 1.5s ease-in-out",
                            }}
                          />

                          {/* Interactive points for Revenue */}
                          {revenueData.map((point, idx) => (
                            <circle
                              key={`revenue-${idx}`}
                              cx={getX(idx)}
                              cy={calculateYPosition(point, dynamicMaxValue)}
                              r={isMobile ? "4" : "6"}
                              fill="#3b82f6"
                              opacity="0"
                              className="interactive-point"
                            />
                          ))}
                        </>
                      )}

                      {/* Vertical indicator line */}
                      {tooltip.visible && tooltip.data && (
                        <line
                          x1={getX(tooltip.data.point)}
                          x2={getX(tooltip.data.point)}
                          y1="0"
                          y2="220"
                          stroke="#94a3b8"
                          strokeWidth="1"
                          strokeDasharray="4 4"
                          opacity="0.7"
                        />
                      )}
                    </svg>
                  </div>

                  {/* Bottom Panel - X-Axis Labels */}
                  <div className="absolute bottom-0 left-0 right-0">
                    <div
                      className="flex justify-between text-gray-500 font-medium"
                      style={{
                        marginLeft: isMobile ? "40px" : "64px",
                        marginRight: isMobile ? "40px" : "40px",
                        paddingBottom: "5px",
                        width: isMobile
                          ? `calc(${graphWidth} - 80px)`
                          : "calc(100% - 104px)",
                      }}
                    >
                      {timePeriod === "year"
                        ? xLabels.map((label, index) => (
                            <div
                              key={label}
                              className="text-center flex-1"
                              style={{
                                fontSize: isMobile ? "8px" : "11px",
                                lineHeight: "1.2",
                                padding: "0 1px",
                              }}
                            >
                              {label}
                            </div>
                          ))
                        : xLabels.map((label, index) => (
                            <div
                              key={label}
                              className="text-center flex-1"
                              style={{
                                fontSize: isMobile ? "7px" : "10px",
                                lineHeight: "1.2",
                                padding: "0 0.5px",
                              }}
                            >
                              {label}
                            </div>
                          ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tooltip */}
              {tooltip.visible && tooltip.data && (
                <div
                  className="absolute bg-white border border-gray-300 rounded-lg shadow-xl p-3 z-50 min-w-[120px] transition-all duration-200"
                  style={{ left: `${tooltipLeft}px`, top: `${tooltipTop}px` }}
                >
                  <div className="text-xs font-semibold text-gray-800 mb-1 border-b pb-1">
                    {timePeriod === "year"
                      ? `${xLabels[tooltip.data.point]} ${selectedYear}`
                      : `${selectedMonth} ${tooltip.data.point + 1}`}
                  </div>
                  {!showRevenue ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                          <span className="text-xs text-gray-600">
                            Sleeper:
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-gray-800">
                          {tooltip.data.sleeper}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                          <span className="text-xs text-gray-600">
                            Sitting:
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-gray-800">
                          {tooltip.data.sitting}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3 pt-1 border-t">
                        <span className="text-xs text-gray-600 font-medium">
                          Total:
                        </span>
                        <span className="text-xs font-bold text-gray-800">
                          {tooltip.data.sleeper + tooltip.data.sitting}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span className="text-xs text-gray-600">Revenue:</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-800">
                        ₹ {(tooltip.data.revenue * 1000).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-white border-l border-t border-gray-300 rotate-45"></div>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Add CSS for animation and scrollbar styling */}
      <style>{`
        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }
        .animate-draw {
          animation: draw 1.5s ease-in-out forwards;
        }
        
        .interactive-point:hover {
          opacity: 0.3 !important;
          r: 10 !important;
        }
        
        @media (hover: none) {
          .interactive-point:hover {
            opacity: 0 !important;
            r: 8 !important;
          }
        }
        
        /* Custom scrollbar for mobile */
        .scrollable-graph::-webkit-scrollbar {
          height: 6px;
        }
        
        .scrollable-graph::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        
        .scrollable-graph::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        
        .scrollable-graph::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
};

export default Report;
