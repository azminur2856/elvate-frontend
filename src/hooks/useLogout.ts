"use client";

import { useCallback, useState } from "react";
import api from "@/lib/authAxios";

/** Single logout path for every menu. Always ends on /login. */
export function useLogout() {
  const [loading, setLoading] = useState(false);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await api.post("auth/logout");
    } catch {
      // The session cookie is cleared server-side even on failure paths;
      // navigating to /login is the correct outcome either way.
    } finally {
      window.location.assign("/login");
    }
  }, []);

  return { logout, loading };
}
