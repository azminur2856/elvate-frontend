"use client";

import { useEffect, useId, useState } from "react";
import { Search, UserRound, X } from "lucide-react";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import { useDebounce } from "@/hooks/useDebounce";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export type PickedUser = { id: string; name: string };

type UserRow = { id: string; firstName: string; lastName?: string | null; email: string; role: string };

export const userFullName = (u: { firstName?: string | null; lastName?: string | null }) =>
  `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "Unnamed user";

type UserPickerDialogProps = {
  value: PickedUser | null;
  onChange: (user: PickedUser | null) => void;
  /** Text on the trigger when nothing is picked. */
  placeholder?: string;
  /** Visible label rendered above the trigger. */
  label?: string;
  className?: string;
};

/**
 * Admin-only user filter: a trigger button that opens a searchable list
 * (`/users/getAllUsersWithTotalPaid?search=`). A dialog keeps it simple and
 * fully keyboard / screen-reader friendly.
 */
export function UserPickerDialog({
  value,
  onChange,
  placeholder = "All users",
  label = "User",
  className,
}: UserPickerDialogProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 300);
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    api
      .get<{ users: UserRow[] }>("/users/getAllUsersWithTotalPaid", {
        params: { page: 1, pageSize: 8, sortBy: "firstName", search: debounced || undefined },
      })
      .then((res) => !cancelled && setRows(res.data.users ?? []))
      .catch((err) => {
        if (cancelled) return;
        setRows([]);
        setError(getErrorMessage(err, "Could not load users."));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [open, debounced]);

  return (
    <div className={cn("grid gap-1.5", className)}>
      <span id={`${id}-label`} className="text-sm font-medium leading-none">
        {label}
      </span>
      <div className="flex items-center gap-1">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="min-w-0 flex-1 justify-start font-normal"
              aria-labelledby={`${id}-label ${id}-value`}
            >
              <UserRound aria-hidden="true" className="text-muted-foreground" />
              <span id={`${id}-value`} className={cn("truncate", !value && "text-muted-foreground")}>
                {value ? value.name : placeholder}
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Choose a user</DialogTitle>
              <DialogDescription>Search by name or e-mail.</DialogDescription>
            </DialogHeader>
            <div className="relative">
              <Search aria-hidden="true" className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users"
                aria-label="Search users"
                className="pl-8"
                autoFocus
              />
            </div>
            <div className="min-h-40" aria-live="polite" aria-busy={loading}>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Spinner label="Loading users" />
                </div>
              ) : error ? (
                <p className="py-6 text-center text-sm text-destructive">{error}</p>
              ) : rows.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No users found.</p>
              ) : (
                <ul className="grid gap-1">
                  {rows.map((u) => {
                    const name = userFullName(u);
                    const selected = value?.id === u.id;
                    return (
                      <li key={u.id}>
                        <button
                          type="button"
                          aria-pressed={selected}
                          onClick={() => {
                            onChange({ id: u.id, name });
                            setOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-accent",
                            selected && "bg-accent"
                          )}
                        >
                          <span className="min-w-0">
                            <span className="block truncate font-medium">{name}</span>
                            <span className="block truncate text-xs text-muted-foreground">{u.email}</span>
                          </span>
                          <Badge variant="secondary">{u.role}</Badge>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </DialogContent>
        </Dialog>
        {value ? (
          <Button type="button" variant="ghost" size="icon" onClick={() => onChange(null)} aria-label={`Clear user filter (${value.name})`}>
            <X aria-hidden="true" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
