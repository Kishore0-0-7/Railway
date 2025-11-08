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
  });

  // Editing state for inline editing
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Get admin_id from localStorage
  const adminId = localStorage.getItem("adminId") || "";

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
    // Validation
    if (!settings.admin_name.trim()) {
      toast.error("Admin name is required");
      return;
    }
    if (!settings.hall_name.trim()) {
      toast.error("Hall name is required");
      return;
    }

    try {
      setSaving(true);

      // Prepare data for API
      const apiData = {
        admin_name: settings.admin_name,
        hall_name: settings.hall_name,
        // If type is disabled, send null regardless of name/amount
        // If type is enabled, send name/amount (or null if not set)
        type1: settings.seating_types[0].enabled ? (settings.seating_types[0].name || null) : null,
        type1_amount: settings.seating_types[0].enabled && settings.seating_types[0].amount
          ? parseFloat(settings.seating_types[0].amount)
          : null,
        type2: settings.seating_types[1].enabled ? (settings.seating_types[1].name || null) : null,
        type2_amount: settings.seating_types[1].enabled && settings.seating_types[1].amount
          ? parseFloat(settings.seating_types[1].amount)
          : null,
        type3: null,
        type3_amount: null,
        type4: null,
        type4_amount: null,
      };

      await settingsAPI.upsertSettings(adminId, apiData);
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
    // Update local state first for immediate feedback
    setSettings((prev) => {
      const newSeatingTypes = [...prev.seating_types];
      newSeatingTypes[index] = {
        ...newSeatingTypes[index],
        [field]: value,
      };
      return {
        ...prev,
        seating_types: newSeatingTypes,
      };
    });

    // Save drafts locally 
    const drafts = loadDrafts();
    drafts[index] = {
      ...drafts[index],
      [field]: value
    };
    saveDrafts(drafts);

    try {
      // Prepare API data
      const apiData = {
        admin_name: settings.admin_name,
        hall_name: settings.hall_name,
        type1: settings.seating_types[0].enabled ? settings.seating_types[0].name : null,
        type1_amount: settings.seating_types[0].enabled && settings.seating_types[0].amount
          ? parseFloat(settings.seating_types[0].amount)
          : null,
        type2: settings.seating_types[1].enabled ? settings.seating_types[1].name : null,
        type2_amount: settings.seating_types[1].enabled && settings.seating_types[1].amount
          ? parseFloat(settings.seating_types[1].amount)
          : null,
        type3: null,
        type3_amount: null,
        type4: null,
        type4_amount: null,
      };

      await settingsAPI.upsertSettings(adminId, apiData);
      toast.success("Settings saved successfully");

      // Refresh settings from server
      await fetchSettings();
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");

      // Refresh to ensure we're in sync with server
      await fetchSettings();
    }
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
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
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
                  <div className="space-y-2">
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
                          placeholder="Enter admin name"
                          className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        />
                        <Button
                          size="sm"
                          onClick={() => saveEdit("admin_name")}
                          className="bg-green-600 hover:bg-green-700 shadow-md"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
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
                  </div>

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
                          placeholder="Enter hall name"
                          className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        />
                        <Button
                          size="sm"
                          onClick={() => saveEdit("hall_name")}
                          className="bg-green-600 hover:bg-green-700 shadow-md"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
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
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
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
            </Card>
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
                              <Switch
                                checked={seatType.enabled}
                                onCheckedChange={(checked) => {
                                  // Only update enabled state, preserve name/amount
                                  setSettings(prev => {
                                    const newSeatingTypes = [...prev.seating_types];
                                    newSeatingTypes[index] = {
                                      ...newSeatingTypes[index],
                                      enabled: checked
                                    };
                                    return {
                                      ...prev,
                                      seating_types: newSeatingTypes
                                    };
                                  });
                                }}
                                className="data-[state=checked]:bg-green-600 scale-75"
                              />
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
                                      placeholder="e.g. Sitting"
                                      className="flex-1 text-sm"
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        saveSeatingEdit(index, "name")
                                      }
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <Check className="h-3 w-3" />
                                    </Button>
                                    <Button
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
                                        placeholder="0"
                                        type="number"
                                        className="pl-7 text-sm"
                                      />
                                    </div>
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        saveSeatingEdit(index, "amount")
                                      }
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <Check className="h-3 w-3" />
                                    </Button>
                                    <Button
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
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 mt-6">
            <Button
              variant="outline"
              onClick={fetchSettings}
              className="px-6 shadow-md hover:shadow-lg transition-shadow"
              disabled={saving}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
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
