// Settings Utility Functions
// Provides centralized access to railway settings with fallbacks

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
    sitting_ac: SeatingType;
    sleeper: SeatingType;
    sleeper_ac: SeatingType;
  };
  advance_payment_enabled: boolean;
  default_advance_percentage: string;
}

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
    sitting_ac: {
      amount: "25",
      enabled: true,
    },
    sleeper: {
      amount: "20",
      enabled: true,
    },
    sleeper_ac: {
      amount: "30",
      enabled: true,
    },
  },
  advance_payment_enabled: true,
  default_advance_percentage: "20",
};

/**
 * Get railway settings from localStorage with fallback to defaults
 */
export const getRailwaySettings = (): RailwaySettings => {
  try {
    const savedSettings = localStorage.getItem("railwaySettings");
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      // Merge with defaults to ensure all properties exist
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
 * Get enabled seating types for dropdown options
 */
export const getEnabledSeatingTypes = () => {
  const settings = getRailwaySettings();
  const seatingOptions: Array<{ key: string; label: string; amount: number }> =
    [];

  Object.entries(settings.seating_types).forEach(([key, config]) => {
    if (config.enabled) {
      const labels: Record<string, string> = {
        sitting: "Sitting",
        sitting_ac: "Sitting AC",
        sleeper: "Sleeper",
        sleeper_ac: "Sleeper AC",
      };

      seatingOptions.push({
        key,
        label: labels[key] || key,
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
  const settings = getRailwaySettings();
  const seatingConfig =
    settings.seating_types[seatingType as keyof typeof settings.seating_types];
  return seatingConfig ? parseFloat(seatingConfig.amount) || 0 : 0;
};

/**
 * Calculate advance payment amount based on settings
 */
export const calculateAdvancePayment = (totalAmount: number): number => {
  const settings = getRailwaySettings();

  if (!settings.advance_payment_enabled) {
    return 0;
  }

  const percentage = parseFloat(settings.default_advance_percentage) || 0;
  return (totalAmount * percentage) / 100;
};

/**
 * Get advance payment percentage
 */
export const getAdvancePaymentPercentage = (): number => {
  const settings = getRailwaySettings();
  return parseFloat(settings.default_advance_percentage) || 0;
};

/**
 * Check if advance payment is enabled
 */
export const isAdvancePaymentEnabled = (): boolean => {
  const settings = getRailwaySettings();
  return settings.advance_payment_enabled;
};

/**
 * Save settings to localStorage
 */
export const saveRailwaySettings = (settings: RailwaySettings): void => {
  try {
    localStorage.setItem("railwaySettings", JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save railway settings:", error);
  }
};

/**
 * Format seating type key to display label
 */
export const formatSeatingTypeLabel = (key: string): string => {
  const labels: Record<string, string> = {
    sitting: "Sitting",
    sitting_ac: "Sitting AC",
    sleeper: "Sleeper",
    sleeper_ac: "Sleeper AC",
  };

  return labels[key] || key;
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
