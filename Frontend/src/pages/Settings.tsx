import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Edit, Check, X } from "lucide-react";

const Settings = () => {
  // Settings state - updated based on the new design
  const [settings, setSettings] = useState({
    admin_name: "#1225",
    hall_name: "",
    // Seating types with amounts and enabled status
    seating_types: {
      sitting: {
        enabled: true,
        amount: "25",
      },
      sitting_ac: {
        enabled: false,
        amount: "25",
      },
      sleeper: {
        enabled: true,
        amount: "50",
      },
      sleeper_ac: {
        enabled: false,
        amount: "50",
      },
    },
    // Advance payment settings
    advance_payment_enabled: true,
    default_advance_amount: "100",
  });

  // Editing state for inline editing
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("railwaySettings");
    if (savedSettings) {
      setSettings({ ...settings, ...JSON.parse(savedSettings) });
    }
  }, []);

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    // Save to localStorage
    localStorage.setItem("railwaySettings", JSON.stringify(newSettings));

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
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
          {/* Admin Name and Hall Name Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Name
              </label>
              {editing === "admin_name" ? (
                <div className="flex gap-2">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="e.g. #1225"
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={() => saveEdit("admin_name")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEdit}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Input
                  value={settings.admin_name}
                  placeholder="e.g. #1225"
                  readOnly
                  onClick={() =>
                    startEditing("admin_name", settings.admin_name)
                  }
                  className="cursor-pointer"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hall Name
              </label>
              {editing === "hall_name" ? (
                <div className="flex gap-2">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="Enter hall name"
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={() => saveEdit("hall_name")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEdit}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Input
                  value={settings.hall_name}
                  placeholder="Enter hall name"
                  readOnly
                  onClick={() => startEditing("hall_name", settings.hall_name)}
                  className="cursor-pointer"
                />
              )}
            </div>
          </div>

          {/* Advance Payment Settings */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Advance Payment Settings
            </h3>

            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Enable Advance Payment
                </label>
                <p className="text-xs text-gray-500">
                  Allow customers to make advance payments
                </p>
              </div>
              <Switch
                checked={settings.advance_payment_enabled}
                onCheckedChange={(checked) =>
                  handleSettingChange("advance_payment_enabled", checked)
                }
              />
            </div>

            {settings.advance_payment_enabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Advance Amount (₹)
                </label>
                {editing === "default_advance_amount" ? (
                  <div className="flex gap-2">
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder="100"
                      type="number"
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={() => saveEdit("default_advance_amount")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={`₹${settings.default_advance_amount}`}
                      readOnly
                      onClick={() =>
                        startEditing(
                          "default_advance_amount",
                          settings.default_advance_amount
                        )
                      }
                      className="cursor-pointer flex-1"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        startEditing(
                          "default_advance_amount",
                          settings.default_advance_amount
                        )
                      }
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Seating Types Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Seating Types
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {/* Headers */}
              <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wide pb-2 border-b">
                <div className="col-span-4">Type</div>
                <div className="col-span-3">Amount</div>
                <div className="col-span-2">Enabled</div>
                <div className="col-span-3">Actions</div>
              </div>

              {/* Sitting */}
              <div className="grid grid-cols-12 gap-4 items-center py-3 border-b border-gray-100">
                <div className="col-span-4">
                  <Input value="Sitting" readOnly className="bg-gray-50" />
                </div>
                <div className="col-span-3">
                  {editing === "sitting_amount" ? (
                    <div className="flex gap-1">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        type="number"
                        className="text-sm"
                      />
                    </div>
                  ) : (
                    <Input
                      value={`₹${settings.seating_types.sitting.amount}`}
                      readOnly
                      onClick={() =>
                        startEditing(
                          "sitting_amount",
                          settings.seating_types.sitting.amount
                        )
                      }
                      className="cursor-pointer"
                    />
                  )}
                </div>
                <div className="col-span-2">
                  <Switch
                    checked={settings.seating_types.sitting.enabled}
                    onCheckedChange={(checked) =>
                      handleSeatingTypeChange("sitting", "enabled", checked)
                    }
                    className={
                      settings.seating_types.sitting.enabled ? "bg-red-500" : ""
                    }
                  />
                </div>
                <div className="col-span-3 flex gap-2">
                  {editing === "sitting_amount" ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => saveSeatingEdit("sitting", "amount")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        startEditing(
                          "sitting_amount",
                          settings.seating_types.sitting.amount
                        )
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Sitting AC */}
              <div className="grid grid-cols-12 gap-4 items-center py-3 border-b border-gray-100">
                <div className="col-span-4">
                  <Input value="Sitting AC" readOnly className="bg-gray-50" />
                </div>
                <div className="col-span-3">
                  {editing === "sitting_ac_amount" ? (
                    <div className="flex gap-1">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        type="number"
                        className="text-sm"
                      />
                    </div>
                  ) : (
                    <Input
                      value={`₹${settings.seating_types.sitting_ac.amount}`}
                      readOnly
                      onClick={() =>
                        startEditing(
                          "sitting_ac_amount",
                          settings.seating_types.sitting_ac.amount
                        )
                      }
                      className="cursor-pointer"
                    />
                  )}
                </div>
                <div className="col-span-2">
                  <Switch
                    checked={settings.seating_types.sitting_ac.enabled}
                    onCheckedChange={(checked) =>
                      handleSeatingTypeChange("sitting_ac", "enabled", checked)
                    }
                  />
                </div>
                <div className="col-span-3 flex gap-2">
                  {editing === "sitting_ac_amount" ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => saveSeatingEdit("sitting_ac", "amount")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        startEditing(
                          "sitting_ac_amount",
                          settings.seating_types.sitting_ac.amount
                        )
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Sleeper */}
              <div className="grid grid-cols-12 gap-4 items-center py-3 border-b border-gray-100">
                <div className="col-span-4">
                  <Input value="Sleeper" readOnly className="bg-gray-50" />
                </div>
                <div className="col-span-3">
                  {editing === "sleeper_amount" ? (
                    <div className="flex gap-1">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        type="number"
                        className="text-sm"
                      />
                    </div>
                  ) : (
                    <Input
                      value={`₹${settings.seating_types.sleeper.amount}`}
                      readOnly
                      onClick={() =>
                        startEditing(
                          "sleeper_amount",
                          settings.seating_types.sleeper.amount
                        )
                      }
                      className="cursor-pointer"
                    />
                  )}
                </div>
                <div className="col-span-2">
                  <Switch
                    checked={settings.seating_types.sleeper.enabled}
                    onCheckedChange={(checked) =>
                      handleSeatingTypeChange("sleeper", "enabled", checked)
                    }
                    className={
                      settings.seating_types.sleeper.enabled ? "bg-red-500" : ""
                    }
                  />
                </div>
                <div className="col-span-3 flex gap-2">
                  {editing === "sleeper_amount" ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => saveSeatingEdit("sleeper", "amount")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        startEditing(
                          "sleeper_amount",
                          settings.seating_types.sleeper.amount
                        )
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Sleeper AC */}
              <div className="grid grid-cols-12 gap-4 items-center py-3">
                <div className="col-span-4">
                  <Input value="Sleeper AC" readOnly className="bg-gray-50" />
                </div>
                <div className="col-span-3">
                  {editing === "sleeper_ac_amount" ? (
                    <div className="flex gap-1">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        type="number"
                        className="text-sm"
                      />
                    </div>
                  ) : (
                    <Input
                      value={`₹${settings.seating_types.sleeper_ac.amount}`}
                      readOnly
                      onClick={() =>
                        startEditing(
                          "sleeper_ac_amount",
                          settings.seating_types.sleeper_ac.amount
                        )
                      }
                      className="cursor-pointer"
                    />
                  )}
                </div>
                <div className="col-span-2">
                  <Switch
                    checked={settings.seating_types.sleeper_ac.enabled}
                    onCheckedChange={(checked) =>
                      handleSeatingTypeChange("sleeper_ac", "enabled", checked)
                    }
                  />
                </div>
                <div className="col-span-3 flex gap-2">
                  {editing === "sleeper_ac_amount" ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => saveSeatingEdit("sleeper_ac", "amount")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        startEditing(
                          "sleeper_ac_amount",
                          settings.seating_types.sleeper_ac.amount
                        )
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer with Cancel and Save Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 px-6"
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
