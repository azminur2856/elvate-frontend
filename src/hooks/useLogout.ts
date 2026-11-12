"use client";

import { useCallback, useState } from "react";
import api from "@/lib/authAxios";
import { loginHref } from "@/lib/redirect";

/**
 * Single logout path for every menu. Always ends on /login; pass `next` to
 * come back to a page after signing in again (e.g. face setup, FE-26).
 */
export function useLogout() {
  const [loading, setLoading] = useState(false);

  const logout = useCallback(async (next?: string) => {
    setLoading(true);
    try {
      await api.post("auth/logout");
    } catch {
      // The session cookie is cleared server-side even on failure paths;
      // navigating to /login is the correct outcome either way.
    } finally {
      window.location.assign(next ? loginHref(next) : "/login");
    }
  }, []);

  return { logout, loading };
}
