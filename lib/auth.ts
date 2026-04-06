/**
 * Token management utility to centralize authentication logic
 */
export const AUTH_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER: "user",
} as const;

export const authStorage = {
  getAccessToken: () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(AUTH_KEYS.ACCESS_TOKEN);
  },
  getRefreshToken: () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(AUTH_KEYS.REFRESH_TOKEN);
  },
  getUser: () => {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem(AUTH_KEYS.USER);
    return user ? JSON.parse(user) : null;
  },
  setTokens: (accessToken: string, refreshToken: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(AUTH_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(AUTH_KEYS.REFRESH_TOKEN, refreshToken);
  },
  setUser: (user: any) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(user));
  },
  clearAuth: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(AUTH_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(AUTH_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(AUTH_KEYS.USER);
  },
  isAuthenticated: () => {
    return !!authStorage.getAccessToken();
  },
};
