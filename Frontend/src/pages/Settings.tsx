import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Edit,
  Check,
  X,
  Settings as SettingsIcon,
  User,
  Building,
  Train,
  Save,
  RotateCcw,
  Zap,
  Loader2,
  Upload,
  Image as ImageIcon,
  Clock,
} from "lucide-react";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { settingsAPI } from "@/services/api";
import { clearSettingsCache } from "@/lib/settingsUtils";
import { getAdminId, getAdminName, getEmail } from "@/lib/cookieUtils";
import { Textarea } from "@/components/ui/textarea";

interface SeatingType {
  name: string;
  amount: string;
  enabled: boolean;
  breakdown?: Record<string, string>;
  grace_time?: string; // in minutes
}

interface SettingsData {
  admin_id: string;
  admin_name: string;
  hall_name: string;
  heading1: string;
  heading2: string;
  info1: string;
  info2: string;
  note: string;
  logo_url?: string;
  seating_types: SeatingType[];
  advance_payment_enabled: boolean;
  discount_enabled: boolean;
  discount_percentage: number;
  default_advance_percentage: string;
}

const FIXED_SEATING_NAMES = ["Sitting", "Sleeping"];

// add an easily reusable default settings object for reset
const INITIAL_SETTINGS: SettingsData = {
  admin_id: "",
  admin_name: "",
  hall_name: "",
  heading1: "",
  heading2: "",
  info1: "",
  info2: "",
  note: "",
  logo_url: "",
  seating_types: [
    {
      name: FIXED_SEATING_NAMES[0],
      amount: "",
      enabled: true,
      grace_time: "0",
    },
    {
      name: FIXED_SEATING_NAMES[1],
      amount: "",
      enabled: true,
      breakdown: { "1-3": "", "1-6": "", "1-12": "", "1-24": "" },
      grace_time: "0",
    },
  ],
  advance_payment_enabled: true,
  discount_enabled: false,
  discount_percentage: 0,
  default_advance_percentage: "20",
};

const Settings = () => {
  // Scroll to top on route change
  useScrollToTop();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // initial state: ensure fixed names
  const [settings, setSettings] = useState<SettingsData>(
    JSON.parse(JSON.stringify(INITIAL_SETTINGS))
  );

  // Editing state for inline editing
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Get admin_id from cookies
  const adminId = getAdminId() || "";

  // Persist unsaved seating type names/amounts locally so toggling off/on
  // doesn't permanently lose previously entered values even if the server
  // clears them when a type is disabled.
  const DRAFTS_KEY = "seatingTypeDrafts";

  const loadDrafts = (): Array<{
    name?: string;
    amount?: string;
    breakdown?: Record<string, string>;
  }> => {
    try {
      const raw = localStorage.getItem(DRAFTS_KEY);
      if (!raw) return [];
      return JSON.parse(raw) || [];
    } catch {
      return [];
    }
  };

  const saveDrafts = (
    drafts: Array<{
      name?: string;
      amount?: string;
      breakdown?: Record<string, string>;
    }>
  ) => {
    try {
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
    } catch {
      // ignore localStorage errors
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getSettings(adminId);

      if (response.data && response.data.data) {
        const data = response.data.data;
        // Map database structure to component structure
        const drafts = loadDrafts();
        const serverBreakdown = data.type2_breakdown || {};
        const resolveValue = (value: any, fallback = "") =>
          value !== undefined && value !== null && value !== ""
            ? value.toString()
            : fallback;
        const sleeperAmount = resolveValue(
          serverBreakdown["1-24"] ?? data.type2_amount,
          drafts[1]?.amount || ""
        );
        const breakdownWithFallback: Record<string, string> = {
          "1-3": resolveValue(
            serverBreakdown["1-3"],
            drafts[1]?.breakdown?.["1-3"] || ""
          ),
          "1-6": resolveValue(
            serverBreakdown["1-6"],
            drafts[1]?.breakdown?.["1-6"] || ""
          ),
          "1-12": resolveValue(
            serverBreakdown["1-12"],
            drafts[1]?.breakdown?.["1-12"] || ""
          ),
          "1-24": resolveValue(
            serverBreakdown["1-24"] ?? data.type2_amount,
            drafts[1]?.breakdown?.["1-24"] || ""
          ),
        };
        const seatingTypes: SeatingType[] = [
          {
            // enforce fixed name, keep server amount if present or draft
            name: FIXED_SEATING_NAMES[0],
            amount: data.type1_amount?.toString() || drafts[0]?.amount || "",
            enabled: !!data.type1, // use server enabled flag
            grace_time: data.type1_grace_time?.toString() || "0",
          },
          {
            name: FIXED_SEATING_NAMES[1],
            amount: sleeperAmount,
            breakdown: breakdownWithFallback,
            enabled: !!data.type2,
            grace_time: data.type2_grace_time?.toString() || "0",
          },
        ];

        setSettings({
          admin_id: data.admin_id,
          admin_name: data.admin_name,
          hall_name: data.hall_name || "",
          heading1: data.heading1 || "",
          heading2: data.heading2 || "",
          info1: data.info1 || "",
          info2: data.info2 || "",
          note: data.note || "",
          logo_url: data.logo_url || "",
          seating_types: seatingTypes,
          advance_payment_enabled: data.advance_payment_enabled ?? true,
          discount_enabled: data.discount_enabled ?? false,
          discount_percentage: data.discount_percentage ?? 0,
          default_advance_percentage:
            data.default_advance_percentage?.toString() || "20",
        });

        if (data.logo_url) {
          // If logo_url is a server path (starts with /uploads), prepend API base URL
          const apiBaseUrl =
            import.meta.env.VITE_API_URL ||
            "https://railway-api.artechnology.pro";
          const logoUrl = data.logo_url.startsWith("/uploads")
            ? `${apiBaseUrl.replace("/api", "")}${data.logo_url}`
            : data.logo_url;
          setImagePreview(logoUrl);
        }
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Settings not found, use default empty values
        toast.info("No settings found. Please configure your settings.");
      } else {
        console.error("Error fetching settings:", error);
        toast.error("Failed to load settings");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    try {
      setUploadingImage(true);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to backend
      const adminId = getAdminId();
      console.log("Admin ID from cookies:", adminId);

      if (!adminId) {
        toast.error("Admin ID not found. Please login again.");
        setImagePreview("");
        return;
      }

      console.log("Uploading file to:", `/api/settings/upload-logo/${adminId}`);
      const response = await settingsAPI.uploadLogo(adminId, file);
      console.log("Upload response:", response.data);

      const logoUrl = response.data.data.logo_url;

      // Update settings state with the server path
      setSettings((prev) => ({
        ...prev,
        logo_url: logoUrl,
      }));

      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.response?.data?.message || "Failed to upload image");
      // Clear preview on error
      setImagePreview("");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    setSettings((prev) => ({
      ...prev,
      logo_url: "",
    }));
    toast.info("Image removed");
  };

  const handleSave = async () => {
    // Validation
    if (!settings.heading1.trim() && !settings.hall_name.trim()) {
      toast.error("At least Heading 1 is required");
      return;
    }

    try {
      setSaving(true);
      const payloadAdminName =
        (settings.admin_name && settings.admin_name.trim()) ||
        getAdminName() ||
        getEmail() ||
        adminId ||
        "Admin";

      // Build a working copy to ensure the 1-24 sleeping breakdown is the canonical amount
      const settingsToSave: SettingsData = JSON.parse(JSON.stringify(settings));
      const sleeper = settingsToSave.seating_types[1];
      if (sleeper?.breakdown?.["1-24"]) {
        sleeper.amount = sleeper.breakdown["1-24"];
      }

      // Debug logging
      console.log("=== SAVE DEBUG ===");
      console.log("Settings to save:", settingsToSave);
      console.log("Sitting amount:", settings.seating_types[0].amount);
      console.log("Sleeping amount:", sleeper.amount);
      console.log("Sleeping breakdown:", sleeper.breakdown);

      const apiData = {
        admin_name: payloadAdminName,
        hall_name: settings.hall_name,
        heading1: settings.heading1,
        heading2: settings.heading2,
        info1: settings.info1,
        info2: settings.info2,
        note: settings.note,
        logo_url: settings.logo_url,
        // Always send both types as enabled
        type1: FIXED_SEATING_NAMES[0],
        type1_amount: settings.seating_types[0].amount
          ? parseFloat(settings.seating_types[0].amount)
          : null,
        type1_grace_time: settings.seating_types[0].grace_time
          ? parseInt(settings.seating_types[0].grace_time)
          : 0,
        type2: FIXED_SEATING_NAMES[1],
        // send the 1-24 breakdown value as the canonical type2_amount
        type2_amount: settingsToSave.seating_types[1].amount
          ? parseFloat(settingsToSave.seating_types[1].amount)
          : null,
        type2_grace_time: settings.seating_types[1].grace_time
          ? parseInt(settings.seating_types[1].grace_time)
          : 0,
        type2_breakdown: settingsToSave.seating_types[1].breakdown || {},
        type4: null,
        type4_amount: null,
        advance_payment_enabled: settings.advance_payment_enabled,
        default_advance_percentage:
          parseFloat(settings.default_advance_percentage) || 20,
      };

      console.log("API payload:", apiData);
      console.log("Type1 amount (parsed):", apiData.type1_amount);
      console.log("Type2 amount (parsed):", apiData.type2_amount);

      const response = await settingsAPI.upsertSettings(adminId, apiData);
      console.log("API response:", response);

      // Update localStorage for settings utils
      const seatingTypesObj: Record<string, any> = {};

      // Use canonical storage keys expected by reports: 'sitting' and 'sleeper'
      seatingTypesObj.sitting = {
        amount: settingsToSave.seating_types[0].amount || "0",
        enabled: true,
      };

      seatingTypesObj.sleeper = {
        amount:
          settingsToSave.seating_types[1].breakdown?.["1-24"] ||
          settingsToSave.seating_types[1].amount ||
          "0",
        enabled: true,
        breakdown: settingsToSave.seating_types[1].breakdown || {},
      };

      // Legacy fallback for backwards compatibility (keeps previous behavior)
      if (!seatingTypesObj.sitting && settings.seating_types[0].enabled) {
        seatingTypesObj.sitting = {
          amount: settings.seating_types[0].amount || "15",
          enabled: settings.seating_types[0].enabled,
        };
      }
      if (!seatingTypesObj.sleeper && settings.seating_types[1].enabled) {
        seatingTypesObj.sleeper = {
          amount: settings.seating_types[1].amount || "20",
          enabled: settings.seating_types[1].enabled,
        };
      }

      const railwaySettings = {
        admin_name: payloadAdminName,
        admin_email: getEmail() || "admin@railway.com",
        admin_contact: localStorage.getItem("adminPhone") || "+91-9876543210",
        hall_name: settings.hall_name,
        heading1: settings.heading1,
        heading2: settings.heading2,
        info1: settings.info1,
        info2: settings.info2,
        note: settings.note,
        logo_url: settings.logo_url,
        seating_types: seatingTypesObj,
        // set revenue color for reports/graphs (multiple keys for compatibility)
        revenue_color: "green",
        revenueColor: "green",
        revenue_color_hex: "#10B981",
        revenueColorHex: "#10B981",
        revenue_series_color: "#10B981",
        revenueSeriesColor: "#10B981",
        // extra aliases some charts may look for
        chartColor: "#10B981",
        seriesColor: "#10B981",
        primaryColor: "#10B981",
        advance_payment_enabled: settings.advance_payment_enabled,
        default_advance_percentage: settings.default_advance_percentage,
      };
      // Persist the current values (including breakdown) locally so UI remains consistent
      localStorage.setItem("railwaySettings", JSON.stringify(railwaySettings));
      // Dispatch an event so other components/pages can react immediately (single-page apps)
      try {
        window.dispatchEvent(
          new CustomEvent("railwaySettingsChanged", { detail: railwaySettings })
        );
      } catch (e) {
        // ignore dispatch errors
      }

      toast.success("Settings saved successfully");

      // Update local React state from the saved copy so UI reflects saved values immediately.
      setSettings(settingsToSave);
    } catch (error) {
      console.error("Error saving settings:", error);
      console.error("Error details:", error.response?.data);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (field: string, currentValue: string) => {
    setEditing(field);
    setEditValue(currentValue);
  };

  const saveEdit = (field: string) => {
    if (editValue.trim() !== "") {
      handleSettingChange(field, editValue.trim());
      setEditing(null);
      setEditValue("");
    }
  };

  const saveSeatingEdit = (index: number, field: string) => {
    if (editValue.trim() !== "") {
      const trimmedValue = editValue.trim();
      console.log(`Saving ${field} for seating type ${index}:`, trimmedValue);
      handleSeatingTypeChange(index, field, trimmedValue);
      setEditing(null);
      setEditValue("");
    }
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditValue("");
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSeatingTypeChange = (
    index: number,
    field: string,
    value: any
  ) => {
    // Only update component state. Do NOT persist to localStorage or call API here.
    setSettings((prev) => {
      const updatedSeatingTypes = prev.seating_types.map((st, i) =>
        i === index ? { ...st, [field]: value } : st
      );
      return { ...prev, seating_types: updatedSeatingTypes } as SettingsData;
    });
  };

  const resetToDefaults = () => {
    try {
      localStorage.removeItem(DRAFTS_KEY);
    } catch (e) {
      // ignore
    }
    try {
      localStorage.removeItem("railwaySettings");
    } catch (e) {
      // ignore
    }
    setSettings(JSON.parse(JSON.stringify(INITIAL_SETTINGS)));
    setEditing(null);
    setEditValue("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 py-4 sm:py-6 lg:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-6 sm:mb-8">
            <Card className="bg-black text-white border-0 shadow-xl">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 rounded-full">
                      <SettingsIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                        Railway Settings
                      </h1>
                      <p className="text-blue-100 text-sm sm:text-base">
                        Configure your railway system settings and preferences
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 w-fit">
                    <Zap className="w-3 h-3 mr-1" />
                    Admin Panel
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Admin Information Card */}
            <Card className="lg:col-span-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b p-4 sm:p-6">
                <CardTitle className="flex items-center text-gray-800 text-lg sm:text-xl">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Admin Information
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Configure admin and system details
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-6">
                  {/* Logo Upload Section */}
                  <div className="space-y-2">
                    <Label className="flex items-center text-sm font-medium text-gray-700">
                      <ImageIcon className="w-4 h-4 mr-2 text-purple-500" />
                      Logo / Header Image
                    </Label>
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      {/* Image Preview */}
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Logo preview"
                            className="w-20 h-20 object-contain border-2 border-gray-200 rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="w-2 h-2" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}

                      {/* Upload Button */}
                      <div className="flex-1">
                        <label htmlFor="logo-upload" className="cursor-pointer">
                          <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-fit">
                            {uploadingImage ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Upload className="w-4 h-4" />
                            )}
                            <span className="text-sm">
                              {uploadingImage ? "Uploading..." : "Upload Image"}
                            </span>
                          </div>
                          <input
                            id="logo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={uploadingImage}
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-2">
                          Recommended: PNG or JPG, max 2MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Hall Name */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="hall_name"
                      className="flex items-center text-sm font-medium text-gray-700"
                    >
                      <Building className="w-4 h-4 mr-2 text-purple-500" />
                      Hall Name (Legacy)
                    </Label>
                    {editing === "hall_name" ? (
                      <div className="flex gap-2">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              saveEdit("hall_name");
                            }
                          }}
                          placeholder="Enter hall name"
                          className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => saveEdit("hall_name")}
                          className="bg-green-600 hover:bg-green-700 shadow-md"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={cancelEdit}
                          className="shadow-md"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="relative">
                        <Input
                          value={settings.hall_name}
                          placeholder="Enter hall name"
                          readOnly
                          onClick={() =>
                            startEditing("hall_name", settings.hall_name)
                          }
                          className="cursor-pointer pr-10 hover:bg-gray-50 transition-colors"
                        />
                        <Edit className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Ticket Header Customization */}
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-blue-500" />
                      <h3 className="text-sm font-semibold text-gray-800">
                        Ticket Header Customization
                      </h3>
                    </div>

                    {/* Heading 1 */}
                    <div className="space-y-2">
                      <Label className="flex items-center justify-between text-xs font-medium text-gray-700">
                        <span>Heading 1</span>
                        <span className="text-gray-400">
                          (Max 10-12 characters)
                        </span>
                      </Label>
                      {editing === "heading1" ? (
                        <div className="flex gap-2">
                          <Input
                            value={editValue}
                            onChange={(e) =>
                              setEditValue(e.target.value.slice(0, 12))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                saveEdit("heading1");
                              }
                            }}
                            placeholder="e.g., RAILWAY"
                            maxLength={12}
                            className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => saveEdit("heading1")}
                            className="bg-green-600 hover:bg-green-700 shadow-md"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                            className="shadow-md"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="relative">
                          <Input
                            value={settings.heading1}
                            placeholder="e.g., RAILWAY"
                            readOnly
                            onClick={() =>
                              startEditing("heading1", settings.heading1)
                            }
                            className="cursor-pointer pr-10 hover:bg-gray-50 transition-colors text-sm"
                          />
                          <Edit className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Heading 2 */}
                    <div className="space-y-2">
                      <Label className="flex items-center justify-between text-xs font-medium text-gray-700">
                        <span>Heading 2</span>
                        <span className="text-gray-400">
                          (Max 12-14 characters)
                        </span>
                      </Label>
                      {editing === "heading2" ? (
                        <div className="flex gap-2">
                          <Input
                            value={editValue}
                            onChange={(e) =>
                              setEditValue(e.target.value.slice(0, 14))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                saveEdit("heading2");
                              }
                            }}
                            placeholder="e.g., STATION"
                            maxLength={14}
                            className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => saveEdit("heading2")}
                            className="bg-green-600 hover:bg-green-700 shadow-md"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                            className="shadow-md"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="relative">
                          <Input
                            value={settings.heading2}
                            placeholder="e.g., STATION"
                            readOnly
                            onClick={() =>
                              startEditing("heading2", settings.heading2)
                            }
                            className="cursor-pointer pr-10 hover:bg-gray-50 transition-colors text-sm"
                          />
                          <Edit className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Info 1 */}
                    <div className="space-y-2">
                      <Label className="flex items-center justify-between text-xs font-medium text-gray-700">
                        <span>Info 1</span>
                        <span className="text-gray-400">
                          (Max 14-16 characters)
                        </span>
                      </Label>
                      {editing === "info1" ? (
                        <div className="flex gap-2">
                          <Input
                            value={editValue}
                            onChange={(e) =>
                              setEditValue(e.target.value.slice(0, 16))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                saveEdit("info1");
                              }
                            }}
                            placeholder="e.g., Platform 1"
                            maxLength={16}
                            className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => saveEdit("info1")}
                            className="bg-green-600 hover:bg-green-700 shadow-md"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                            className="shadow-md"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="relative">
                          <Input
                            value={settings.info1}
                            placeholder="e.g., Platform 1"
                            readOnly
                            onClick={() =>
                              startEditing("info1", settings.info1)
                            }
                            className="cursor-pointer pr-10 hover:bg-gray-50 transition-colors text-sm"
                          />
                          <Edit className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Info 2 */}
                    <div className="space-y-2">
                      <Label className="flex items-center justify-between text-xs font-medium text-gray-700">
                        <span>Info 2</span>
                        <span className="text-gray-400">
                          (Max 14-16 characters)
                        </span>
                      </Label>
                      {editing === "info2" ? (
                        <div className="flex gap-2">
                          <Input
                            value={editValue}
                            onChange={(e) =>
                              setEditValue(e.target.value.slice(0, 16))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                saveEdit("info2");
                              }
                            }}
                            placeholder="e.g., Gate 2"
                            maxLength={16}
                            className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => saveEdit("info2")}
                            className="bg-green-600 hover:bg-green-700 shadow-md"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                            className="shadow-md"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="relative">
                          <Input
                            value={settings.info2}
                            placeholder="e.g., Gate 2"
                            readOnly
                            onClick={() =>
                              startEditing("info2", settings.info2)
                            }
                            className="cursor-pointer pr-10 hover:bg-gray-50 transition-colors text-sm"
                          />
                          <Edit className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Note (Footer) */}
                    <div className="space-y-2">
                      <Label className="flex items-center justify-between text-xs font-medium text-gray-700">
                        <span>Note (Footer)</span>
                        <span className="text-gray-400">
                          (Max 16-20 characters)
                        </span>
                      </Label>
                      {editing === "note" ? (
                        <div className="flex gap-2">
                          <Input
                            value={editValue}
                            onChange={(e) =>
                              setEditValue(e.target.value.slice(0, 20))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                saveEdit("note");
                              }
                            }}
                            placeholder="e.g., Thank you!"
                            maxLength={20}
                            className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => saveEdit("note")}
                            className="bg-green-600 hover:bg-green-700 shadow-md"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                            className="shadow-md"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="relative">
                          <Input
                            value={settings.note}
                            placeholder="e.g., Thank you!"
                            readOnly
                            onClick={() => startEditing("note", settings.note)}
                            className="cursor-pointer pr-10 hover:bg-gray-50 transition-colors text-sm"
                          />
                          <Edit className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Placeholder Card */}
            {/* <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b p-4 sm:p-6">
                <CardTitle className="flex items-center text-gray-800 text-lg sm:text-xl">
                  <Train className="w-5 h-5 mr-2 text-green-600" />
                  Quick Info
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  System information and status
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600 mb-1">Admin ID</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {adminId}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-gray-600 mb-1">System Status</p>
                    <p className="text-lg font-semibold text-green-600">
                      Active
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card> */}
          </div>

          {/* Seating Types Section - Full Width */}
          <div className="mt-6 lg:mt-8">
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b p-4 sm:p-6">
                <CardTitle className="flex items-center text-gray-800 text-lg sm:text-xl">
                  <Train className="w-5 h-5 mr-2 text-purple-600" />
                  Seating Types & Pricing
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Manage seating categories and their pricing (2 types)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Seating Type Cards */}
                  {settings.seating_types.map((seatType, index) => {
                    const colors = [
                      { bg: "bg-blue-500", label: "Sitting" },
                      { bg: "bg-orange-500", label: "Sleeper" },
                    ];
                    const color = colors[index];

                    return (
                      <Card
                        key={index}
                        className="border-2 hover:border-blue-300 transition-colors"
                      >
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div
                                  className={`w-3 h-3 rounded-full ${color.bg}`}
                                ></div>
                                <span className="font-semibold text-gray-700">
                                  {color.label}
                                </span>
                              </div>
                              <Badge className="text-xs bg-green-100 text-green-800">
                                Active
                              </Badge>
                            </div>

                            {/* Grace Time */}
                            <div className="space-y-2">
                              <Label className="flex items-center text-xs text-gray-600">
                                <Clock className="w-3 h-3 mr-1" />
                                Grace Time (minutes)
                              </Label>
                              {editing === `grace_${index}` ? (
                                <div className="flex gap-2">
                                  <Input
                                    type="number"
                                    min="0"
                                    value={editValue}
                                    onChange={(e) =>
                                      setEditValue(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        saveSeatingEdit(index, "grace_time");
                                      }
                                    }}
                                    placeholder="0"
                                    className="flex-1 text-sm"
                                  />
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() =>
                                      saveSeatingEdit(index, "grace_time")
                                    }
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={cancelEdit}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="relative">
                                  <Input
                                    value={seatType.grace_time || "0"}
                                    placeholder="0"
                                    readOnly
                                    onClick={() =>
                                      startEditing(
                                        `grace_${index}`,
                                        seatType.grace_time || "0"
                                      )
                                    }
                                    className="cursor-pointer pr-8 text-sm hover:bg-gray-50"
                                  />
                                  <Edit className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                                </div>
                              )}
                            </div>

                            {/* Price Section */}
                            <div className="space-y-2">
                              <Label className="text-xs text-gray-600">
                                Price for Hours (₹)
                              </Label>
                              {index === 1 ? (
                                // Sleeping breakdown: four editable inputs
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {["1-3", "1-6", "1-12", "1-24"].map(
                                    (slot) => (
                                      <div
                                        key={slot}
                                        className="flex items-center gap-2"
                                      >
                                        <span className="w-20 text-sm text-gray-700">
                                          {slot}
                                        </span>
                                        <div className="relative flex-1">
                                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                            ₹
                                          </span>
                                          <Input
                                            type="number"
                                            value={
                                              seatType.breakdown?.[slot] || ""
                                            }
                                            onChange={(e) => {
                                              const newVal = e.target.value;
                                              const updated = {
                                                ...(seatType.breakdown || {}),
                                                [slot]: newVal,
                                              };
                                              // update entire breakdown object
                                              handleSeatingTypeChange(
                                                index,
                                                "breakdown",
                                                updated
                                              );
                                            }}
                                            placeholder="0"
                                            className="pl-7 text-sm"
                                          />
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              ) : (
                                // Sitting: single amount input
                                <>
                                  {editing === `amount_${index}` ? (
                                    <div className="flex gap-2">
                                      <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                          ₹
                                        </span>
                                        <Input
                                          value={editValue}
                                          onChange={(e) =>
                                            setEditValue(e.target.value)
                                          }
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                              e.preventDefault();
                                              saveSeatingEdit(index, "amount");
                                            }
                                          }}
                                          placeholder="0"
                                          type="number"
                                          className="pl-7 text-sm"
                                        />
                                      </div>
                                      <Button
                                        type="button"
                                        size="sm"
                                        onClick={() =>
                                          saveSeatingEdit(index, "amount")
                                        }
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <Check className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={cancelEdit}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="relative">
                                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                        ₹
                                      </span>
                                      <Input
                                        value={seatType.amount}
                                        placeholder="0"
                                        readOnly
                                        onClick={() =>
                                          startEditing(
                                            `amount_${index}`,
                                            seatType.amount
                                          )
                                        }
                                        className="cursor-pointer pl-7 pr-8 text-sm hover:bg-gray-50"
                                      />
                                      <Edit className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Enable/Disable Advance Payment */}
          {/* <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-purple-100">
                <span className="text-purple-700">%</span>
              </Badge>
              <div>
                <Label className="text-sm font-medium text-gray-800">
                  Enable Discount
                </Label>
                <p className="text-xs text-gray-600 mt-1">
                  Allow discounts on bookings
                </p>
              </div>
            </div>
            <Switch
              checked={settings.discount_enabled}
              onCheckedChange={(checked) => {
                // Only update local state until Save All is clicked
                handleSettingChange("discount_enabled", checked);
              }}
              className="data-[state=checked]:bg-purple-600"
            />
          </div> */}
          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={resetToDefaults}
              className="px-6 shadow-md hover:shadow-lg transition-shadow"
              disabled={saving}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 shadow-md hover:shadow-lg transition-all"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save All Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
