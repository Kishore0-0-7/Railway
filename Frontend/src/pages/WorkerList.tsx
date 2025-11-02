import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { workerAPI } from "@/services/api";
import { toast } from "sonner";

const WorkerList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch workers from backend on component mount
  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const response = await workerAPI.getAllWorkers();
      
      if (response.data && response.data.workers) {
        setWorkers(response.data.workers);
      }
    } catch (error: any) {
      console.error("Error fetching workers:", error);
      toast.error(error.response?.data?.error || "Failed to load workers");
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkers = workers.filter((worker) =>
    worker.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.worker_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.mobile_number?.includes(searchTerm)
  );

  const handleRowClick = (worker: any) => {
    navigate(`/worker-details/${worker.worker_id}`, { state: { worker } });
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="p-8">
        <div className="max-w-7xl mx-auto bg-white shadow-sm rounded-2xl border border-gray-200 p-6">
          {/* Search & Button */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div className="relative flex-1 max-w-lg">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search by name, ID, or phone"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button
              className="mt-4 md:mt-0 bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => navigate("/manage-login")}
            >
              + New Worker
            </Button>
          </div>

          <p className="text-sm text-gray-400 mb-4">
            Click to View and Edit Details
          </p>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading workers...</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">S.No</th>
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Login ID</th>
                  <th className="px-4 py-3 text-left font-medium">Phone No.</th>
                  <th className="px-4 py-3 text-left font-medium">Gender</th>
                  <th className="px-4 py-3 text-left font-medium">Joining Date</th>
                  <th className="px-4 py-3 text-left font-medium">Total Bookings</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkers.length > 0 ? (
                  filteredWorkers.map((worker, index) => (
                    <tr
                      key={worker.worker_id || index}
                      onClick={() => handleRowClick(worker)}
                      className="hover:bg-gray-50 border-t cursor-pointer transition"
                    >
                      <td className="px-4 py-3">{index + 1}</td>
                      <td className="px-4 py-3">{worker.full_name}</td>
                      <td className="px-4 py-3 text-blue-600">{worker.worker_id}</td>
                      <td className="px-4 py-3">{worker.mobile_number}</td>
                      <td className="px-4 py-3 capitalize">{worker.gender || "N/A"}</td>
                      <td className="px-4 py-3">{formatDate(worker.joining_date)}</td>
                      <td className="px-4 py-3">-</td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-medium ${
                            (worker.status || "active").toLowerCase() === "active"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {((worker.status || "active") as string)
                            .charAt(0)
                            .toUpperCase() +
                            ((worker.status || "active") as string).slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      No workers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WorkerList;