// Settings Utility Functions
// Provides centralized access to railway settings from database with cookies fallback

import { settingsAPI } from "@/services/api";
import { getAdminId, getEmail } from "./cookieUtils";

export interface SeatingType {
  amount: string;
  enabled: boolean;
}

export interface RailwaySettings {
  admin_name: string;
  admin_email: string;
  admin_contact: string;
  seating_types: {
    sitting: SeatingType;
    sleeper: SeatingType;
    type3?: SeatingType;
  };
  advance_payment_enabled: boolean;
  default_advance_percentage: string;
}

interface SettingsCache {
  data: RailwaySettings | null;
  timestamp: number;
}

// Cache settings for 5 minutes to reduce API calls
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let settingsCache: SettingsCache = {
  data: null,
  timestamp: 0,
};

// Default settings fallback
const DEFAULT_SETTINGS: RailwaySettings = {
  admin_name: "Railway Admin",
  admin_email: "admin@railway.com",
  admin_contact: "+91-9876543210",
  seating_types: {
    sitting: {
      amount: "15",
      enabled: true,
    },
    sleeper: {
      amount: "20",
      enabled: true,
    },
  },
  advance_payment_enabled: true,
  default_advance_percentage: "20",
};

/**
 * Fetch settings from database and convert to RailwaySettings format
 */
const fetchSettingsFromDB = async (): Promise<RailwaySettings | null> => {
  try {
    const adminId = getAdminId();
    if (!adminId) {
      console.error("Admin ID not found in cookies");
      return null;
    }

    const response = await settingsAPI.getSettings(adminId);
    if (response.data && response.data.data) {
      const data = response.data.data;

      // Convert database format to RailwaySettings format
      const seatingTypes: any = {
        sitting: {
          amount: data.type1_amount?.toString() || "15",
          enabled: !!data.type1,
        },
        sleeper: {
          amount: data.type2_amount?.toString() || "20",
          enabled: !!data.type2,
        },
      };

      // Add type3 if it exists
      if (data.type3) {
        seatingTypes.type3 = {
          amount: data.type3_amount?.toString() || "0",
          enabled: true,
        };
      }

      return {
        admin_name: data.admin_name || DEFAULT_SETTINGS.admin_name,
        admin_email: getEmail() || DEFAULT_SETTINGS.admin_email,
        admin_contact: data.admin_contact || DEFAULT_SETTINGS.admin_contact,
        seating_types: seatingTypes,
        advance_payment_enabled: data.advance_payment_enabled ?? true,
        default_advance_percentage:
          data.default_advance_percentage?.toString() || "20",
      };
    }
  } catch (error) {
    console.error("Error fetching settings from database:", error);
  }
  return null;
};

/**
 * Get railway settings from database with caching and localStorage fallback
 */
export const getRailwaySettings = async (): Promise<RailwaySettings> => {
  const now = Date.now();

  // Return cached data if still valid
  if (settingsCache.data && now - settingsCache.timestamp < CACHE_DURATION) {
    return settingsCache.data;
  }

  // Try to fetch from database
  const dbSettings = await fetchSettingsFromDB();
  if (dbSettings) {
    settingsCache = {
      data: dbSettings,
      timestamp: now,
    };
    // Also update localStorage for backward compatibility
    localStorage.setItem("railwaySettings", JSON.stringify(dbSettings));
    return dbSettings;
  }

  // Fallback to localStorage
  try {
    const savedSettings = localStorage.getItem("railwaySettings");
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      const settings = {
        ...DEFAULT_SETTINGS,
        ...parsed,
        seating_types: {
          ...DEFAULT_SETTINGS.seating_types,
          ...parsed.seating_types,
        },
      };
      settingsCache = {
        data: settings,
        timestamp: now,
      };
      return settings;
    }
  } catch (error) {
    console.warn("Failed to load railway settings from localStorage:", error);
  }

  // Last resort: return defaults
  return DEFAULT_SETTINGS;
};

/**
 * Get railway settings synchronously from cache or localStorage (for immediate use)
 */
export const getRailwaySettingsSync = (): RailwaySettings => {
  // Return cached data if available
  if (settingsCache.data) {
    return settingsCache.data;
  }

  // Try localStorage
  try {
    const savedSettings = localStorage.getItem("railwaySettings");
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        seating_types: {
          ...DEFAULT_SETTINGS.seating_types,
          ...parsed.seating_types,
        },
      };
    }
  } catch (error) {
    console.warn("Failed to load railway settings:", error);
  }

  return DEFAULT_SETTINGS;
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
 * Get enabled seating types for dropdown options
 */
export const getEnabledSeatingTypes = () => {
  const settings = getRailwaySettingsSync();
  const seatingOptions: Array<{ key: string; label: string; amount: number }> =
    [];

  // Get actual type names from localStorage
  let typeNames: Record<string, string> = {
    sitting: "Sitting",
    sleeper: "Sleeper",
    type3: "Type 3",
  };

  try {
    const appSettings = localStorage.getItem("appSettings");
    if (appSettings) {
      const parsed = JSON.parse(appSettings);
      if (parsed.type1) typeNames.sitting = parsed.type1;
      if (parsed.type2) typeNames.sleeper = parsed.type2;
      if (parsed.type3) typeNames.type3 = parsed.type3;
    }
  } catch {}

  Object.entries(settings.seating_types).forEach(([key, config]) => {
    if (config.enabled) {
      seatingOptions.push({
        key,
        label: typeNames[key] || key,
        amount: parseFloat(config.amount) || 0,
      });
    }
  });

  return seatingOptions;
};

/**
 * Get price for specific seating type
 */
export const getSeatingTypePrice = (seatingType: string): number => {
  const settings = getRailwaySettingsSync();
  const seatingConfig =
    settings.seating_types[seatingType as keyof typeof settings.seating_types];
  return seatingConfig ? parseFloat(seatingConfig.amount) || 0 : 0;
};

/**
 * Calculate advance payment amount based on settings
 */
export const calculateAdvancePayment = (totalAmount: number): number => {
  const settings = getRailwaySettingsSync();

  if (!settings.advance_payment_enabled) {
    return 0;
  }

  const percentage = parseFloat(settings.default_advance_percentage) || 0;
  return Math.round((totalAmount * percentage) / 100);
};

/**
 * Get advance payment percentage
 */
export const getAdvancePaymentPercentage = (): number => {
  const settings = getRailwaySettingsSync();
  return parseFloat(settings.default_advance_percentage) || 0;
};

/**
 * Check if advance payment is enabled
 */
export const isAdvancePaymentEnabled = (): boolean => {
  const settings = getRailwaySettingsSync();
  return settings.advance_payment_enabled;
};

/**
 * Save settings to localStorage (deprecated - use Settings page to save to DB)
 */
export const saveRailwaySettings = (settings: RailwaySettings): void => {
  try {
    localStorage.setItem("railwaySettings", JSON.stringify(settings));
    clearSettingsCache(); // Clear cache when settings are updated
  } catch (error) {
    console.error("Failed to save railway settings:", error);
  }
};

/**
 * Format seating type key to display label
 */
export const formatSeatingTypeLabel = (key: string): string => {
  // Get names from localStorage first, then fallback to defaults
  try {
    const appSettings = localStorage.getItem("appSettings");
    if (appSettings) {
      const settings = JSON.parse(appSettings);
      if (key === "sitting" && settings.type1) return settings.type1;
      if (key === "sleeper" && settings.type2) return settings.type2;
      if (key === "type3" && settings.type3) return settings.type3;
    }
  } catch {}

  // Fallback to defaults
  return key === "sitting"
    ? "Sitting"
    : key === "sleeper"
    ? "Sleeper"
    : key === "type3"
    ? "Type 3"
    : key;
};

/**
 * Map legacy booking types to settings seating types
 */
export const mapLegacyBookingType = (bookingType: string): string => {
  const mapping: Record<string, string> = {
    Sleeper: "sleeper",
    Sitting: "sitting",
    sleeper: "sleeper",
    sitting: "sitting",
  };

  return mapping[bookingType] || bookingType.toLowerCase();
};

/**
 * Initialize settings cache on app load
 */
export const initializeSettings = async (): Promise<void> => {
  try {
    await getRailwaySettings();
  } catch (error) {
    console.error("Failed to initialize settings:", error);
  }
};
