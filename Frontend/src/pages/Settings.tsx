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
  CreditCard,
  Train,
  DollarSign,
  Percent,
  Save,
  RotateCcw,
  Zap,
} from "lucide-react";
import {
  getRailwaySettings,
  saveRailwaySettings,
  type RailwaySettings,
} from "@/lib/settingsUtils";

const Settings = () => {
  // Settings state using utility functions
  const [settings, setSettings] = useState<RailwaySettings>(() =>
    getRailwaySettings()
  );

  // Editing state for inline editing
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    // Load settings from localStorage using utility function
    const loadedSettings = getRailwaySettings();
    setSettings(loadedSettings);
  }, []);

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    // Save to localStorage using utility function
    saveRailwaySettings(newSettings);

    toast.success("Setting updated successfully");
  };

  const handleSave = () => {
    // Save all settings
    localStorage.setItem("railwaySettings", JSON.stringify(settings));
    toast.success("All settings saved successfully");
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

  const handleSeatingTypeChange = (
    seatType: string,
    field: string,
    value: any
  ) => {
    const newSettings = {
      ...settings,
      seating_types: {
        ...settings.seating_types,
        [seatType]: {
          ...settings.seating_types[
            seatType as keyof typeof settings.seating_types
          ],
          [field]: value,
        },
      },
    };
    setSettings(newSettings);
    localStorage.setItem("railwaySettings", JSON.stringify(newSettings));
    toast.success("Seating type updated successfully");
  };

  const saveSeatingEdit = (seatType: string, field: string) => {
    if (editValue.trim() !== "") {
      handleSeatingTypeChange(seatType, field, editValue.trim());
      setEditing(null);
      setEditValue("");
    }
  };

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
                          placeholder="e.g. #1225"
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
                          placeholder="e.g. #1225"
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

                  {/* Admin Contact */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="admin_contact"
                      className="flex items-center text-sm font-medium text-gray-700"
                    >
                      <Building className="w-4 h-4 mr-2 text-purple-500" />
                      Admin Contact
                    </Label>
                    {editing === "admin_contact" ? (
                      <div className="flex gap-2">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="Enter contact number"
                          className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        />
                        <Button
                          size="sm"
                          onClick={() => saveEdit("admin_contact")}
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
                          value={settings.admin_contact}
                          placeholder="Enter contact number"
                          readOnly
                          onClick={() =>
                            startEditing(
                              "admin_contact",
                              settings.admin_contact
                            )
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

            {/* Payment Settings Card */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b p-4 sm:p-6">
                <CardTitle className="flex items-center text-gray-800 text-lg sm:text-xl">
                  <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                  Payment Settings
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Configure advance payment options
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-6">
                  {/* Enable Advance Payment Toggle */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                    <div className="space-y-1">
                      <Label className="text-sm font-semibold text-gray-800 flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                        Enable Advance Payment
                      </Label>
                      <p className="text-xs text-gray-600">
                        Allow customers to make advance payments for bookings
                      </p>
                    </div>
                    <Switch
                      checked={settings.advance_payment_enabled}
                      onCheckedChange={(checked) =>
                        handleSettingChange("advance_payment_enabled", checked)
                      }
                      className="data-[state=checked]:bg-green-600"
                    />
                  </div>

                  {/* Default Advance Percentage */}
                  {settings.advance_payment_enabled && (
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
                      <Label className="flex items-center text-sm font-medium text-gray-700">
                        <Percent className="w-4 h-4 mr-2 text-green-500" />
                        Default Advance Percentage
                      </Label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            Percentage of ticket price to collect as advance
                            payment
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>Range: 0-100%</span>
                          </div>
                        </div>
                        {/* Quick Preset Buttons */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-gray-500">
                            Quick presets:
                          </span>
                          {[10, 20, 25, 30, 50].map((preset) => (
                            <Button
                              key={preset}
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleSettingChange(
                                  "default_advance_percentage",
                                  preset.toString()
                                )
                              }
                              className={`px-2 py-1 text-xs h-6 ${
                                settings.default_advance_percentage ===
                                preset.toString()
                                  ? "bg-green-100 border-green-300 text-green-700"
                                  : "hover:bg-gray-100"
                              }`}
                            >
                              {preset}%
                            </Button>
                          ))}
                        </div>
                      </div>
                      {editing === "default_advance_percentage" ? (
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input
                              value={editValue}
                              onChange={(e) => {
                                const value = e.target.value;
                                // Ensure value is between 0 and 100
                                if (
                                  value === "" ||
                                  (Number(value) >= 0 && Number(value) <= 100)
                                ) {
                                  setEditValue(value);
                                }
                              }}
                              placeholder="20"
                              type="number"
                              min="0"
                              max="100"
                              className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-green-500 pr-10"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                              %
                            </span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() =>
                              saveEdit("default_advance_percentage")
                            }
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
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input
                              value={`${settings.default_advance_percentage}%`}
                              readOnly
                              onClick={() =>
                                startEditing(
                                  "default_advance_percentage",
                                  settings.default_advance_percentage
                                )
                              }
                              className="cursor-pointer pr-10 hover:bg-white transition-colors"
                            />
                            <Edit className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      )}
                      <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-blue-800">
                            Advance Payment Examples:
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                            <div>
                              ₹50 ticket → ₹
                              {Math.round(
                                (Number(settings.default_advance_percentage) /
                                  100) *
                                  50
                              )}{" "}
                              advance
                            </div>
                            <div>
                              ₹100 ticket → ₹
                              {Math.round(
                                (Number(settings.default_advance_percentage) /
                                  100) *
                                  100
                              )}{" "}
                              advance
                            </div>
                            <div>
                              ₹200 ticket → ₹
                              {Math.round(
                                (Number(settings.default_advance_percentage) /
                                  100) *
                                  200
                              )}{" "}
                              advance
                            </div>
                            <div>
                              ₹500 ticket → ₹
                              {Math.round(
                                (Number(settings.default_advance_percentage) /
                                  100) *
                                  500
                              )}{" "}
                              advance
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
                  Manage seating categories and their pricing
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Seating Type Cards */}
                  {[
                    { key: "sitting", label: "Sitting", color: "bg-blue-500" },
                    {
                      key: "sitting_ac",
                      label: "Sitting AC",
                      color: "bg-cyan-500",
                    },
                    {
                      key: "sleeper",
                      label: "Sleeper",
                      color: "bg-orange-500",
                    },
                    {
                      key: "sleeper_ac",
                      label: "Sleeper AC",
                      color: "bg-red-500",
                    },
                  ].map((seatType) => (
                    <Card
                      key={seatType.key}
                      className="border-2 hover:border-blue-300 transition-colors"
                    >
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          {/* Header with status */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div
                                className={`w-3 h-3 ${seatType.color} rounded-full`}
                              ></div>
                              <span className="font-semibold text-gray-800 text-sm">
                                {seatType.label}
                              </span>
                            </div>
                            <Switch
                              checked={
                                settings.seating_types[
                                  seatType.key as keyof typeof settings.seating_types
                                ].enabled
                              }
                              onCheckedChange={(checked) =>
                                handleSeatingTypeChange(
                                  seatType.key,
                                  "enabled",
                                  checked
                                )
                              }
                              className="data-[state=checked]:bg-green-600 scale-75"
                            />
                          </div>

                          {/* Price Section */}
                          <div className="space-y-2">
                            <Label className="text-xs text-gray-500">
                              Price (₹)
                            </Label>
                            <div className="flex items-center space-x-2">
                              {editing === `${seatType.key}_amount` ? (
                                <div className="flex gap-1 w-full">
                                  <Input
                                    value={editValue}
                                    onChange={(e) =>
                                      setEditValue(e.target.value)
                                    }
                                    type="number"
                                    className="text-sm flex-1"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      saveSeatingEdit(seatType.key, "amount")
                                    }
                                    className="bg-green-600 hover:bg-green-700 p-2"
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={cancelEdit}
                                    className="p-2"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between w-full">
                                  <span className="font-bold text-green-600 text-lg">
                                    ₹
                                    {
                                      settings.seating_types[
                                        seatType.key as keyof typeof settings.seating_types
                                      ].amount
                                    }
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      startEditing(
                                        `${seatType.key}_amount`,
                                        settings.seating_types[
                                          seatType.key as keyof typeof settings.seating_types
                                        ].amount
                                      )
                                    }
                                    className="p-1 hover:bg-blue-50"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="pt-2 border-t">
                            <Badge
                              variant={
                                settings.seating_types[
                                  seatType.key as keyof typeof settings.seating_types
                                ].enabled
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {settings.seating_types[
                                seatType.key as keyof typeof settings.seating_types
                              ].enabled
                                ? "Active"
                                : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 mt-6">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="px-6 shadow-md hover:shadow-lg transition-shadow"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 shadow-md hover:shadow-lg transition-all"
            >
              <Save className="w-4 h-4 mr-2" />
              Save All Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
