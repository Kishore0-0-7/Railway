import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { workerAPI } from "@/services/api";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

const ManageLogin = () => {
  const location = useLocation();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    mobileNumber: "",
    joiningDate: "",
    gender: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "worker",
    currentPassword: "",
  });

  interface Worker {
    worker_id: string;
    full_name: string;
    mobile_number: string;
    joining_date: string;
    gender: string | null;
    user_name: string;
    created_at: string;
    status: string;
    admin_name?: string;
    total_bookings?: number;
  }

  interface FormData {
    name: string;
    mobileNumber: string;
    joiningDate: string;
    gender: string;
    username: string;
    password: string;
    confirmPassword: string;
    role: 'worker';
    currentPassword: string;
  }

  const [accounts, setAccounts] = useState<Worker[]>([]);
  const [editingAccount, setEditingAccount] = useState<Worker | null>(null);
  const [editingWorkerId, setEditingWorkerId] = useState<string>("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch workers on component mount
  useEffect(() => {
    fetchWorkers();
  }, []);

  // Check for incoming worker data from navigation
  useEffect(() => {
    const incomingWorker = location.state?.editingWorker;
    if (incomingWorker) {
      setEditingAccount(incomingWorker);
      setEditingWorkerId(incomingWorker.worker_id);
      setFormData({
        name: incomingWorker.full_name || incomingWorker.name,
        mobileNumber: incomingWorker.mobile_number || incomingWorker.mobile,
        joiningDate: formatDateForInput(incomingWorker.joining_date || incomingWorker.joiningDate),
        gender: incomingWorker.gender || "",
        username: incomingWorker.user_name || incomingWorker.username || incomingWorker.loginId,
        password: "",
        confirmPassword: "",
        role: "worker",
        currentPassword: "",
      });
    }
  }, [location.state]);

  // Fetch all workers from backend
  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const response = await workerAPI.getAllWorkers();

      if (response.data && response.data.workers) {
        setAccounts(response.data.workers);
      }
    } catch (error) {
      console.error("Error fetching workers:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load workers";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Format date for display (DD Mon YYYY)
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Handle Enter key press to jump to next input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, nextField: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        const inputs = Array.from(form.querySelectorAll('input, select, button'));
        const currentIndex = inputs.indexOf(e.currentTarget);
        const nextInput = inputs[currentIndex + 1] as HTMLElement;
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };

  // Handle mobile number input - allow only numbers and limit to 10 digits
  const handleMobileNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digit characters
    if (value.length <= 10) {
      setFormData({ ...formData, mobileNumber: value });
    }
  };

  // Validate form fields and return error message if invalid
  const validateForm = (data: FormData, isCreating: boolean = false): string | null => {
    if (!data.name.trim()) return "Name is required";
    if (!data.mobileNumber.trim()) return "Mobile number is required";
    if (data.mobileNumber.length !== 10) return "Mobile number must be 10 digits";
    if (!data.joiningDate) return "Joining date is required";
    if (isCreating) {
      if (!data.username.trim()) return "Username is required";
      if (!data.password.trim()) return "Password is required";
      if (data.password.length < 6) return "Password must be at least 6 characters";
    }
    if (showResetPassword && !data.password.trim()) {
      return "New password is required";
    }
    return null;
  };

  const handleCreateAccount = async () => {
    setError(null);
    const validationError = validateForm(formData, true);
    if (validationError) {
      toast.error(validationError);
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);

      // Get admin ID from localStorage
      const adminId = localStorage.getItem("adminId") || "ADM001";

      const workerData = {
        admin_id: adminId,
        full_name: formData.name,
        mobile_number: formData.mobileNumber,
        joining_date: formData.joiningDate,
        gender: formData.gender || null,
        user_name: formData.username,
        password: formData.password,
      };

      const response = await workerAPI.createWorker(workerData);

      if (response.data) {
        toast.success("Worker account created successfully!");
        await fetchWorkers(); // Refresh the list
        handleCancel();
      }
    } catch (error) {
      console.error("Error creating worker:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create worker account";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      mobileNumber: "",
      joiningDate: "",
      gender: "",
      username: "",
      password: "",
      confirmPassword: "",
      role: "worker",
      currentPassword: "",
    });
    setEditingAccount(null);
    setEditingWorkerId("");
    setShowResetPassword(false);
    setShowPassword(false);
    setShowNewPassword(false);
  };

  const handleRowClick = (account: Worker) => {
    setEditingAccount(account);
    setEditingWorkerId(account.worker_id);
    setFormData({
      name: account.full_name,
      mobileNumber: account.mobile_number,
      joiningDate: formatDateForInput(account.joining_date),
      gender: account.gender || "",
      username: account.user_name,
      password: "",
      confirmPassword: "",
      role: "worker",
      currentPassword: "",
    });
    setShowResetPassword(false);
    setShowNewPassword(false);
  };

  const handleUpdateAccount = async () => {
    setError(null);

    if (!editingWorkerId) {
      const errorMsg = "No worker selected for update";
      toast.error(errorMsg);
      setError(errorMsg);
      return;
    }

    const validationError = validateForm(formData);
    if (validationError) {
      toast.error(validationError);
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);

      const workerData = {
        full_name: formData.name,
        mobile_number: formData.mobileNumber,
        joining_date: formData.joiningDate,
        gender: formData.gender || null,
      };

      await workerAPI.updateWorker(editingWorkerId, workerData);

      // Handle password reset if requested
      if (showResetPassword && formData.password.trim()) {
        // Note: Password update might need current password verification
        // Adjust based on your API requirements
        await workerAPI.updateWorkerPassword(editingWorkerId, {
          current_password: formData.currentPassword || "temp",
          new_password: formData.password,
        });
      }

      toast.success("Worker account updated successfully!");
      await fetchWorkers(); // Refresh the list
      handleCancel();
    } catch (error) {
      console.error("Error updating worker:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update worker account";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="p-6">
        {/* Header */}
        <div className="bg-nav rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-nav-foreground">Manage Account!</h1>
          <p className="text-nav-foreground/80">Update or Add a New Login</p>
        </div>

        {/* Form Section */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold">
              {editingAccount ? "Update Account" : "Create New Account"}
            </h2>
          </div>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <p className="text-sm">{error}</p>
            </div>
          )}
          <form className="bg-card border rounded-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  placeholder="Enter your first name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  onKeyDown={(e) => handleKeyDown(e, "mobileNumber")}
                />
              </div>
              {/* Mobile Number */}
              <div>
                <label className="block text-sm font-medium mb-2">Mobile Number</label>
                <Input
                  placeholder="Enter your Mobile Number"
                  value={formData.mobileNumber}
                  onChange={handleMobileNumberChange}
                  onKeyDown={(e) => handleKeyDown(e, "joiningDate")}
                  maxLength={10}
                />
              </div>
              {/* Joining Date */}
              <div>
                <label className="block text-sm font-medium mb-2">Joining Date</label>
                <Input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  onKeyDown={(e) => handleKeyDown(e, "gender")}
                />
              </div>
              {/* Gender */}
              <div>
                <label className="block text-sm font-medium mb-2">Gender</label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Username */}
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <Input
                  placeholder="Enter your Username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={!!editingAccount}
                  className={editingAccount ? "bg-muted/50 cursor-not-allowed" : ""}
                  onKeyDown={(e) => handleKeyDown(e, "password")}
                />
                {editingAccount && (
                  <p className="text-xs text-muted-foreground mt-1">Username cannot be changed</p>
                )}
              </div>

              {/* Password Section */}
              {!editingAccount ? (
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      onKeyDown={(e) => handleKeyDown(e, "buttons")}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-start justify-center">
                  {!showResetPassword ? (
                    <Button
                      type="button"
                      onClick={() => setShowResetPassword(true)}
                      className="bg-red-500 hover:bg-red-600 text-white mt-6"
                    >
                      Reset Password
                    </Button>
                  ) : (
                    <div className="w-full">
                      <label className="block text-sm font-medium mb-2">New Password</label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          onKeyDown={(e) => handleKeyDown(e, "buttons")}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* Buttons */}
              <div className="md:col-span-2 flex flex-col sm:flex-row justify-center sm:space-x-4 space-y-3 sm:space-y-0 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={submitting}
                  className="w-full lg:w-[300px] px-12 py-3 border border-muted-foreground/30 hover:bg-muted/30 rounded-md"
                >
                  Cancel
                </Button>

                {editingAccount ? (
                  <Button
                    type="button"
                    onClick={handleUpdateAccount}
                    disabled={submitting}
                    className="w-full  lg:w-[300px] sm:w-auto px-12 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : "Save"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleCreateAccount}
                    disabled={submitting}
                    className="w-full  lg:w-[300px] sm:w-auto px-12 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
                  >
                    {submitting ? "Creating..." : "Create Account"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Table Section */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-card border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">s.no</th>
                    <th className="text-left p-4 font-medium">Name</th>
                    <th className="text-left p-4 font-medium">Login ID</th>
                    <th className="text-left p-4 font-medium">Phone No.</th>
                    <th className="text-left p-4 font-medium">Gender</th>
                    <th className="text-left p-4 font-medium">Joining Date</th>
                    <th className="text-left p-4 font-medium">Total Bookings</th>
                    <th className="text-left p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="p-4 text-center text-muted-foreground">
                        Loading workers...
                      </td>
                    </tr>
                  ) : accounts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-4 text-center text-muted-foreground">
                        No workers found. Create one using the form above.
                      </td>
                    </tr>
                  ) : (
                    accounts.map((account, index) => (
                      <tr
                        key={account.worker_id}
                        className="border-b hover:bg-muted/30 cursor-pointer"
                        onClick={() => handleRowClick(account)}
                      >
                        <td className="p-4">{index + 1}</td>
                        <td className="p-4">{account.full_name}</td>
                        <td className="p-4">{account.worker_id}</td>
                        <td className="p-4">{account.mobile_number}</td>
                        <td className="p-4">{account.gender || "N/A"}</td>
                        <td className="p-4">{formatDateForDisplay(account.joining_date)}</td>
                        <td className="p-4">-</td>
                        <td className="p-4">
                          <Badge
                            variant={account.status === "active" ? "default" : "secondary"}
                            className={
                              account.status === "active"
                                ? "bg-green-500 text-white"
                                : "bg-red-400 text-white"
                            }
                          >
                            {account.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <p className="text-sm text-center text-gray-500 p-3">
                Click to View and Edit Details
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManageLogin;