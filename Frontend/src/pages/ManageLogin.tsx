import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { workerAPI, settingsAPI } from "@/services/api";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { getAdminId } from "@/lib/cookieUtils";

const ManageLogin = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Scroll to top on route change
  useScrollToTop();
  // Today's date in YYYY-MM-DD using local time
  function getTodayInputDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
    joiningDate: getTodayInputDate(),
    gender: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "worker",
    currentPassword: "",
    seatingTypes: [] as string[],
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
    // include total bookings so the table can show it without TS errors
    total_bookings?: number;
    seating_types?: string[];
  }

  const [accounts, setAccounts] = useState<Worker[]>([]);
  const [editingAccount, setEditingAccount] = useState<Worker | null>(null);
  const [editingWorkerId, setEditingWorkerId] = useState<string>("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Available seating types from settings
  interface SeatingType {
    name: string;
    enabled: boolean;
  }
  const [availableSeatingTypes, setAvailableSeatingTypes] = useState<
    SeatingType[]
  >([]);

  // Fetch workers and settings on component mount
  useEffect(() => {
    console.log("[ManageLogin] Component mounted, initializing...");
    fetchWorkers();
    fetchSettings();
  }, []);

  // Fetch settings to get available seating types
  const fetchSettings = async () => {
    try {
      const adminId = getAdminId();
      if (!adminId) return;

      const response = await settingsAPI.getSettings(adminId);
      if (response.data && response.data.data) {
        const data = response.data.data;
        const types: SeatingType[] = [];

        if (data.type1) {
          types.push({ name: data.type1, enabled: true });
        }
        if (data.type2) {
          types.push({ name: data.type2, enabled: true });
        }
        if (data.type3) {
          types.push({ name: data.type3, enabled: true });
        }

        setAvailableSeatingTypes(types);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  // Check for incoming worker data from navigation
  useEffect(() => {
    const incomingWorker = location.state?.editingWorker;
    if (incomingWorker) {
      setEditingAccount(incomingWorker);
      setEditingWorkerId(incomingWorker.worker_id);
      setFormData({
        name: incomingWorker.full_name || incomingWorker.name,
        mobileNumber: incomingWorker.mobile_number || incomingWorker.mobile,
        joiningDate: formatDateForInput(
          incomingWorker.joining_date || incomingWorker.joiningDate
        ),
        gender: incomingWorker.gender || "",
        username:
          incomingWorker.user_name ||
          incomingWorker.username ||
          incomingWorker.loginId,
        password: "",
        confirmPassword: "",
        role: "worker",
        currentPassword: "",
        seatingTypes: incomingWorker.seating_types || [],
      });
    }
  }, [location.state]);

  // Sync form data with currently edited account when accounts update (e.g., after refresh)
  useEffect(() => {
    if (editingWorkerId && accounts.length > 0) {
      const currentAccount = accounts.find((a) => a.worker_id === editingWorkerId);
      if (currentAccount) {
        setFormData((prev) => ({
          ...prev,
          seatingTypes: currentAccount.seating_types || [],
        }));
      }
    }
  }, [accounts, editingWorkerId]);

  // Auto-save seating types to localStorage whenever they change during editing
  useEffect(() => {
    if (editingWorkerId && formData.seatingTypes) {
      const existingTypes = JSON.parse(
        localStorage.getItem("workerSeatingTypes") || "{}"
      );
      existingTypes[editingWorkerId] = formData.seatingTypes;
      localStorage.setItem(
        "workerSeatingTypes",
        JSON.stringify(existingTypes)
      );
      console.log(
        `[ManageLogin] Auto-saved seating types for worker ${editingWorkerId}:`,
        formData.seatingTypes,
        "Full storage now:",
        existingTypes
      );
    }
  }, [formData.seatingTypes, editingWorkerId]);

  // Fetch all workers from backend
  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const adminId = getAdminId();

      if (!adminId) {
        toast.error("Admin ID not found. Please login again.");
        return;
      }

      const response = await workerAPI.getAllWorkers({ admin_id: adminId });

      if (response.data && response.data.workers) {
        // Load seating types from localStorage
        const storedSeatingTypes = JSON.parse(
          localStorage.getItem("workerSeatingTypes") || "{}"
        );
        console.log(
          "[ManageLogin] Loaded stored seating types from localStorage:",
          storedSeatingTypes
        );

        // normalize fields so ManageLogin table can safely read status and total_bookings
        const normalized: Worker[] = response.data.workers.map((w: any) => ({
          ...w,
          status: w.status || w.worker_status || w.workerStatus || "active",
          total_bookings: w.total_bookings ?? w.totalBookings ?? 0,
          seating_types: storedSeatingTypes[w.worker_id] || [],
        }));
        setAccounts(normalized);
        console.log("[ManageLogin] Normalized workers with seating types:", normalized);

        // Ensure localStorage is kept in sync with backend data for persistence across refreshes
        const updatedSeatingTypes: { [key: string]: string[] } = {};
        normalized.forEach((worker) => {
          updatedSeatingTypes[worker.worker_id] = worker.seating_types || [];
        });
        localStorage.setItem(
          "workerSeatingTypes",
          JSON.stringify(updatedSeatingTypes)
        );
      }
    } catch (error: any) {
      console.error("Error fetching workers:", error);
      const msg = error.response?.data?.error || "Failed to load workers";
      // Only show an error toast if we have no data loaded.
      // If we already have accounts in state, keep the UI and show a softer notice.
      if (accounts.length === 0) {
        toast.error(msg);
      } else {
        // Non-blocking notice when refresh fails but cached data is shown
        if ((toast as any).message) {
          (toast as any).message("Couldn’t refresh workers; showing existing data");
        } else {
          // Fallback to info if supported by sonner
          (toast as any).info?.("Couldn’t refresh workers; showing existing data");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
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
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    nextField: string
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        const inputs = Array.from(
          form.querySelectorAll("input, select, button")
        );
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
    const value = e.target.value.replace(/\D/g, ""); // Remove non-digit characters
    if (value.length <= 10) {
      setFormData({ ...formData, mobileNumber: value });
    }
  };

  const handleCreateAccount = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!formData.mobileNumber.trim()) {
      toast.error("Mobile number is required");
      return;
    }
    if (formData.mobileNumber.length !== 10) {
      toast.error("Mobile number must be 10 digits");
      return;
    }
    if (!formData.joiningDate) {
      toast.error("Joining date is required");
      return;
    }
    if (!formData.username.trim()) {
      toast.error("Username is required");
      return;
    }
    if (!formData.password.trim()) {
      toast.error("Password is required");
      return;
    }
    if (formData.password.length < 8 || formData.password.length > 16) {
      toast.error("Password must be 8–16 characters long");
      return;
    }
    if (
      availableSeatingTypes.length > 0 &&
      formData.seatingTypes.length === 0
    ) {
      toast.error("Please select at least one seating type");
      return;
    }

    try {
      setSubmitting(true);

      // Get admin ID from cookies
      const adminId = getAdminId();

      if (!adminId) {
        toast.error("Admin ID not found. Please login again.");
        return;
      }

      const workerData = {
        admin_id: adminId,
        full_name: formData.name,
        mobile_number: formData.mobileNumber,
        joining_date: formData.joiningDate,
        gender: formData.gender || null,
        user_name: formData.username,
        password: formData.password,
        seating_types: formData.seatingTypes,
      };

      const response = await workerAPI.createWorker(workerData);

      if (response.data) {
        // Store seating types in localStorage temporarily until backend is updated
        if (formData.seatingTypes.length > 0) {
          const workerId = response.data.worker?.worker_id;
          if (workerId) {
            const existingTypes = JSON.parse(
              localStorage.getItem("workerSeatingTypes") || "{}"
            );
            existingTypes[workerId] = formData.seatingTypes;
            localStorage.setItem(
              "workerSeatingTypes",
              JSON.stringify(existingTypes)
            );
          }
        }

        const seatingTypesMsg =
          formData.seatingTypes.length > 0
            ? ` (Seating types: ${formData.seatingTypes.join(", ")})`
            : "";
        toast.success(`Worker account created successfully!${seatingTypesMsg}`);
        await fetchWorkers(); // Refresh the list
        handleCancel();
      }
    } catch (error: any) {
      console.error("Error creating worker:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to create worker account";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      mobileNumber: "",
      joiningDate: getTodayInputDate(),
      gender: "",
      username: "",
      password: "",
      confirmPassword: "",
      role: "worker",
      currentPassword: "",
      seatingTypes: [],
    });
    setEditingAccount(null);
    setEditingWorkerId("");
    setShowResetPassword(false);
    setShowPassword(false);
    setShowNewPassword(false);
  };

  // For Cancel button: go back to previous page
  const handleCancelAndGoBack = () => {
    navigate(-1);
  };

  const handleRowClick = (account: Worker) => {
    // Load seating types from localStorage as the source of truth
    const storedSeatingTypes = JSON.parse(
      localStorage.getItem("workerSeatingTypes") || "{}"
    );
    const seatingTypesForWorker =
      storedSeatingTypes[account.worker_id] || account.seating_types || [];

    console.log(
      `[ManageLogin] Loading worker ${account.worker_id}`,
      "stored data:",
      storedSeatingTypes,
      "types for this worker:",
      seatingTypesForWorker
    );

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
      seatingTypes: Array.isArray(seatingTypesForWorker)
        ? seatingTypesForWorker
        : [],
    });
    setShowResetPassword(false);
    setShowNewPassword(false);
  };

  const handleUpdateAccount = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!formData.mobileNumber.trim()) {
      toast.error("Mobile number is required");
      return;
    }
    if (formData.mobileNumber.length !== 10) {
      toast.error("Mobile number must be 10 digits");
      return;
    }
    if (!formData.joiningDate) {
      toast.error("Joining date is required");
      return;
    }
    if (
      availableSeatingTypes.length > 0 &&
      formData.seatingTypes.length === 0
    ) {
      toast.error("Please select at least one seating type");
      return;
    }
    if (!editingWorkerId) {
      toast.error("No worker selected for update");
      return;
    }

    if (showResetPassword && formData.password.trim() === "") {
      toast.error("Please enter new password before saving.");
      return;
    }
    if (
      showResetPassword &&
      (formData.password.length < 8 || formData.password.length > 16)
    ) {
      toast.error("New password must be 8–16 characters long");
      return;
    }

    try {
      setSubmitting(true);

      const workerData = {
        full_name: formData.name,
        mobile_number: formData.mobileNumber,
        joining_date: formData.joiningDate,
        gender: formData.gender || null,
        seating_types: formData.seatingTypes,
      };

      await workerAPI.updateWorker(editingWorkerId, workerData);

      // Store seating types in localStorage temporarily until backend is updated
      if (formData.seatingTypes.length >= 0) {
        const existingTypes = JSON.parse(
          localStorage.getItem("workerSeatingTypes") || "{}"
        );
        existingTypes[editingWorkerId] = formData.seatingTypes;
        localStorage.setItem(
          "workerSeatingTypes",
          JSON.stringify(existingTypes)
        );
      }

      // Handle password reset if requested
      if (showResetPassword && formData.password.trim()) {
        await workerAPI.updateWorkerPassword(editingWorkerId, {
          new_password: formData.password,
          admin_reset: true, // Indicate this is an admin-initiated reset
        });

        const seatingTypesMsg =
          formData.seatingTypes.length > 0
            ? ` (Seating types: ${formData.seatingTypes.join(", ")})`
            : "";
        toast.success(
          `Worker account and password updated successfully!${seatingTypesMsg}`
        );
      } else {
        const seatingTypesMsg =
          formData.seatingTypes.length > 0
            ? ` (Seating types: ${formData.seatingTypes.join(", ")})`
            : "";
        toast.success(`Worker account updated successfully!${seatingTypesMsg}`);
      }

      await fetchWorkers(); // Refresh the list
      handleCancel();
      navigate("/workerlist");
    } catch (error: any) {
      console.error("Error updating worker:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to update worker account";
      toast.error(errorMessage);
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
          <h1 className="text-2xl font-bold text-nav-foreground">
            Manage Account!
          </h1>
          <p className="text-nav-foreground/80">Update or Add a New Login</p>
        </div>

        {/* Form Section */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold">
              {editingAccount ? "Update Account" : "Create New Account"}
            </h2>
          </div>
          <form className="bg-card border rounded-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  placeholder="Enter your first name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  onKeyDown={(e) => handleKeyDown(e, "mobileNumber")}
                />
              </div>
              {/* Mobile Number */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Mobile Number
                </label>
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
                <label className="block text-sm font-medium mb-2">
                  Joining Date
                </label>
                <Input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) =>
                    setFormData({ ...formData, joiningDate: e.target.value })
                  }
                  onKeyDown={(e) => handleKeyDown(e, "gender")}
                />
              </div>
              {/* Gender */}
              <div>
                <label className="block text-sm font-medium mb-2">Gender</label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) =>
                    setFormData({ ...formData, gender: value })
                  }
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
              {/* Seating Types */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Seating Types (Required)
                </label>
                <div className="border rounded-md p-4 space-y-3 bg-background">
                  {availableSeatingTypes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No seating types configured in settings
                    </p>
                  ) : (
                    availableSeatingTypes.map((type) => (
                      <div
                        key={type.name}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`seating-${type.name}`}
                          checked={formData.seatingTypes.includes(type.name)}
                          onCheckedChange={(checked) => {
                            console.log(
                              `[Checkbox] ${type.name} toggled to:`,
                              checked,
                              "Current seatingTypes before:",
                              formData.seatingTypes
                            );
                            if (checked) {
                              const updated = [
                                ...formData.seatingTypes,
                                type.name,
                              ];
                              console.log("Updated to:", updated);
                              setFormData({
                                ...formData,
                                seatingTypes: updated,
                              });
                            } else {
                              const updated = formData.seatingTypes.filter(
                                (t) => t !== type.name
                              );
                              console.log("Updated to:", updated);
                              setFormData({
                                ...formData,
                                seatingTypes: updated,
                              });
                            }
                          }}
                        />
                        <Label
                          htmlFor={`seating-${type.name}`}
                          className="text-sm font-normal cursor-pointer capitalize"
                        >
                          {type.name}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
                {editingAccount && (
                  <div className="mt-2">
                    <span className="text-sm text-muted-foreground">
                      Currently selected:
                    </span>
                    {formData.seatingTypes.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {formData.seatingTypes.map((t) => (
                          <Badge key={t} variant="secondary" className="capitalize">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">None selected</p>
                    )}
                  </div>
                )}
              </div>
              {/* Username */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Username
                </label>
                <Input
                  placeholder="Enter your Username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  disabled={!!editingAccount}
                  className={
                    editingAccount ? "bg-muted/50 cursor-not-allowed" : ""
                  }
                  onKeyDown={(e) => handleKeyDown(e, "password")}
                />
                {editingAccount && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Username cannot be changed
                  </p>
                )}
              </div>

              {/* Password Section */}
              {!editingAccount ? (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      maxLength={16}
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
                      <label className="block text-sm font-medium mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                          maxLength={16}
                          onKeyDown={(e) => handleKeyDown(e, "buttons")}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
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
                  onClick={handleCancelAndGoBack}
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
                    className="w-full lg:w-[300px] sm:w-auto px-12 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : "Save"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleCreateAccount}
                    disabled={submitting}
                    className="w-full lg:w-[300px] sm:w-auto px-12 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
                  >
                    {submitting ? "Creating..." : "Create Account"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ManageLogin;