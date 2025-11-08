/**
 * Cookie utility functions for secure authentication storage
 * Using cookies instead of localStorage for better security
 */

export interface AuthData {
  adminId: string;
  adminName: string;
  email: string;
  isLoggedIn: boolean;
}

/**
 * Set a cookie with optional expiration
 */
export const setCookie = (
  name: string,
  value: string,
  days: number = 7
): void => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  // Using SameSite=Strict for better security
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Strict`;
};

/**
 * Get a cookie value by name
 */
export const getCookie = (name: string): string | null => {
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length);
    }
  }
  return null;
};

/**
 * Delete a cookie by name
 */
export const deleteCookie = (name: string): void => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

/**
 * Set authentication data in cookies
 */
export const setAuthData = (data: AuthData): void => {
  setCookie("adminId", data.adminId);
  setCookie("adminName", data.adminName);
  setCookie("email", data.email);
  setCookie("isLoggedIn", data.isLoggedIn ? "true" : "false");
};

/**
 * Get authentication data from cookies
 */
export const getAuthData = (): AuthData | null => {
  const adminId = getCookie("adminId");
  const adminName = getCookie("adminName");
  const email = getCookie("email");
  const isLoggedIn = getCookie("isLoggedIn");

  if (!adminId || !email || isLoggedIn !== "true") {
    return null;
  }

  return {
    adminId,
    adminName: adminName || "",
    email,
    isLoggedIn: true,
  };
};

/**
 * Get admin ID from cookies
 */
export const getAdminId = (): string | null => {
  return getCookie("adminId");
};

/**
 * Get admin name from cookies
 */
export const getAdminName = (): string | null => {
  return getCookie("adminName");
};

/**
 * Get email from cookies
 */
export const getEmail = (): string | null => {
  return getCookie("email");
};

/**
 * Check if user is logged in
 */
export const isUserLoggedIn = (): boolean => {
  return getCookie("isLoggedIn") === "true" && getCookie("adminId") !== null;
};

/**
 * Clear all authentication cookies (logout)
 */
export const clearAuthData = (): void => {
  deleteCookie("adminId");
  deleteCookie("adminName");
  deleteCookie("email");
  deleteCookie("isLoggedIn");
};

/**
 * Migrate data from localStorage to cookies (one-time migration)
 */
export const migrateFromLocalStorage = (): void => {
  const localAdminId = localStorage.getItem("adminId");
  const localAdminName = localStorage.getItem("adminName");
  const localEmail = localStorage.getItem("email");
  const localIsLoggedIn = localStorage.getItem("isLoggedIn");

  if (localAdminId && localEmail && localIsLoggedIn === "true") {
    setAuthData({
      adminId: localAdminId,
      adminName: localAdminName || "",
      email: localEmail,
      isLoggedIn: true,
    });

    // Clear localStorage after migration
    localStorage.removeItem("adminId");
    localStorage.removeItem("adminName");
    localStorage.removeItem("email");
    localStorage.removeItem("isLoggedIn");

    console.log(
      "✅ Successfully migrated auth data from localStorage to cookies"
    );
  }
};
