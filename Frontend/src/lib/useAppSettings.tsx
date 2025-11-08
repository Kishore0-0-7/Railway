import { useEffect, useState, useCallback } from "react";
import { settingsAPI } from "@/services/api";
<<<<<<< HEAD

type AppSettings = {
    type1?: string;
    type2?: string;
    [key: string]: any;
=======
import { getAdminId } from "./cookieUtils";

type AppSettings = {
  type1?: string;
  type2?: string;
  [key: string]: any;
>>>>>>> 4cacfc3 (update)
} | null;

/**
 * Hook to load application settings (seating type names) and expose helpers.
 * It caches the last settings object in localStorage under `appSettings`.
 */
export default function useAppSettings() {
<<<<<<< HEAD
    const [settings, setSettings] = useState<AppSettings>(null);
    const [loading, setLoading] = useState(true);

    const fetch = useCallback(async () => {
        setLoading(true);
        const adminId = localStorage.getItem("adminId") || "";
        try {
            const res = await settingsAPI.getSettings(adminId);
            const data = res?.data?.data || null;
            if (data) {
                setSettings(data);
                try {
                    localStorage.setItem("appSettings", JSON.stringify(data));
                } catch { }
            }
        } catch (err) {
            // fallback to cached settings if available
            try {
                const cached = localStorage.getItem("appSettings");
                if (cached) setSettings(JSON.parse(cached));
            } catch { }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetch();
    }, [fetch]);

    const refresh = async () => {
        await fetch();
    };

    const getTypeName = (index: 1 | 2) => {
        if (!settings) return index === 1 ? "Sitting" : "Sleeper";
        if (index === 1) return settings.type1 || "Sitting";
        return settings.type2 || "Sleeper";
    };

    const isTypeEnabled = (index: 1 | 2) => {
        // While settings are loading or absent, assume enabled so UI doesn't jump
        if (!settings) return true;
        if (index === 1) return !!settings.type1;
        return !!settings.type2;
    };

    return { settings, loading, getTypeName, isTypeEnabled, refresh } as const;
=======
  const [settings, setSettings] = useState<AppSettings>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const adminId = getAdminId() || "";
    try {
      const res = await settingsAPI.getSettings(adminId);
      const data = res?.data?.data || null;
      if (data) {
        setSettings(data);
        try {
          localStorage.setItem("appSettings", JSON.stringify(data));
        } catch {}
      }
    } catch (err) {
      // fallback to cached settings if available
      try {
        const cached = localStorage.getItem("appSettings");
        if (cached) setSettings(JSON.parse(cached));
      } catch {}
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const refresh = async () => {
    await fetch();
  };

  const getTypeName = (index: 1 | 2) => {
    if (!settings) return index === 1 ? "Sitting" : "Sleeper";
    if (index === 1) return settings.type1 || "Sitting";
    return settings.type2 || "Sleeper";
  };

  const isTypeEnabled = (index: 1 | 2) => {
    // While settings are loading or absent, assume enabled so UI doesn't jump
    if (!settings) return true;
    if (index === 1) return !!settings.type1;
    return !!settings.type2;
  };

  return { settings, loading, getTypeName, isTypeEnabled, refresh } as const;
>>>>>>> 4cacfc3 (update)
}
