import { useLocation, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Search, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const WorkerDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const worker = location.state?.worker || {
    id: 1,
    loginId: "#1223",
    name: "Paul Walker",
    gender: "Male",
    phone: "9516155854",
    joiningDate: "20 Sep 2025",
    status: "Active"
  };

  const bookings = [
    { id: "#1223", name: "Alex Fisher", phone: "+91 902 543 3001", persons: 3, type: "Sleeper", status: "Completed" },
    { id: "#1224", name: "Anna Baker", phone: "+91 902 543 3001", persons: 5, type: "Sitting", status: "Active" },
    { id: "#1224", name: "Anna Baker", phone: "+91 902 543 3001", persons: 2, type: "Sleeper", status: "Active" },
    { id: "#1223", name: "Alex Fisher", phone: "+91 902 543 3001", persons: 1, type: "Sleeper", status: "Completed" },
    { id: "#1223", name: "Alex Fisher", phone: "+91 902 543 3001", persons: 1, type: "Sitting", status: "Completed" },
    { id: "#1223", name: "Alex Fisher", phone: "+91 902 543 3001", persons: 6, type: "Sleeper", status: "Active" },
    { id: "#1223", name: "Alex Fisher", phone: "+91 902 543 3001", persons: 3, type: "Sleeper", status: "Active" },
  ];

  const handleStatusToggle = () => {
    try {
      // Get current workers from localStorage
      const savedWorkers = localStorage.getItem('workers');
      let workers = [];

      if (savedWorkers) {
        workers = JSON.parse(savedWorkers);
      } else {
        // If no workers in localStorage, create initial data
        workers = [
          {
            id: 1,
            name: "Paul Walker",
            loginId: "#1223",
            phone: "9516155854",
            gender: "Male",
            joiningDate: "20 Sep 2025",
            totalBookings: 30,
            status: "Active",
          },
          {
            id: 2,
            name: "John Doe",
            loginId: "#1224",
            phone: "7516155855",
            gender: "Male",
            joiningDate: "30 Aug 2025",
            totalBookings: 34,
            status: "Active",
          },
          {
            id: 3,
            name: "Jane Smith",
            loginId: "#1225",
            phone: "6416155856",
            gender: "Male",
            joiningDate: "16 May 2021",
            totalBookings: 48,
            status: "Active",
          },
          {
            id: 4,
            name: "Mike Johnson",
            loginId: "#1226",
            phone: "8216155857",
            gender: "Male",
            joiningDate: "20 Jun 2021",
            totalBookings: 0,
            status: "Inactive",
          },
          {
            id: 5,
            name: "Sarah Wilson",
            loginId: "#1227",
            phone: "7716155858",
            gender: "Male",
            joiningDate: "12 Jun 2020",
            totalBookings: 112,
            status: "Inactive",
          },
        ];
      }

      // Update the specific worker's status
      const updatedWorkers = workers.map((w) =>
        w.id === worker.id
          ? {
            ...w,
            status: worker.status === "Active" ? "Inactive" : "Active"
          }
          : w
      );

      // Save back to localStorage
      localStorage.setItem('workers', JSON.stringify(updatedWorkers));

      // Navigate back to worker list using -1 to go back to previous page
      navigate(-1);
    } catch (error) {
      console.error('Error updating worker status:', error);
    }
  };

  const handleEditDetails = () => {
    // Navigate to ManageLogin page with worker data
    navigate('/manage-login', {
      state: {
        editingWorker: {
          name: worker.name,
          mobile: worker.phone,
          loginId: worker.loginId,
          joiningDate: worker.joiningDate,
          gender: worker.gender,
          totalBookings: worker.totalBookings || 0,
          status: worker.status
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-black text-white rounded-xl p-6 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-semibold">{worker.name}</h1>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Button
                variant="destructive"
                className={`${worker.status === "Active"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                  } text-white`}
                onClick={handleStatusToggle}
              >
                {worker.status === "Active" ? "Remove Worker" : "Re-Join"}
              </Button>
              <Button
                variant="outline"
                className="bg-white text-black hover:bg-gray-100"
                onClick={handleEditDetails}
              >
                Edit Details
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-black text-white p-5 rounded-xl">
              <p className="text-sm text-gray-300">Total Revenue</p>
              <h2 className="text-3xl font-semibold mt-2">₹45,000</h2>
              <p className="text-green-400 text-sm mt-1">+2.81% From last month</p>
            </div>

            <div className="bg-white border border-gray-200 p-5 rounded-xl">
              <p className="text-gray-600 text-sm">Total Bookings</p>
              <h2 className="text-3xl font-semibold mt-2">60</h2>
              <p className="text-red-500 text-sm mt-1">-5 From last day</p>
            </div>

            <div className="bg-white border border-gray-200 p-5 rounded-xl">
              <p className="text-gray-600 text-sm">Completed</p>
              <h2 className="text-3xl font-semibold mt-2">18</h2>
              <p className="text-green-500 text-sm mt-1">+2 From last month</p>
            </div>

            <div className="bg-white border border-gray-200 p-5 rounded-xl">
              <p className="text-gray-600 text-sm">Booked</p>
              <div className="flex justify-between mt-2">
                <div>
                  <h2 className="text-xl font-semibold">42/50</h2>
                  <p className="text-xs text-gray-500">Sitting</p>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">42/50</h2>
                  <p className="text-xs text-gray-500">Sleeper</p>
                </div>
              </div>
            </div>
          </div>
          {/* Bookings and Worker Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bookings Table */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                  Bookings by {worker.name}
                </h2>

                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search"
                      className="w-full sm:w-[160px] pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                    />
                  </div>

                  <Select>
                    <SelectTrigger className="w-full sm:w-[120px]">
                      <Calendar className="mr-2 w-4 h-4" />
                      <SelectValue placeholder="Today" />
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

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-700 min-w-[600px]">
                  <thead className="bg-gray-100 text-left text-gray-800">
                    <tr>
                      <th className="py-3 px-4">Booking ID</th>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Phone Number</th>
                      <th className="py-3 px-4">Persons</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b, i) => (
                      <tr key={i} className="border-t hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">{b.id}</td>
                        <td className="py-3 px-4">{b.name}</td>
                        <td className="py-3 px-4">{b.phone}</td>
                        <td className="py-3 px-4">{b.persons}</td>
                        <td className="py-3 px-4">{b.type}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-medium ${b.status === "Completed"
                                ? "text-green-600"
                                : "text-orange-500"
                              }`}
                          >
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Worker Details */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Worker Details</h2>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-500">Login ID</p>
                  <p className="text-gray-900 font-medium">{worker.loginId}</p>
                </div>
                <div>
                  <p className="text-gray-500">Name</p>
                  <p className="text-gray-900 font-medium">{worker.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Gender</p>
                  <p className="text-gray-900 font-medium">{worker.gender}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone No.</p>
                  <p className="text-gray-900 font-medium">{worker.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500">Joining Date</p>
                  <p className="text-gray-900 font-medium">{worker.joiningDate}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <p
                    className={`font-medium ${worker.status === "Active"
                        ? "text-green-600"
                        : "text-amber-500"
                      }`}
                  >
                    {worker.status}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WorkerDetails;