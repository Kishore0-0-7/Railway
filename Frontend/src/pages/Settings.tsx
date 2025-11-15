import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
} from "lucide-react";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { settingsAPI } from "@/services/api";
import { clearSettingsCache } from "@/lib/settingsUtils";
import { getAdminId } from "@/lib/cookieUtils";

interface SeatingType {
  name: string;
  amount: string;
  enabled: boolean;
}

interface SettingsData {
  admin_id: string;
  admin_name: string;
  hall_name: string;
  seating_types: SeatingType[];
  advance_payment_enabled: boolean;
  discount_enabled: boolean;
  discount_percentage: number;
  default_advance_percentage: string;
}

const Settings = () => {
  // Scroll to top on route change
  useScrollToTop();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    admin_id: "",
    admin_name: "",
    hall_name: "",
    seating_types: [
      { name: "", amount: "", enabled: true },
      { name: "", amount: "", enabled: true },
    ],
    advance_payment_enabled: true,
    discount_enabled: false,
    discount_percentage: 0,
    default_advance_percentage: "20",
  });

  // Editing state for inline editing
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Get admin_id from cookies
  const adminId = getAdminId() || "";

  // Persist unsaved seating type names/amounts locally so toggling off/on
  // doesn't permanently lose previously entered values even if the server
  // clears them when a type is disabled.
  const DRAFTS_KEY = "seatingTypeDrafts";

  const loadDrafts = (): Array<{ name?: string; amount?: string }> => {
    try {
      const raw = localStorage.getItem(DRAFTS_KEY);
      if (!raw) return [];
      return JSON.parse(raw) || [];
    } catch {
      return [];
    }
  };

  const saveDrafts = (drafts: Array<{ name?: string; amount?: string }>) => {
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
        const seatingTypes: SeatingType[] = [
          {
            // if server has a value use it, otherwise fall back to draft so
            // toggling off/on preserves previously entered values
            name: data.type1 || drafts[0]?.name || "",
            amount: data.type1_amount?.toString() || drafts[0]?.amount || "",
            enabled: !!data.type1,
          },
          {
            name: data.type2 || drafts[1]?.name || "",
            amount: data.type2_amount?.toString() || drafts[1]?.amount || "",
            enabled: !!data.type2,
          },
        ];

        setSettings({
          admin_id: data.admin_id,
          admin_name: data.admin_name,
          hall_name: data.hall_name,
          seating_types: seatingTypes,
          advance_payment_enabled: data.advance_payment_enabled ?? true,
          discount_enabled: data.discount_enabled ?? false,
          discount_percentage: data.discount_percentage ?? 0,
          default_advance_percentage:
            data.default_advance_percentage?.toString() || "20",
        });
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

  const handleSave = async () => {
    // Validation - hall_name is required. admin_name will fall back to localStorage if missing.
    if (!settings.hall_name.trim()) {
      toast.error("Hall name is required");
      return;
    }

    try {
      setSaving(true);

      // Prepare data for API
      // Ensure we always send an admin_name because backend requires it.
      const payloadAdminName =
        (settings.admin_name && settings.admin_name.trim()) ||
        localStorage.getItem("adminName") ||
        localStorage.getItem("email") ||
        adminId ||
        "Admin";

      const apiData = {
        admin_name: payloadAdminName,
        hall_name: settings.hall_name,
        // If type is disabled, send null regardless of name/amount
        // If type is enabled, send name/amount (or null if not set)
        type1: settings.seating_types[0].enabled
          ? settings.seating_types[0].name || null
          : null,
        type1_amount:
          settings.seating_types[0].enabled && settings.seating_types[0].amount
            ? parseFloat(settings.seating_types[0].amount)
            : null,
        type2: settings.seating_types[1].enabled
          ? settings.seating_types[1].name || null
          : null,
        type2_amount:
          settings.seating_types[1].enabled && settings.seating_types[1].amount
            ? parseFloat(settings.seating_types[1].amount)
            : null,
        type3: null,
        type3_amount: null,
        type4: null,
        type4_amount: null,
        advance_payment_enabled: settings.advance_payment_enabled,
        default_advance_percentage:
          parseFloat(settings.default_advance_percentage) || 20,
      };

      await settingsAPI.upsertSettings(adminId, apiData);

      // Update localStorage for settings utils
      const railwaySettings = {
        admin_name: payloadAdminName,
        admin_email: localStorage.getItem("email") || "admin@railway.com",
        admin_contact: localStorage.getItem("adminPhone") || "+91-9876543210",
        seating_types: {
          sitting: {
            amount:
              settings.seating_types[0].enabled &&
                settings.seating_types[0].amount
                ? settings.seating_types[0].amount
                : "15",
            enabled: settings.seating_types[0].enabled,
          },
          sleeper: {
            amount:
              settings.seating_types[1].enabled &&
                settings.seating_types[1].amount
                ? settings.seating_types[1].amount
                : "20",
            enabled: settings.seating_types[1].enabled,
          },
        },
        advance_payment_enabled: settings.advance_payment_enabled,
        default_advance_percentage: settings.default_advance_percentage,
      };
      localStorage.setItem("railwaySettings", JSON.stringify(railwaySettings));

      // Clear settings cache to force refresh on next access
      clearSettingsCache();

      toast.success("Settings saved successfully");

      // Refresh settings from database
      await fetchSettings();
    } catch (error) {
      console.error("Error saving settings:", error);
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

  const handleSeatingTypeChange = async (
    index: number,
    field: string,
    value: any
  ) => {
    // Update local state using the previous state (avoid closure staleness)
    setSettings((prev) => {
      const updatedSeatingTypes = prev.seating_types.map((st, i) =>
        i === index ? { ...st, [field]: value } : st
      );

      // Persist drafts locally based on updated seating types
      try {
        const drafts = loadDrafts();
        drafts[index] = {
          ...drafts[index],
          [field]: value,
        };
        saveDrafts(drafts);
      } catch (e) {
        // ignore localStorage errors
      }

      // Fire-and-forget API call outside the synchronous setState
      (async () => {
        try {
          // Ensure admin_name fallback (same as Save All)
          const payloadAdminName =
            (prev.admin_name && prev.admin_name.trim()) ||
            localStorage.getItem("adminName") ||
            localStorage.getItem("email") ||
            adminId ||
            "Admin";

          const apiData = {
            admin_name: payloadAdminName,
            hall_name: prev.hall_name,
            type1: updatedSeatingTypes[0].enabled
              ? updatedSeatingTypes[0].name || null
              : null,
            type1_amount:
              updatedSeatingTypes[0].enabled && updatedSeatingTypes[0].amount
                ? parseFloat(updatedSeatingTypes[0].amount)
                : null,
            type2: updatedSeatingTypes[1].enabled
              ? updatedSeatingTypes[1].name || null
              : null,
            type2_amount:
              updatedSeatingTypes[1].enabled && updatedSeatingTypes[1].amount
                ? parseFloat(updatedSeatingTypes[1].amount)
                : null,
            type3: null,
            type3_amount: null,
            type4: null,
            type4_amount: null,
          };

          await settingsAPI.upsertSettings(adminId, apiData);
          toast.success("Settings saved successfully");

          // Also update railwaySettings in localStorage so other UI can read new values
          try {
            const railwaySettings = {
              admin_name: payloadAdminName,
              admin_email: localStorage.getItem("email") ||
                "admin@railway.com",
              admin_contact:
                localStorage.getItem("adminPhone") || "+91-9876543210",
              seating_types: {
                sitting: {
                  amount:
                    updatedSeatingTypes[0].enabled &&
                      updatedSeatingTypes[0].amount
                      ? updatedSeatingTypes[0].amount
                      : "15",
                  enabled: updatedSeatingTypes[0].enabled,
                },
                sleeper: {
                  amount:
                    updatedSeatingTypes[1].enabled &&
                      updatedSeatingTypes[1].amount
                      ? updatedSeatingTypes[1].amount
                      : "20",
                  enabled: updatedSeatingTypes[1].enabled,
                },
              },
              advance_payment_enabled: prev.advance_payment_enabled,
              default_advance_percentage: prev.default_advance_percentage,
            };
            localStorage.setItem("railwaySettings", JSON.stringify(railwaySettings));
          } catch (e) {
            // ignore storage errors
          }

          // NOTE: intentionally avoid calling fetchSettings() here.
          // Calling fetchSettings() immediately after upsert can trigger
          // the global axios 401 handler (which redirects the page).
          // We already updated local state above, so skip the extra GET
          // to prevent unexpected page reloads.
        } catch (error) {
          console.error("Failed to save settings:", error);
          toast.error("Failed to save settings");
          // Do not call fetchSettings() here to avoid triggering global redirect
        }
      })();

      return { ...prev, seating_types: updatedSeatingTypes } as SettingsData;
    });
  };

  const saveSeatingEdit = (index: number, field: string) => {
    if (editValue.trim() !== "") {
      handleSeatingTypeChange(index, field, editValue.trim());
      setEditing(null);
      setEditValue("");
    }
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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
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
                  {/* Admin Name */}
                  {/* <div className="space-y-2">
                    <Label
                      htmlFor="admin_name"
                      className="flex items-center text-sm font-medium text-gray-700"
                    >
                      <User className="w-4 h-4 mr-2 text-blue-500" />
                      Admin Name
                    </Label>
                    {editing === "admin_name" ? (
                      <div className="flex gap-2">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              saveEdit("admin_name");
                            }
                          }}
                          placeholder="Enter admin name"
                          className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => saveEdit("admin_name")}
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
                          value={settings.admin_name}
                          placeholder="Enter admin name"
                          readOnly
                          onClick={() =>
                            startEditing("admin_name", settings.admin_name)
                          }
                          className="cursor-pointer pr-10 hover:bg-gray-50 transition-colors"
                        />
                        <Edit className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div> */}

                  {/* Hall Name */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="hall_name"
                      className="flex items-center text-sm font-medium text-gray-700"
                    >
                      <Building className="w-4 h-4 mr-2 text-purple-500" />
                      Hall Name
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
                      { bg: "bg-blue-500", label: "Type 1" },
                      { bg: "bg-orange-500", label: "Type 2" },
                      { bg: "bg-green-500", label: "Type 3" },
                      { bg: "bg-purple-500", label: "Type 4" },
                    ];
                    const color = colors[index];

                    return (
                      <Card
                        key={index}
                        className="border-2 hover:border-blue-300 transition-colors"
                      >
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            {/* Header with status */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div
                                  className={`w-3 h-3 rounded-full ${color.bg}`}
                                ></div>
                                <span className="font-semibold text-gray-700">
                                  {color.label}
                                </span>
                              </div>
                              <button
                                type="button"
                                className="-m-1 p-1 z-50 inline-flex rounded focus:outline-none cursor-pointer pointer-events-auto relative"
                                aria-pressed={seatType.enabled}
                                onClick={(e) => {
                                  // Use type="button" to avoid implicit form submit even if inside a form.
                                  e.stopPropagation();
                                  const newVal = !seatType.enabled;
                                  handleSeatingTypeChange(index, "enabled", newVal);
                                  if (!newVal) setEditing(null);
                                }}
                              >
                                {/* Custom lightweight toggle to avoid third-party internal behavior */}
                                <div
                                  role="switch"
                                  aria-checked={seatType.enabled}
                                  aria-label={`Toggle seating type ${index + 1}`}
                                  className={`w-10 h-6 rounded-full p-1 transition-colors flex items-center cursor-pointer ${seatType.enabled ? "bg-green-600" : "bg-gray-300"
                                    }`}
                                >
                                  <div
                                    className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${seatType.enabled ? "translate-x-4" : "translate-x-0"
                                      }`}
                                  />
                                </div>
                              </button>
                            </div>

                            {/* Seating Type Name */}
                            {seatType.enabled && (
                              <div className="space-y-2">
                                <Label className="text-xs text-gray-600">
                                  Seating Type Name
                                </Label>
                                {editing === `name_${index}` ? (
                                  <div className="flex gap-2">
                                    <Input
                                      value={editValue}
                                      onChange={(e) =>
                                        setEditValue(e.target.value)
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault();
                                          saveSeatingEdit(index, "name");
                                        }
                                      }}
                                      placeholder="e.g. Sitting"
                                      className="flex-1 text-sm"
                                    />
                                    <Button
                                      type="button"
                                      size="sm"
                                      onClick={() =>
                                        saveSeatingEdit(index, "name")
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
                                      value={seatType.name}
                                      placeholder="e.g. Sitting"
                                      readOnly
                                      onClick={() =>
                                        startEditing(
                                          `name_${index}`,
                                          seatType.name
                                        )
                                      }
                                      className="cursor-pointer pr-8 text-sm hover:bg-gray-50"
                                    />
                                    <Edit className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Price Section */}
                            {seatType.enabled && (
                              <div className="space-y-2">
                                <Label className="text-xs text-gray-600">
                                  Price per Hour (₹)
                                </Label>
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
                              </div>
                            )}

                            {/* Status Badge */}
                            <div className="pt-2 border-t">
                              <Badge
                                variant={
                                  seatType.enabled ? "default" : "secondary"
                                }
                                className="text-xs"
                              >
                                {seatType.enabled ? "Active" : "Disabled"}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Advance Payment Settings */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 mt-8">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b p-4 sm:p-6">
                <CardTitle className="flex items-center text-gray-800 text-lg sm:text-xl">
                  <Zap className="w-5 h-5 mr-2 text-purple-600" />
                  Advance Payment Settings
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Configure advance payment options for bookings
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-6">
                  {/* Enable/Disable Advance Payment */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-3">
                      <Zap className="w-5 h-5 text-purple-600" />
                      <div>
                        <Label className="text-sm font-medium text-gray-800">
                          Enable Advance Payment
                        </Label>
                        <p className="text-xs text-gray-600 mt-1">
                          Allow customers to pay advance amount for bookings
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.advance_payment_enabled}
                      onCheckedChange={(checked) =>
                        handleSettingChange("advance_payment_enabled", checked)
                      }
                    />
                  </div>

                  {/* Advance Percentage Options */}
                  {settings.advance_payment_enabled && (
                    <div className="space-y-4">
                      <Label className="text-sm font-medium text-gray-700">
                        Select Advance Percentage
                      </Label>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {["10", "20", "25", "30", "40", "50"].map(
                          (percentage) => (
                            <div
                              key={percentage}
                              className={`p-2 rounded-md border cursor-pointer transition-all text-center ${settings.default_advance_percentage ===
                                percentage
                                ? "border-purple-500 bg-purple-50"
                                : "border-gray-200 hover:border-purple-300"
                                }`}
                              onClick={() =>
                                handleSettingChange(
                                  "default_advance_percentage",
                                  percentage
                                )
                              }
                            >
                              <div className="flex items-center justify-center space-x-1">
                                <div
                                  className={`w-3 h-3 rounded-full border ${settings.default_advance_percentage ===
                                    percentage
                                    ? "border-purple-500 bg-purple-500"
                                    : "border-gray-300"
                                    }`}
                                >
                                  {settings.default_advance_percentage ===
                                    percentage && (
                                      <div className="w-1.5 h-1.5 bg-white rounded-full m-0.5"></div>
                                    )}
                                </div>
                                <p className="text-sm font-medium text-gray-800">
                                  {percentage}%
                                </p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Custom Percentage Input */}
                  {settings.advance_payment_enabled && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Default Advance Percentage (%)
                      </Label>
                      {editing === "advance_percentage" ? (
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  saveEdit("default_advance_percentage");
                                }
                              }}
                              placeholder="e.g. 20"
                              className="pr-8"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                              %
                            </span>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() =>
                              saveEdit("default_advance_percentage")
                            }
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="relative">
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                            %
                          </span>
                          <Input
                            value={settings.default_advance_percentage}
                            placeholder="20"
                            readOnly
                            onClick={() =>
                              startEditing(
                                "advance_percentage",
                                settings.default_advance_percentage
                              )
                            }
                            className="cursor-pointer pr-8 hover:bg-gray-50 transition-colors"
                          />
                          <Edit className="absolute right-8 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Enter any custom percentage between 0-100%
                      </p>
                    </div>
                  )}

                  {/* Advance Payment Preview */}
                  {settings.advance_payment_enabled && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <h4 className="text-sm font-medium text-green-800 mb-2">
                        Preview Example
                      </h4>
                      <div className="text-xs text-green-700">
                        <p>• Total booking amount: ₹100</p>
                        <p>
                          • Advance payment (
                          {settings.default_advance_percentage}%): ₹
                          {(
                            (100 *
                              parseFloat(
                                settings.default_advance_percentage || "0"
                              )) /
                            100
                          ).toFixed(0)}
                        </p>
                        <p>
                          • Remaining amount: ₹
                          {(
                            100 -
                            (100 *
                              parseFloat(
                                settings.default_advance_percentage || "0"
                              )) /
                            100
                          ).toFixed(0)}
                        </p>
                      </div>
                    </div>
                  )}
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
              onClick={fetchSettings}
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
