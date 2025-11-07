import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Edit, Check, X } from "lucide-react";

const Settings = () => {
  // Settings state - simplified based on the screenshot
  const [settings, setSettings] = useState({
    admin_name: "Admin",
    host_name: "localhost",
    seating_type: "String",
    string: true,
    string_ac: false,
    sleeper: true,
    sleeper_ac: false,
    total_amount: "1000",
    advanced_amount: "500",
  });

  // Editing state
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-gray-800 text-white p-4 rounded-t-lg">
            <h1 className="text-xl font-semibold">Settings Page</h1>
            <p className="text-gray-300 text-sm">Customize Now</p>
          </div>

          {/* Settings Content */}
          <div className="bg-white rounded-b-lg shadow-sm">
            <div className="p-6 space-y-6">
              {/* Admin Name */}
              <div className="grid grid-cols-2 gap-4 items-center py-3 border-b border-gray-100">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Admin Name
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {settings.admin_name}
                  </span>
                  <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Host Name */}
              <div className="grid grid-cols-2 gap-4 items-center py-3 border-b border-gray-100">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Host Name
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {settings.host_name}
                  </span>
                  <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Seating Type */}
              <div className="grid grid-cols-2 gap-4 items-center py-3 border-b border-gray-100">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Seating Type
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {settings.seating_type}
                  </span>
                  <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* String */}
              <div className="grid grid-cols-2 gap-4 items-center py-3 border-b border-gray-100">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    String
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">₹25</span>
                  <Switch
                    checked={settings.string}
                    onCheckedChange={(checked) =>
                      handleSettingChange("string", checked)
                    }
                  />
                  <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* String AC */}
              <div className="grid grid-cols-2 gap-4 items-center py-3 border-b border-gray-100">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    String AC
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">₹35</span>
                  <Switch
                    checked={settings.string_ac}
                    onCheckedChange={(checked) =>
                      handleSettingChange("string_ac", checked)
                    }
                  />
                  <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Sleeper */}
              <div className="grid grid-cols-2 gap-4 items-center py-3 border-b border-gray-100">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Sleeper
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">₹50</span>
                  <Switch
                    checked={settings.sleeper}
                    onCheckedChange={(checked) =>
                      handleSettingChange("sleeper", checked)
                    }
                  />
                  <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Sleeper AC */}
              <div className="grid grid-cols-2 gap-4 items-center py-3 border-b border-gray-100">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Sleeper AC
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">₹60</span>
                  <Switch
                    checked={settings.sleeper_ac}
                    onCheckedChange={(checked) =>
                      handleSettingChange("sleeper_ac", checked)
                    }
                  />
                  <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Total Amount */}
              <div className="grid grid-cols-2 gap-4 items-center py-3 border-b border-gray-100">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Total Amount
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    ₹{settings.total_amount}
                  </span>
                  <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Advanced Amount */}
              <div className="grid grid-cols-2 gap-4 items-center py-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Advanced Amount
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    ₹{settings.advanced_amount}
                  </span>
                  <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Footer with Save Button */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-lg border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Control</span>
                <Button
                  onClick={handleSave}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
