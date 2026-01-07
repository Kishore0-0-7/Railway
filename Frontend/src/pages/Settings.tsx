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
  Plus,
  Trash2,
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
  formats?: string[];
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
      formats: ["1-3", "1-6", "1-12", "1-24"],
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
  onAddFormat?: (index: number, format: string) => void;
  onRemoveFormat?: (index: number, format: string) => void;
  onUpdateSettings?: (updater: (prev: SettingsData) => SettingsData) => void;
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
    onAddFormat,
    onRemoveFormat,
    onUpdateSettings,
  }
) => {
  const [newFormat, setNewFormat] = React.useState("");
  const [formatStart, setFormatStart] = React.useState("");
  const [formatEnd, setFormatEnd] = React.useState("");
  const [showPriceModal, setShowPriceModal] = React.useState(false);
  const [priceForNewFormat, setPriceForNewFormat] = React.useState("");
  const [newFormatToAdd, setNewFormatToAdd] = React.useState<string | null>(null);
  const [editingFormatLabel, setEditingFormatLabel] = React.useState<string | null>(null);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editFormatStart, setEditFormatStart] = React.useState("");
  const [editFormatEnd, setEditFormatEnd] = React.useState("");
  const [editPriceValue, setEditPriceValue] = React.useState("");
  const formats = seatType.formats || (index === 1 ? ["1-3", "1-6", "1-12", "1-24"] : []);

  const addFormat = () => {
    const start = parseInt(formatStart);
    const end = parseInt(formatEnd);
    const format = `${start}-${end}`;
    
    // Validation checks
    if (!formatStart.trim() || !formatEnd.trim()) {
      toast.error("Please enter both start and end values");
      return;
    }

    if (isNaN(start) || isNaN(end)) {
      toast.error("Please enter valid numbers");
      return;
    }

    if (start < 1 || start > 24) {
      toast.error("Start value must be between 1 and 24");
      return;
    }

    if (end < 1 || end > 24) {
      toast.error("End value must be between 1 and 24");
      return;
    }

    if (end <= start) {
      toast.error("End value must be greater than start value");
      return;
    }

    if (formats.includes(format)) {
      toast.error("This format already exists");
      return;
    }

    // Show modal to set price
    setNewFormatToAdd(format);
    setPriceForNewFormat("");
    setShowPriceModal(true);
    setFormatStart("");
    setFormatEnd("");
  };

  const savePriceAndAddFormat = () => {
    if (!newFormatToAdd) return;

    if (!priceForNewFormat.trim()) {
      toast.error("Please enter a price");
      return;
    }

    onAddFormat?.(index, newFormatToAdd);
    onBreakdownChange(index, newFormatToAdd, priceForNewFormat);
    
    setShowPriceModal(false);
    setNewFormatToAdd(null);
    setPriceForNewFormat("");
    toast.success(`Format "${newFormatToAdd}" added with price ₹${priceForNewFormat}`);
  };

  const handleEditFormatLabel = (format: string) => {
    const [start, end] = format.split("-").map(Number);
    setEditingFormatLabel(format);
    setEditFormatStart(start.toString());
    setEditFormatEnd(end.toString());
    setEditPriceValue(seatType.breakdown?.[format] || "");
    setShowEditModal(true);
  };

  const saveEditedFormat = () => {
    if (!editingFormatLabel) return;

    // Validate price
    if (!editPriceValue.trim()) {
      toast.error("Please enter a price");
      return;
    }

    const start = parseInt(editFormatStart);
    const end = parseInt(editFormatEnd);

    if (isNaN(start) || isNaN(end) || start < 1 || start > 24 || end < 1 || end > 24 || end <= start) {
      toast.error("Invalid format. Start and end must be between 1-24, and end > start");
      return;
    }

    const newFormat = `${start}-${end}`;

    if (newFormat !== editingFormatLabel && formats.includes(newFormat)) {
      toast.error("This format already exists");
      return;
    }

    // Update breakdown with new format key and price
    const oldPrice = seatType.breakdown?.[editingFormatLabel];
    
    onUpdateSettings?.((prev) => {
      const updated = JSON.parse(JSON.stringify(prev)) as SettingsData;
      const formatList = updated.seating_types[index].formats || [...formats];
      const formatIdx = formatList.indexOf(editingFormatLabel);
      
      // Update format in formats array if changed
      if (newFormat !== editingFormatLabel && formatIdx !== -1) {
        formatList[formatIdx] = newFormat;
      }
      updated.seating_types[index].formats = formatList;

      // Update breakdown object
      if (updated.seating_types[index].breakdown) {
        if (newFormat !== editingFormatLabel) {
          delete updated.seating_types[index].breakdown![editingFormatLabel];
        }
        updated.seating_types[index].breakdown![newFormat] = editPriceValue;
      }

      return updated;
    });

    if (newFormat !== editingFormatLabel) {
      toast.success(`Format updated from "${editingFormatLabel}" to "${newFormat}" with price ₹${editPriceValue}`);
    } else {
      toast.success(`Price updated to ₹${editPriceValue}`);
    }
    
    setShowEditModal(false);
    setEditingFormatLabel(null);
  };

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
          <div className="space-y-3">
            <Label className="text-xs text-gray-600 font-medium">Price for Hours (₹)</Label>
            {index === 1 ? (
              <>
                {/* Dynamic Format Price Grid */}
                <div className="space-y-2 bg-gradient-to-br from-blue-50 via-indigo-50 to-gray-50 p-3 sm:p-4 rounded-xl border-2 border-blue-200 shadow-sm">
                  <div className="grid gap-3">
                    {formats.map((slot) => (
                      <div key={slot} className="flex flex-col sm:flex-row sm:items-center gap-2 bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-200">
                        {/* Mobile: Format on top row full width */}
                        <button
                          onClick={() => handleEditFormatLabel(slot)}
                          className="w-full sm:w-24 text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer text-center"
                          title="Click to edit format"
                        >
                          {slot}
                        </button>

                        {/* Mobile: Price input on second row full width */}
                        {/* Desktop: Price input flexes to take available space */}
                        <div className="relative w-full sm:flex-1 sm:w-40">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 text-sm font-bold">
                            ₹
                          </span>
                          <Input
                            type="number"
                            value={seatType.breakdown?.[slot] || ""}
                            placeholder="0"
                            onClick={() => handleEditFormatLabel(slot)}
                            className="pl-7 w-full text-sm sm:text-base font-semibold bg-white border border-gray-300 focus:border-blue-500 cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all rounded-lg"
                            readOnly
                            title="Click to edit format and price"
                          />
                        </div>

                        {/* Mobile: Delete button on third row full width */}
                        {/* Desktop: Delete button fixed size */}
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="w-full sm:w-9 sm:h-9 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                          onClick={() => {
                            if (formats.length <= 1) {
                              toast.error("Cannot delete the last format. At least one format is required.");
                            } else {
                              onRemoveFormat?.(index, slot);
                            }
                          }}
                          title="Remove format"
                        >
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Add Format Section */}
                  <div className="mt-4 pt-4 border-t-2 border-blue-200">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center">
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">Add Format:</span>
                      <div className="flex gap-2 flex-1">
                        <Input
                          type="number"
                          value={formatStart}
                          onChange={(e) => setFormatStart(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addFormat();
                            }
                          }}
                          placeholder="Start"
                          className="flex-1 sm:w-20 text-sm font-semibold text-center"
                          min="1"
                          max="24"
                        />
                        <span className="text-gray-600 font-bold text-lg flex items-center">-</span>
                        <Input
                          type="number"
                          value={formatEnd}
                          onChange={(e) => setFormatEnd(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addFormat();
                            }
                          }}
                          placeholder="End"
                          className="flex-1 sm:w-20 text-sm font-semibold text-center"
                          min="1"
                          max="24"
                        />
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white h-9 px-3 sm:px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-semibold flex items-center gap-1 w-full sm:w-auto justify-center"
                        onClick={addFormat}
                        title="Add format (End must be > Start)"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </>
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

        {/* Edit Format & Price Modal */}
        {showEditModal && editingFormatLabel && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md shadow-2xl border-2 border-blue-300">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 sm:p-6 rounded-t-lg">
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <Train className="w-5 h-5 mr-2" />
                  Edit Format & Price
                </CardTitle>
                <CardDescription className="text-blue-100 text-sm mt-1">
                  Update the format and price ({editingFormatLabel})
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-5">
                {/* Current Format Badge */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Current Format</Label>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold inline-block">
                      {editingFormatLabel}
                    </span>
                  </div>
                </div>

                {/* Format Section */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700">New Format (Optional)</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      value={editFormatStart}
                      onChange={(e) => setEditFormatStart(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Tab") return;
                        if (e.key === "Enter") {
                          e.preventDefault();
                          saveEditedFormat();
                        }
                      }}
                      placeholder="Start"
                      className="flex-1 text-sm font-semibold text-center border-2 border-gray-300 focus:border-blue-500 rounded-lg"
                      min="1"
                      max="24"
                    />
                    <span className="text-gray-600 font-bold text-lg">-</span>
                    <Input
                      type="number"
                      value={editFormatEnd}
                      onChange={(e) => setEditFormatEnd(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          saveEditedFormat();
                        }
                      }}
                      placeholder="End"
                      className="flex-1 text-sm font-semibold text-center border-2 border-gray-300 focus:border-blue-500 rounded-lg"
                      min="1"
                      max="24"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Values must be 1-24, end {`>`} start</p>
                </div>

                {/* Price Section */}
                <div className="space-y-2 pt-3 border-t">
                  <Label className="text-sm font-semibold text-gray-700">Price (₹)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 text-lg font-bold">
                      ₹
                    </span>
                    <Input
                      type="number"
                      value={editPriceValue}
                      onChange={(e) => setEditPriceValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          saveEditedFormat();
                        }
                      }}
                      placeholder="0"
                      className="pl-8 text-lg font-semibold border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingFormatLabel(null);
                    }}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={saveEditedFormat}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Price Modal for New Format */}
        {showPriceModal && newFormatToAdd && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-sm shadow-2xl border-2 border-blue-300">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 sm:p-6 rounded-t-lg">
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <Train className="w-5 h-5 mr-2" />
                  Set Price for Format
                </CardTitle>
                <CardDescription className="text-blue-100 text-sm mt-1">
                  Enter the price for {newFormatToAdd} hours
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Format: <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">{newFormatToAdd}</span>
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Price (₹)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 text-lg font-bold">
                      ₹
                    </span>
                    <Input
                      type="number"
                      value={priceForNewFormat}
                      onChange={(e) => setPriceForNewFormat(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          savePriceAndAddFormat();
                        }
                      }}
                      placeholder="0"
                      className="pl-8 text-lg font-semibold border-2 border-gray-300 focus:border-blue-500"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowPriceModal(false);
                      setNewFormatToAdd(null);
                      setPriceForNewFormat("");
                    }}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={savePriceAndAddFormat}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Save Format
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
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
      
      // Extract all formats and their prices from type2_breakdown
      const type2BreakdownData = settingsData.type2_breakdown || {};
      const allFormats = Object.keys(type2BreakdownData);
      const breakdown: Record<string, string> = {};
      
      // Populate breakdown with all formats from server (including those with empty values)
      if (allFormats.length > 0) {
        allFormats.forEach(format => {
          const value = type2BreakdownData[format];
          breakdown[format] = (value !== null && value !== undefined) ? value.toString() : "";
        });
      } else {
        // Fallback to default formats if no formats exist
        breakdown["1-3"] = "";
        breakdown["1-6"] = "";
        breakdown["1-12"] = "";
        breakdown["1-24"] = "";
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
          enabled: settingsData.type1_enabled ?? settingsData.type_1_enabled ?? true,
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
            ...breakdown
          },
          formats: Object.keys(breakdown),
          enabled: settingsData.type2_enabled ?? settingsData.type_2_enabled ?? true,
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
                formats: parsed.seating_types?.sleeper?.formats || Object.keys(parsed.seating_types?.sleeper?.breakdown || prev.seating_types[1].breakdown || {}),
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

  const handleAddFormat = useCallback((index: number, newFormat: string) => {
    setSettings((prev) => {
      const updated = JSON.parse(JSON.stringify(prev)) as SettingsData;
      const formats = updated.seating_types[index].formats || ["1-3", "1-6", "1-12", "1-24"];
      
      if (!formats.includes(newFormat)) {
        formats.push(newFormat);
        updated.seating_types[index].formats = formats;
        // Initialize breakdown for new format
        if (!updated.seating_types[index].breakdown) {
          updated.seating_types[index].breakdown = {};
        }
        updated.seating_types[index].breakdown![newFormat] = "";
      }
      return updated;
    });
    toast.success(`Format "${newFormat}" added successfully`);
  }, []);

  const handleRemoveFormat = useCallback((index: number, format: string) => {
    setSettings((prev) => {
      const updated = JSON.parse(JSON.stringify(prev)) as SettingsData;
      const formats = updated.seating_types[index].formats || ["1-3", "1-6", "1-12", "1-24"];
      const newFormats = formats.filter(f => f !== format);
      
      if (newFormats.length > 0) {
        updated.seating_types[index].formats = newFormats;
        // Remove price for that format
        if (updated.seating_types[index].breakdown) {
          delete updated.seating_types[index].breakdown![format];
        }
      }
      return updated;
    });
    toast.success(`Format "${format}" removed`);
  }, []);

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
      
      // Build type2_breakdown from all formats
      const type2_breakdown: Record<string, number> = {};
      const formats = sleeper.formats || ["1-3", "1-6", "1-12", "1-24"];
      formats.forEach((fmt: string) => {
        type2_breakdown[fmt] = parseInt(sleeper.breakdown?.[fmt] || "0");
      });
      
      // ensure canonical sleeping amount uses 1-24 slot if present
      if (sleeper.breakdown && sleeper.breakdown["1-24"]) {
        sleeper.amount = sleeper.breakdown["1-24"];
      }

      const settingsApiData: any = {
        full_name: payloadAdminName,
        type1: settingsToSave.seating_types[0].name || FIXED_SEATING_NAMES[0],
        type1_amount: settingsToSave.seating_types[0].amount ? parseInt(settingsToSave.seating_types[0].amount) : null,
        grace_amount: settingsToSave.seating_types[0].grace_time ? parseInt(settingsToSave.seating_types[0].grace_time) : 0,
        type2: settingsToSave.seating_types[1].name || FIXED_SEATING_NAMES[1],
        grace_amount_type2: settingsToSave.seating_types[1].grace_time ? parseInt(settingsToSave.seating_types[1].grace_time) : 0,
        type2_breakdown: type2_breakdown,
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
          formats: settingsToSave.seating_types[1].formats || Object.keys(settingsToSave.seating_types[1].breakdown || {}),
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
                  Manage seating categories and their pricing ({settings.seating_types.filter(st => st.enabled).length} {settings.seating_types.filter(st => st.enabled).length === 1 ? 'type' : 'types'})
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {settings.seating_types.filter(st => st.enabled).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No seating types enabled. Please contact super admin to enable seating types.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {/* Seating Type Cards - Only show enabled types */}
                    {settings.seating_types.map((seatType, index) => {
                      if (!seatType.enabled) return null;

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
                          onAddFormat={handleAddFormat}
                          onRemoveFormat={handleRemoveFormat}
                          onUpdateSettings={setSettings}
                        />
                      );
                    })}
                  </div>
                )}
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
}

export default Settings;
