import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Plus, Search, ArrowRight } from "lucide-react";
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

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedYear, setSelectedYear] = useState("2025");

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, [selectedYear]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all dashboard data in parallel - Get 12 months data for full year
      const [statsRes, revenueRes, bookingsRes] = await Promise.all([
        analyticsAPI.getDashboardStats(),
        analyticsAPI.getMonthlyRevenue({ year: parseInt(selectedYear), months: 12 }), // Changed to 12 months
        analyticsAPI.getRecentBookings({ limit: 10 }),
      ]);

      setDashboardStats(statsRes.data.data);
      setMonthlyRevenue(revenueRes.data.data || []);
      setRecentBookings(bookingsRes.data.data);
      
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      toast.error(error.response?.data?.error || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings based on search
  const filteredBookings = recentBookings.filter((booking) => {
    return (
      booking.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.booking_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.worker_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Transform monthly revenue data for bar chart - Ensure we have all 12 months
  const bookingData = monthlyRevenue.length > 0 
    ? monthlyRevenue.map((item) => ({
        month: item.month?.substring(0, 3) || "N/A",
        Sitting: item.sitting_bookings || 0,
        Sleeper: item.sleeper_bookings || 0,
      }))
    : // Fallback data if API returns empty
      [
        { month: "Jan", Sitting: 0, Sleeper: 0 },
        { month: "Feb", Sitting: 0, Sleeper: 0 },
        { month: "Mar", Sitting: 0, Sleeper: 0 },
        { month: "Apr", Sitting: 0, Sleeper: 0 },
        { month: "May", Sitting: 0, Sleeper: 0 },
        { month: "Jun", Sitting: 0, Sleeper: 0 },
        { month: "Jul", Sitting: 0, Sleeper: 0 },
        { month: "Aug", Sitting: 0, Sleeper: 0 },
        { month: "Sep", Sitting: 0, Sleeper: 0 },
        { month: "Oct", Sitting: 0, Sleeper: 0 },
        { month: "Nov", Sitting: 0, Sleeper: 0 },
        { month: "Dec", Sitting: 0, Sleeper: 0 },
      ];

  // Calculate dynamic width for mobile scrolling - increased for 12 months
  const chartWidth = isMobile ? Math.max(800, bookingData.length * 70) : '100%';

  // Donut chart data from stats
  const topCategoryData = dashboardStats ? [
    { name: "Sitting", value: dashboardStats.top_category?.sitting?.percentage || 0 },
    { name: "Sleeper", value: dashboardStats.top_category?.sleeper?.percentage || 0 },
  ] : [
    { name: "Sitting", value: 50 },
    { name: "Sleeper", value: 50 },
  ];

  const COLORS = ["#F59E0B", "#3B82F6"];

  const handleBookingClick = (booking: any) => {
    if (booking.booking_status === "active") {
      navigate(`/booking-details-active/${booking.booking_id}`);
    } else {
      navigate(`/booking-details-completed/${booking.booking_id}`);
    }
  };

  // Progress bar component
  const ProgressBar = ({ value, max, color, label }: { value: number; max: number; color: string; label: string }) => {
    const percentage = (value / max) * 100;
    return (
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm font-bold text-gray-800">
            {value}/{max}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="h-2.5 rounded-full"
            style={{ width: `${percentage}%`, backgroundColor: color }}
          ></div>
        </div>
      </div>
    );
  };

  // Year selection options
  const years = ["2025", "2024", "2023", "2022"];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="p-4 md:p-6">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-lg text-gray-600">Loading dashboard...</div>
          </div>
        ) : (
          <>
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-black rounded-xl p-4 md:p-6 mb-4 md:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-lg">
          <div className="mb-3 sm:mb-0">
            <h1 className="text-xl md:text-2xl font-bold text-white">
              Good morning, Admin!
            </h1>
            <p className="text-gray-300 mt-1 text-xs md:text-sm">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-5 mb-4 md:mb-6">
          <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-lg p-4 md:p-5 shadow-sm h-32 md:h-40 flex flex-col justify-between">
            <h3 className="text-xs md:text-sm mb-1 md:mb-2 opacity-90">
              Total Revenue
            </h3>
            <div>
              <p className="text-xl md:text-2xl font-bold">
                ₹ {dashboardStats?.revenue?.total?.toLocaleString() || "0"}
              </p>
              <p className={`text-xs mt-1 md:mt-2 ${dashboardStats?.revenue?.trend === 'up' ? 'text-green-300' : 'text-red-300'}`}>
                {dashboardStats?.revenue?.trend === 'up' ? '+' : ''}{dashboardStats?.revenue?.percentage_change || 0}% From last month
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-lg p-4 md:p-5 shadow-sm h-32 md:h-40 flex flex-col justify-between">
            <p className="text-xs md:text-sm font-semibold mb-2 md:mb-4">
              Top category
            </p>
            <div className="flex items-center justify-between">
              <div className="w-16 h-16 md:w-20 md:h-20">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={topCategoryData}
                      innerRadius={isMobile ? 20 : 30}
                      outerRadius={isMobile ? 30 : 40}
                      paddingAngle={5}
                      cornerRadius={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {topCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                  <span className="text-xs">Sitting</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  <span className="text-xs">Sleeper</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 md:p-5 shadow-sm h-32 md:h-40 flex flex-col justify-between">
            <h3 className="text-xs md:text-sm text-gray-500 mb-1 md:mb-2">
              Total Bookings
            </h3>
            <div>
              <p className="text-xl md:text-2xl font-bold text-gray-800">
                {dashboardStats?.bookings?.total || 0}
              </p>
              <p className={`text-xs mt-1 md:mt-2 ${dashboardStats?.bookings?.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {dashboardStats?.bookings?.change >= 0 ? '+' : ''}{dashboardStats?.bookings?.change || 0} From last day
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 md:p-5 shadow-sm h-32 md:h-40 flex flex-col justify-between">
            <h3 className="text-xs md:text-sm text-gray-500 mb-1 md:mb-2">
              Completed
            </h3>
            <div>
              <p className="text-xl md:text-2xl font-bold text-gray-800">
                {dashboardStats?.completed?.total || 0}
              </p>
              <p className={`text-xs mt-1 md:mt-2 ${dashboardStats?.completed?.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {dashboardStats?.completed?.trend === 'up' ? '+' : ''}{dashboardStats?.completed?.percentage_change || 0}% From last month
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 md:p-5 shadow-sm h-32 md:h-40 flex flex-col justify-between">
            <h3 className="text-xs md:text-sm text-gray-500 mb-2 md:mb-3">
              Booked
            </h3>
            <div className="space-y-2 md:space-y-3">
              <ProgressBar 
                value={dashboardStats?.active_bookings?.sitting?.count || 0} 
                max={dashboardStats?.active_bookings?.sitting?.capacity || 50} 
                color="#F59E0B" 
                label="Sitting" 
              />
              <ProgressBar 
                value={dashboardStats?.active_bookings?.sleeper?.count || 0} 
                max={dashboardStats?.active_bookings?.sleeper?.capacity || 50} 
                color="#3B82F6" 
                label="Sleeper" 
              />
            </div>
          </div>
        </div>

        {/* Booking List and Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 bg-white border rounded-lg shadow-sm">
            <div className="p-4 md:p-6 border-b">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h2 className="text-base md:text-lg font-semibold text-gray-800">
                  Booking list
                </h2>
                
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Search by name or ID"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full text-sm"
                  />
                </div>

                {/* Filter Dropdown */}
                <Select defaultValue="all">
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

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black">
                  <tr>
                    <th className="text-left p-3 md:p-4 font-medium text-white text-xs uppercase">
                      Booking ID
                    </th>
                    <th className="text-left p-3 md:p-4 font-medium text-white text-xs uppercase">
                      Worker Name
                    </th>
                    <th className="text-left p-3 md:p-4 font-medium text-white text-xs uppercase">
                      Guest Name
                    </th>
                    <th className="text-left p-3 md:p-4 font-medium text-white text-xs uppercase">
                      Phone No.
                    </th>
                    <th className="text-left p-3 md:p-4 font-medium text-white text-xs uppercase">
                      Seat Type
                    </th>
                    <th className="text-left p-3 md:p-4 font-medium text-white text-xs uppercase">
                      In Time
                    </th>
                    <th className="text-left p-3 md:p-4 font-medium text-white text-xs uppercase">
                      Status
                    </th>
                    <th className="w-10 md:w-12 text-white"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleBookingClick(booking)}
                    >
                      <td className="p-3 md:p-4 text-xs md:text-sm font-medium text-blue-600">
                        {booking.booking_id}
                      </td>
                      <td className="p-3 md:p-4 text-xs md:text-sm text-gray-800">
                        {booking.worker_name || "N/A"}
                      </td>
                      <td className="p-3 md:p-4 text-xs md:text-sm text-gray-800">
                        {booking.guest_name}
                      </td>
                      <td className="p-3 md:p-4 text-xs md:text-sm text-gray-600">
                        {booking.phone_number}
                      </td>
                      <td className="p-3 md:p-4 text-xs md:text-sm text-gray-800 capitalize">
                        {booking.booking_type}
                      </td>
                      <td className="p-3 md:p-4 text-xs md:text-sm text-gray-800">
                        {booking.in_time}
                      </td>
                      <td className="p-3 md:p-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${booking.booking_status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                            }`}
                        >
                          {booking.booking_status}
                        </span>
                      </td>
                      <td className="p-3 md:p-4">
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </td>
                    </tr>
                  ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-6 md:p-8 text-center text-gray-500 text-sm">
                        No bookings found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white border rounded-lg p-4 md:p-6 shadow-sm">
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
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                <span className="text-xs text-gray-600">Sitting</span>
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                <span className="text-xs text-gray-600">Sleeper</span>
              </div>
            </div>

            <div className="text-center mb-3 md:mb-4">
              {/* Year Selection Dropdown */}
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-24 mx-auto text-sm font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Scrollable Chart Container for Mobile */}
            <div 
              className="w-full scrollable-chart"
              style={{ 
                height: isMobile ? '280px' : '320px',
                overflowX: isMobile ? 'auto' : 'hidden',
                overflowY: 'hidden'
              }}
            >
              <div style={{ width: chartWidth, height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={isMobile ? 800 : 400}>
                  <BarChart 
                    data={bookingData} 
                    barSize={isMobile ? 20 : 24}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEE" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#888" 
                      fontSize={isMobile ? 10 : 11}
                      interval={0}
                    />
                    <YAxis 
                      stroke="#888" 
                      fontSize={isMobile ? 10 : 11}
                    />
                    <Tooltip />
                    <Bar 
                      dataKey="Sitting" 
                      fill="#F59E0B" 
                      radius={[4, 4, 0, 0]}
                      name="Sitting Bookings"
                    />
                    <Bar 
                      dataKey="Sleeper" 
                      fill="#3B82F6" 
                      radius={[4, 4, 0, 0]}
                      name="Sleeper Bookings"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-3 md:mt-4 text-center">
              <button className="text-xs text-gray-500 flex items-center justify-center w-full">
                January - December <ArrowRight className="w-3 h-3 ml-1" />
              </button>
            </div>
          </div>
        </div>
        </>
        )}
      </main>

      {/* Add CSS for scrollbar styling */}
      <style>{`
        /* Custom scrollbar for mobile */
        .scrollable-chart::-webkit-scrollbar {
          height: 6px;
        }
        
        .scrollable-chart::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        
        .scrollable-chart::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        
        .scrollable-chart::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;