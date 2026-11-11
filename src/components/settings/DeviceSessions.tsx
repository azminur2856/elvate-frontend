"use client";

import { useEffect, useState } from "react";
import { LogOut, Monitor, Smartphone } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import type { DeviceSession } from "@/types/commerce";
import { LocalTime } from "@/components/shared/LocalTime";
import { FormMessage } from "@/components/forms/FormMessage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";

const METHOD_LABELS: Record<string, string> = {
  LOCAL: "Password",
  PASSWORD: "Password",
  EMAIL: "Password",
  GOOGLE: "Google",
  FACE: "Face login",
};

/** Rough "Chrome on Windows" from a user-agent string. */
export function describeAgent(ua: string | null): { label: string; mobile: boolean } {
  if (!ua) return { label: "Unknown device", mobile: false };
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\/|Opera/.test(ua)
      ? "Opera"
      : /Firefox\//.test(ua)
        ? "Firefox"
        : /Chrome\//.test(ua)
          ? "Chrome"
          : /Safari\//.test(ua)
            ? "Safari"
            : "Browser";
  const os = /Windows/.test(ua)
    ? "Windows"
    : /Android/.test(ua)
      ? "Android"
      : /iPhone|iPad|iPod/.test(ua)
        ? "iOS"
        : /Mac OS X|Macintosh/.test(ua)
          ? "macOS"
          : /Linux/.test(ua)
            ? "Linux"
            : "";
  return { label: os ? `${browser} on ${os}` : browser, mobile: /Mobi|Android|iPhone|iPad/.test(ua) };
}

/** Active sign-ins (`/auth/sessions`) with revoke + "log out everywhere". */
export function DeviceSessions() {
  const [sessions, setSessions] = useState<DeviceSession[] | null>(null);
  const [error, setError] = useState("");
  const [revoking, setRevoking] = useState<DeviceSession | null>(null);
  const [allOpen, setAllOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get<DeviceSession[]>("/auth/sessions")
      .then((res) => {
        if (cancelled) return;
        // Current device first, then most recently used.
        setSessions(
          [...res.data].sort(
            (a, b) => Number(b.current) - Number(a.current) || b.lastUsedAt.localeCompare(a.lastUsedAt)
          )
        );
      })
      .catch((err) => {
        if (cancelled) return;
        setSessions([]);
        setError(getErrorMessage(err, "Could not load your devices."));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const revoke = async () => {
    if (!revoking) return;
    setBusy(true);
    try {
      await api.delete(`/auth/sessions/${revoking.id}`);
      if (revoking.current) {
        // This device's cookie was cleared by the server.
        window.location.assign("/login");
        return;
      }
      setSessions((s) => (s ?? []).filter((x) => x.id !== revoking.id));
      toast.success("Device signed out.");
      setRevoking(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not sign that device out."));
    } finally {
      setBusy(false);
    }
  };

  const logoutAll = async () => {
    setBusy(true);
    try {
      await api.post("/auth/logout-all");
      window.location.assign("/login");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not sign out everywhere."));
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-4">
      {error ? <FormMessage variant="error">{error}</FormMessage> : null}
      {sessions === null ? (
        <div role="status" aria-label="Loading devices" className="grid gap-3">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
      ) : sessions.length ? (
        <ul className="divide-y rounded-xl border">
          {sessions.map((s) => {
            const agent = describeAgent(s.userAgent);
            const Icon = agent.mobile ? Smartphone : Monitor;
            return (
              <li key={s.id} className="flex flex-wrap items-center gap-3 p-4">
                <Icon aria-hidden="true" className="size-5 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-medium">
                    {agent.label}
                    {s.current ? <Badge variant="success">This device</Badge> : null}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {METHOD_LABELS[s.loginMethod?.toUpperCase()] ?? s.loginMethod} · signed in{" "}
                    <LocalTime value={s.createdAt} /> · last active <LocalTime value={s.lastUsedAt} mode="datetime" />
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setRevoking(s)}>
                  <LogOut aria-hidden="true" />
                  {s.current ? "Sign out" : "Revoke"}
                  <span className="sr-only"> {agent.label}</span>
                </Button>
              </li>
            );
          })}
        </ul>
      ) : !error ? (
        <p className="text-sm text-muted-foreground">No active sessions found.</p>
      ) : null}

      <Button variant="outline" className="justify-self-start" onClick={() => setAllOpen(true)}>
        <LogOut aria-hidden="true" />
        Log out of all devices
      </Button>

      <ConfirmDialog
        open={revoking !== null}
        onOpenChange={(o) => !o && !busy && setRevoking(null)}
        title={revoking?.current ? "Sign out of this device?" : "Sign this device out?"}
        description={
          revoking?.current
            ? "You'll go back to the login page."
            : "That browser will have to log in again the next time it opens Elvate."
        }
        confirmLabel={revoking?.current ? "Sign out" : "Revoke"}
        destructive
        loading={busy}
        onConfirm={revoke}
      />
      <ConfirmDialog
        open={allOpen}
        onOpenChange={(o) => !busy && setAllOpen(o)}
        title="Log out of all devices?"
        description="Every browser, including this one, will have to log in again."
        confirmLabel="Log out everywhere"
        destructive
        loading={busy}
        onConfirm={logoutAll}
      />
    </div>
  );
}
