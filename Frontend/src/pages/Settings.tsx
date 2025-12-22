// Hooks
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useScrollToTop } from "@/hooks/useScrollToTop";

// Components & UI
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

// API
import { settingsAPI } from "@/services/api";

// Cookies
import { getAdminId, getAdminName, getEmail } from "@/lib/cookieUtils";

// Interfaces
interface SeatingType {
  name: string;
  amount: string;
  enabled: boolean;
  breakdown?: Record<string, string>;
  grace_time?: string; 
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

// Fixed Datas
const FIXED_SEATING_NAMES = ["Sitting", "Sleeping"];

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

// Memoized Components for Better Performance
interface EditableFieldProps {
  fieldKey: string;
  label: string;
  value: string;
  placeholder: string;
  icon?: React.ReactNode;
  editing: string | null;
  editValue: string;
  maxLength?: number;
  onStartEdit: (key: string, value: string) => void;
  onSaveEdit: (key: string) => void;
  onCancelEdit: () => void;
  onEditValueChange: (value: string) => void;
}

const EditableField = React.memo<EditableFieldProps>((
  {
    fieldKey,
    label,
    value,
    placeholder,
    icon,
    editing,
    editValue,
    maxLength,
    onStartEdit,
    onSaveEdit,
    onCancelEdit,
    onEditValueChange,
  }
) => {
  const isEditing = editing === fieldKey;

  return (
    <div className="space-y-2">
      <Label className="flex items-center justify-between text-xs font-medium text-gray-700">
        <span className="flex items-center">
          {icon}
          {label}
        </span>
      </Label>
      {isEditing ? (
        <div className="flex gap-2">
          <Input
            value={editValue}
            onChange={(e) => onEditValueChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSaveEdit(fieldKey);
              }
            }}
            placeholder={placeholder}
            maxLength={maxLength}
            className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
          />
          <Button
            type="button"
            size="sm"
            onClick={() => onSaveEdit(fieldKey)}
            className="bg-green-600 hover:bg-green-700 shadow-md"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onCancelEdit}
            className="shadow-md"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Input
            value={value}
            placeholder={placeholder}
            readOnly
            onClick={() => onStartEdit(fieldKey, value)}
            className="cursor-pointer pr-10 hover:bg-gray-50 transition-colors text-sm"
          />
          <Edit className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      )}
    </div>
  );
});

EditableField.displayName = "EditableField";

interface SeatingCardProps {
  seatType: SeatingType;
  index: number;
  color: { bg: string; label: string };
  editing: string | null;
  editValue: string;
  onStartEdit: (key: string, value: string) => void;
  onSaveSeatingEdit: (index: number, field: string) => void;
  onCancelEdit: () => void;
  onEditValueChange: (value: string) => void;
  onBreakdownChange: (index: number, slot: string, value: string) => void;
}

const SeatingCard = React.memo<SeatingCardProps>((
  {
    seatType,
    index,
    color,
    editing,
    editValue,
    onStartEdit,
    onSaveSeatingEdit,
    onCancelEdit,
    onEditValueChange,
    onBreakdownChange,
  }
) => {
  return (
    <Card className="border-2 hover:border-blue-300 transition-colors">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${color.bg}`}></div>
              <span className="font-semibold text-gray-700">{color.label}</span>
            </div>
            <Badge className="text-xs bg-green-100 text-green-800">Active</Badge>
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
                  onChange={(e) => onEditValueChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      onSaveSeatingEdit(index, "grace_time");
                    }
                  }}
                  placeholder="0"
                  className="flex-1 text-sm"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onSaveSeatingEdit(index, "grace_time")}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={onCancelEdit}
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
                  onClick={() => onStartEdit(`grace_${index}`, seatType.grace_time || "0")}
                  className="cursor-pointer pr-8 text-sm hover:bg-gray-50"
                />
                <Edit className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
              </div>
            )}
          </div>

          {/* Price Section */}
          <div className="space-y-2">
            <Label className="text-xs text-gray-600">Price for Hours (₹)</Label>
            {index === 1 ? (
              // Sleeping breakdown: four editable inputs
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {["1-3", "1-6", "1-12", "1-24"].map((slot) => (
                  <div key={slot} className="flex items-center gap-2">
                    <span className="w-20 text-sm text-gray-700">{slot}</span>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                        ₹
                      </span>
                      <Input
                        type="number"
                        value={seatType.breakdown?.[slot] || ""}
                        onChange={(e) => onBreakdownChange(index, slot, e.target.value)}
                        placeholder="0"
                        className="pl-7 text-sm"
                      />
                    </div>
                  </div>
                ))}
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
                        onChange={(e) => onEditValueChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            onSaveSeatingEdit(index, "amount");
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
                      onClick={() => onSaveSeatingEdit(index, "amount")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={onCancelEdit}
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
                      onClick={() => onStartEdit(`amount_${index}`, seatType.amount)}
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
});

SeatingCard.displayName = "SeatingCard";

interface LogoUploadSectionProps {
  imagePreview: string;
  uploadingImage: boolean;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}

const LogoUploadSection = React.memo<LogoUploadSectionProps>((
  { imagePreview, uploadingImage, onImageUpload, onRemoveImage }
) => {
  return (
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
              onClick={onRemoveImage}
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
              onChange={onImageUpload}
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
  );
});

LogoUploadSection.displayName = "LogoUploadSection";

// Function Component
function Settings() {
  useScrollToTop();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsData>(
    JSON.parse(JSON.stringify(INITIAL_SETTINGS))
  );

  // Editing state for inline editing
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const adminId = getAdminId() || "";
  const DRAFTS_KEY = "seatingTypeDrafts";

  // Calling the api to fetch the settings 
  useEffect(() => {
    fetchSettings();
  }, []);

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

  const fetchSettings = async () => {
    try {
      setLoading(true);

      const [settingsResponse] = await Promise.all([
        settingsAPI.getSettings(adminId).catch(() => ({ data: { data: {} } })),
      ]);

      const settingsData = settingsResponse.data?.data || {};
      const breakdown: Record<string, string> = {
        "1-3": "",
        "1-6": "",
        "1-12": "",
        "1-24": ""
      };

      if (settingsData.type2_breakdown) {
        Object.assign(breakdown, {
          "1-3": settingsData.type2_breakdown["1-3"]?.toString() || breakdown["1-3"],
          "1-6": settingsData.type2_breakdown["1-6"]?.toString() || breakdown["1-6"],
          "1-12": settingsData.type2_breakdown["1-12"]?.toString() || breakdown["1-12"],
          "1-24": settingsData.type2_breakdown["1-24"]?.toString() || breakdown["1-24"],
        });
      }

      const drafts = loadDrafts();

      const resolveOrDraft = (serverVal: any, draftVal?: any) =>
        serverVal !== undefined && serverVal !== null && serverVal !== ""
          ? serverVal.toString()
          : draftVal || "";

      const seatingTypes: SeatingType[] = [
        {
          name: FIXED_SEATING_NAMES[0],
          amount: resolveOrDraft(
            settingsData.type1_amount ?? settingsData.type_1_amount,
            drafts[0]?.amount
          ),
          enabled: true,
          grace_time: resolveOrDraft(
            settingsData.type1_grace_time ?? settingsData.grace_amount ?? settingsData.grace_amount_type1 ?? "0",
            "0"
          ),
        },
        {
          name: FIXED_SEATING_NAMES[1],
          amount: resolveOrDraft(
            breakdown["1-24"] || settingsData.type2_amount,
            drafts[1]?.amount
          ),
          breakdown: {
            "1-3": resolveOrDraft(breakdown["1-3"], drafts[1]?.breakdown?.["1-3"]),
            "1-6": resolveOrDraft(breakdown["1-6"], drafts[1]?.breakdown?.["1-6"]),
            "1-12": resolveOrDraft(breakdown["1-12"], drafts[1]?.breakdown?.["1-12"]),
            "1-24": resolveOrDraft(breakdown["1-24"] || settingsData.type2_amount, drafts[1]?.breakdown?.["1-24"]),
          },
          enabled: true,
          grace_time: resolveOrDraft(
            settingsData.type2_grace_time ?? settingsData.grace_amount_type2 ?? "0",
            "0"
          ),
        },
      ];

      setSettings({
        admin_id: settingsData.admin_id || adminId,
        admin_name: settingsData.full_name || settingsData.admin_name || "",
        hall_name: settingsData.hall_name || "",
        heading1: settingsData.heading1 || "",
        heading2: settingsData.heading2 || "",
        info1: settingsData.info1 || "",
        info2: settingsData.info2 || "",
        note: settingsData.note || "",
        logo_url: settingsData.logo_url || "",
        seating_types: seatingTypes,
        advance_payment_enabled: settingsData.advance_payment_enabled ?? true,
        discount_enabled: settingsData.discount_enabled ?? false,
        discount_percentage: settingsData.discount_percentage ?? 0,
        default_advance_percentage: (settingsData.advanced_payment ?? settingsData.default_advance_percentage ?? "20").toString(),
      });

      // set image preview if available (printer has priority)
      const logoCandidate = settingsData.logo_url || "";
      if (logoCandidate) {
        const logoUrl = logoCandidate.startsWith("http")
          ? logoCandidate
          : `${import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "https://railway-api.artechnology.pro"}${logoCandidate}`;
        setImagePreview(logoUrl);
      }
    } catch (error: any) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
      // fallback: try localStorage
      const railwaySettings = localStorage.getItem("railwaySettings");
      if (railwaySettings) {
        try {
          const parsed = JSON.parse(railwaySettings);
          setSettings((prev) => ({
            ...prev,
            admin_name: parsed.admin_name || prev.admin_name,
            hall_name: parsed.hall_name || prev.hall_name,
            heading1: parsed.heading1 || prev.heading1,
            heading2: parsed.heading2 || prev.heading2,
            info1: parsed.info1 || prev.info1,
            info2: parsed.info2 || prev.info2,
            note: parsed.note || prev.note,
            logo_url: parsed.logo_url || prev.logo_url,
            seating_types: [
              {
                name: FIXED_SEATING_NAMES[0],
                amount: parsed.seating_types?.sitting?.amount || prev.seating_types[0].amount,
                enabled: parsed.seating_types?.sitting?.enabled ?? true,
                grace_time: parsed.seating_types?.sitting?.grace_time || prev.seating_types[0].grace_time,
              },
              {
                name: FIXED_SEATING_NAMES[1],
                amount: parsed.seating_types?.sleeper?.amount || prev.seating_types[1].amount,
                breakdown: parsed.seating_types?.sleeper?.breakdown || prev.seating_types[1].breakdown,
                enabled: parsed.seating_types?.sleeper?.enabled ?? true,
                grace_time: parsed.seating_types?.sleeper?.grace_time || prev.seating_types[1].grace_time,
              },
            ],
          }));
          toast.info("Loaded settings from local storage.");
        } catch (e) {
          // ignore parse errors
        }
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
        getAdminName?.() ||
        getEmail?.() ||
        adminId ||
        "Admin";

      // Prepare payload for backend, consolidating seating info
      const settingsToSave = JSON.parse(JSON.stringify(settings));
      const sleeper = settingsToSave.seating_types[1] || { breakdown: {}, amount: "" };
      // ensure canonical sleeping amount uses 1-24 slot if present
      if (sleeper.breakdown && sleeper.breakdown["1-24"]) {
        sleeper.amount = sleeper.breakdown["1-24"];
      }

      const settingsApiData: any = {
        full_name: payloadAdminName,
        type_1: settingsToSave.seating_types[0].name || FIXED_SEATING_NAMES[0],
        type_1_amount: settingsToSave.seating_types[0].amount ? parseInt(settingsToSave.seating_types[0].amount) : null,
        grace_amount: settingsToSave.seating_types[0].grace_time ? parseInt(settingsToSave.seating_types[0].grace_time) : 0,
        type_2: settingsToSave.seating_types[1].name || FIXED_SEATING_NAMES[1],
        grace_amount_type2: settingsToSave.seating_types[1].grace_time ? parseInt(settingsToSave.seating_types[1].grace_time) : 0,
        type2_breakdown: {
          "1-3": parseInt(settingsToSave.seating_types[1].breakdown?.["1-3"] || "0"),
          "1-6": parseInt(settingsToSave.seating_types[1].breakdown?.["1-6"] || "0"),
          "1-12": parseInt(settingsToSave.seating_types[1].breakdown?.["1-12"] || "0"),
          "1-24": parseInt(settingsToSave.seating_types[1].breakdown?.["1-24"] || settingsToSave.seating_types[1].amount || "0"),
        },
        advance_payment_enabled: !!settingsToSave.advance_payment_enabled,
        default_advance_percentage: parseFloat(settingsToSave.default_advance_percentage) || 20,
        // Printer-related fields
        hall_name: settingsToSave.hall_name || "",
        heading1: settingsToSave.heading1 || "",
        heading2: settingsToSave.heading2 || "",
        info1: settingsToSave.info1 || "",
        info2: settingsToSave.info2 || "",
        note: settingsToSave.note || "",
        logo_url: settingsToSave.logo_url || "",
      };

      // Save to backend
      const response = await settingsAPI.upsertSettings(adminId, settingsApiData);
      // update localStorage mirror for other parts of app
      const seatingTypesObj: Record<string, any> = {
        sitting: {
          amount: settingsToSave.seating_types[0].amount || "0",
          enabled: true,
          grace_time: settingsToSave.seating_types[0].grace_time || "0",
        },
        sleeper: {
          amount: settingsToSave.seating_types[1].breakdown?.["1-24"] || settingsToSave.seating_types[1].amount || "0",
          enabled: true,
          breakdown: settingsToSave.seating_types[1].breakdown || {},
          grace_time: settingsToSave.seating_types[1].grace_time || "0",
        },
      };

      const railwaySettings = {
        admin_name: payloadAdminName,
        admin_email: localStorage.getItem("email") || getEmail?.() || "admin@railway.com",
        admin_contact: localStorage.getItem("adminPhone") || "",
        hall_name: settingsToSave.hall_name,
        heading1: settingsToSave.heading1,
        heading2: settingsToSave.heading2,
        info1: settingsToSave.info1,
        info2: settingsToSave.info2,
        note: settingsToSave.note,
        logo_url: settingsToSave.logo_url,
        seating_types: seatingTypesObj,
        advance_payment_enabled: settingsToSave.advance_payment_enabled,
        default_advance_percentage: settingsToSave.default_advance_percentage,
      };

      localStorage.setItem("railwaySettings", JSON.stringify(railwaySettings));
      try {
        window.dispatchEvent(new CustomEvent("railwaySettingsChanged", { detail: railwaySettings }));
      } catch (e) {
        // ignore
      }

      toast.success("Settings saved successfully");
      setSettings(settingsToSave);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const startEditing = useCallback((field: string, currentValue: string) => {
    setEditing(field);
    setEditValue(currentValue);
  }, []);

  const saveEdit = useCallback((field: string) => {
    if (editValue.trim() !== "") {
      setSettings((prev) => ({
        ...prev,
        [field]: editValue.trim(),
      }));
      setEditing(null);
      setEditValue("");
    }
  }, [editValue]);

  const saveSeatingEdit = useCallback((index: number, field: string) => {
    if (editValue.trim() !== "") {
      const trimmedValue = editValue.trim();
      console.log(`Saving ${field} for seating type ${index}:`, trimmedValue);
      setSettings((prev) => {
        const updatedSeatingTypes = prev.seating_types.map((st, i) =>
          i === index ? { ...st, [field]: trimmedValue } : st
        );
        return { ...prev, seating_types: updatedSeatingTypes } as SettingsData;
      });
      setEditing(null);
      setEditValue("");
    }
  }, [editValue]);

  const cancelEdit = useCallback(() => {
    setEditing(null);
    setEditValue("");
  }, []);

  const handleEditValueChange = useCallback((value: string) => {
    setEditValue(value);
  }, []);

  const handleBreakdownChange = useCallback((index: number, slot: string, value: string) => {
    setSettings((prev) => {
      const updatedSeatingTypes = prev.seating_types.map((st, i) => {
        if (i === index) {
          return {
            ...st,
            breakdown: {
              ...(st.breakdown || {}),
              [slot]: value,
            },
          };
        }
        return st;
      });
      return { ...prev, seating_types: updatedSeatingTypes } as SettingsData;
    });
  }, []);

  // Memoize colors array at component level to avoid hook inside map
  const seatingColors = useMemo(() => [
    { bg: "bg-blue-500", label: "Sitting" },
    { bg: "bg-orange-500", label: "Sleeper" },
  ], []);

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
                  <LogoUploadSection
                    imagePreview={imagePreview}
                    uploadingImage={uploadingImage}
                    onImageUpload={handleImageUpload}
                    onRemoveImage={handleRemoveImage}
                  />

                  {/* Hall Name */}
                  <EditableField
                    fieldKey="hall_name"
                    label="Hall Name (Legacy)"
                    value={settings.hall_name}
                    placeholder="Enter hall name"
                    icon={<Building className="w-4 h-4 mr-2 text-purple-500" />}
                    editing={editing}
                    editValue={editValue}
                    onStartEdit={startEditing}
                    onSaveEdit={saveEdit}
                    onCancelEdit={cancelEdit}
                    onEditValueChange={handleEditValueChange}
                  />

                  {/* Ticket Header Customization */}
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-blue-500" />
                      <h3 className="text-sm font-semibold text-gray-800">
                        Ticket Header Customization
                      </h3>
                    </div>

                    {/* Heading 1 */}
                    <EditableField
                      fieldKey="heading1"
                      label="Heading 1"
                      value={settings.heading1}
                      placeholder="e.g., RAILWAY"
                      editing={editing}
                      editValue={editValue}
                      onStartEdit={startEditing}
                      onSaveEdit={saveEdit}
                      onCancelEdit={cancelEdit}
                      onEditValueChange={handleEditValueChange}
                    />

                    {/* Heading 2 */}
                    <EditableField
                      fieldKey="heading2"
                      label="Heading 2"
                      value={settings.heading2}
                      placeholder="e.g., STATION"
                      editing={editing}
                      editValue={editValue}
                      onStartEdit={startEditing}
                      onSaveEdit={saveEdit}
                      onCancelEdit={cancelEdit}
                      onEditValueChange={handleEditValueChange}
                    />

                    {/* Info 1 */}
                    <EditableField
                      fieldKey="info1"
                      label="Info 1"
                      value={settings.info1}
                      placeholder="e.g., Platform 1"
                      editing={editing}
                      editValue={editValue}
                      onStartEdit={startEditing}
                      onSaveEdit={saveEdit}
                      onCancelEdit={cancelEdit}
                      onEditValueChange={handleEditValueChange}
                    />

                    {/* Info 2 */}
                    <EditableField
                      fieldKey="info2"
                      label="Info 2"
                      value={settings.info2}
                      placeholder="e.g., Gate 2"
                      editing={editing}
                      editValue={editValue}
                      onStartEdit={startEditing}
                      onSaveEdit={saveEdit}
                      onCancelEdit={cancelEdit}
                      onEditValueChange={handleEditValueChange}
                    />

                    {/* Note (Footer) */}
                    <EditableField
                      fieldKey="note"
                      label="Note (Footer)"
                      value={settings.note}
                      placeholder="e.g., Thank you!"
                      editing={editing}
                      editValue={editValue}
                      maxLength={20}
                      onStartEdit={startEditing}
                      onSaveEdit={saveEdit}
                      onCancelEdit={cancelEdit}
                      onEditValueChange={handleEditValueChange}
                    />
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
                    const color = seatingColors[index];

                    return (
                      <SeatingCard
                        key={index}
                        seatType={seatType}
                        index={index}
                        color={color}
                        editing={editing}
                        editValue={editValue}
                        onStartEdit={startEditing}
                        onSaveSeatingEdit={saveSeatingEdit}
                        onCancelEdit={cancelEdit}
                        onEditValueChange={handleEditValueChange}
                        onBreakdownChange={handleBreakdownChange}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

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
