// Dynamic Settings Utility Functions
// Fetches settings from the backend API with cookie-based authentication

import { settingsAPI } from "@/services/api";
import { getAdminId } from "./cookieUtils";

export interface SeatingType {
  key: string;
  label: string;
  amount: number;
}

interface SettingsCache {
  data: any | null;
  timestamp: number;
}

// Cache settings for 5 minutes to reduce API calls
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let settingsCache: SettingsCache = {
  data: null,
  timestamp: 0,
};

/**
 * Fetch settings from API with caching
 */
export const fetchDynamicSettings = async (): Promise<any> => {
  const now = Date.now();

  // Return cached data if still valid
  if (settingsCache.data && now - settingsCache.timestamp < CACHE_DURATION) {
    return settingsCache.data;
  }

  try {
    const adminId = getAdminId();
    if (!adminId) {
      console.error("Admin ID not found in cookies");
      return null;
    }

    const response = await settingsAPI.getSettings(adminId);
    if (response.data && response.data.data) {
      settingsCache = {
        data: response.data.data,
        timestamp: now,
      };
      return response.data.data;
    }
  } catch (error) {
    console.error("Error fetching settings:", error);
  }

  return null;
};

/**
 * Clear the settings cache (call this after updating settings)
 */
export const clearSettingsCache = () => {
  settingsCache = {
    data: null,
    timestamp: 0,
  };
};

/**
 * Get all enabled seating types
 */
export const getEnabledSeatingTypes = async (): Promise<SeatingType[]> => {
  const settings = await fetchDynamicSettings();
  if (!settings) return [];

  const types: SeatingType[] = [];

  if (settings.type1 && settings.type1_amount) {
    types.push({
      key: settings.type1.toLowerCase().replace(/\s+/g, "_"),
      label: settings.type1,
      amount: parseFloat(settings.type1_amount),
    });
  }

  if (settings.type2 && settings.type2_amount) {
    types.push({
      key: settings.type2.toLowerCase().replace(/\s+/g, "_"),
      label: settings.type2,
      amount: parseFloat(settings.type2_amount),
    });
  }

  if (settings.type3 && settings.type3_amount) {
    types.push({
      key: settings.type3.toLowerCase().replace(/\s+/g, "_"),
      label: settings.type3,
      amount: parseFloat(settings.type3_amount),
    });
  }

  if (settings.type4 && settings.type4_amount) {
    types.push({
      key: settings.type4.toLowerCase().replace(/\s+/g, "_"),
      label: settings.type4,
      amount: parseFloat(settings.type4_amount),
    });
  }

  return types;
};

/**
 * Get seating type price by key (case insensitive, flexible matching)
 */
export const getSeatingTypePrice = async (typeKey: string): Promise<number> => {
  const settings = await fetchDynamicSettings();
  if (!settings) return 0;

  const normalizedKey = typeKey.toLowerCase().trim();

  // Check each type
  if (settings.type1 && settings.type1.toLowerCase().includes(normalizedKey)) {
    return parseFloat(settings.type1_amount) || 0;
  }
  if (settings.type2 && settings.type2.toLowerCase().includes(normalizedKey)) {
    return parseFloat(settings.type2_amount) || 0;
  }
  if (settings.type3 && settings.type3.toLowerCase().includes(normalizedKey)) {
    return parseFloat(settings.type3_amount) || 0;
  }
  if (settings.type4 && settings.type4.toLowerCase().includes(normalizedKey)) {
    return parseFloat(settings.type4_amount) || 0;
  }

  // Fallback: check if typeKey matches type name exactly
  if (
    settings.type1 &&
    settings.type1.toLowerCase().replace(/\s+/g, "_") === normalizedKey
  ) {
    return parseFloat(settings.type1_amount) || 0;
  }
  if (
    settings.type2 &&
    settings.type2.toLowerCase().replace(/\s+/g, "_") === normalizedKey
  ) {
    return parseFloat(settings.type2_amount) || 0;
  }
  if (
    settings.type3 &&
    settings.type3.toLowerCase().replace(/\s+/g, "_") === normalizedKey
  ) {
    return parseFloat(settings.type3_amount) || 0;
  }
  if (
    settings.type4 &&
    settings.type4.toLowerCase().replace(/\s+/g, "_") === normalizedKey
  ) {
    return parseFloat(settings.type4_amount) || 0;
  }

  return 0;
};

/**
 * Get admin name from settings
 */
export const getAdminName = async (): Promise<string> => {
  const settings = await fetchDynamicSettings();
  return settings?.admin_name || "Railway Admin";
};

/**
 * Get hall name from settings
 */
export const getHallName = async (): Promise<string> => {
  const settings = await fetchDynamicSettings();
  return settings?.hall_name || "Waiting Hall";
};

/**
 * Check if advance payment is enabled
 */
export const isAdvancePaymentEnabled = async (): Promise<boolean> => {
  const settings = await fetchDynamicSettings();
  // Default to true if settings not found for backward compatibility
  return settings?.advance_payment_enabled ?? true;
};

/**
 * Get advance payment percentage from settings
 */
export const getAdvancePaymentPercentage = async (): Promise<number> => {
  const settings = await fetchDynamicSettings();
  // Default to 20% if settings not found for backward compatibility
  return settings?.default_advance_percentage ?? 20;
};

/**
 * Calculate advance payment amount
 */
export const calculateAdvancePayment = async (
  totalAmount: number
): Promise<number> => {
  const percentage = await getAdvancePaymentPercentage();
  return Math.round((totalAmount * percentage) / 100);
};
