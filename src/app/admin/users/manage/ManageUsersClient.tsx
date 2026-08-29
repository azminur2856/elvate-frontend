"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import { Role } from "@/lib/enums/role.enum";
import { useDebounce } from "@/hooks/useDebounce";
import { PageShell } from "@/components/shared/PageShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaginationControls } from "@/components/ui/pagination-controls";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type User = {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  role: Role;
  isActive: boolean;
};

type Action = "role" | "status" | "delete";
type SortBy = "firstName" | "createdAt";

const PAGE_SIZE = 10;

function fullName(u: User) {
  return `${u.firstName} ${u.lastName ?? ""}`.trim();
}

export default function ManageUsersClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [sortBy, setSortBy] = useState<SortBy>("firstName");
  const [loading, setLoading] = useState(false);

  const [pending, setPending] = useState<{ user: User; action: Action } | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role>(Role.BUYER);
  const [acting, setActing] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/users/getAllUsersWithTotalPaid", {
        params: { page, pageSize: PAGE_SIZE, sortBy, search: debouncedSearch },
      });
      setUsers(res.data.users);
      setTotal(res.data.total);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load users."));
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, debouncedSearch]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const open = (user: User, action: Action) => {
    if (action === "role") setSelectedRole(user.role);
    setPending({ user, action });
  };

  const confirm = async () => {
    if (!pending) return;
    const { user, action } = pending;
    setActing(true);
    try {
      if (action === "delete") {
        await api.delete(`/users/deleteUser/${user.id}`);
        toast.success("User deleted.");
      } else if (action === "status") {
        await api.patch(`/users/updateUserStatus/${user.id}`, {
          status: (!user.isActive).toString(),
        });
        toast.success("User status updated.");
      } else {
        await api.patch(`/users/updateUserRole/${user.id}`, { role: selectedRole });
        toast.success("User role updated.");
      }
      setPending(null);
      await fetchUsers();
    } catch (err) {
      toast.error(getErrorMessage(err, "Action failed."));
    } finally {
      setActing(false);
    }
  };

  const columns: DataTableColumn<User>[] = [
    {
      key: "sl",
      header: "#",
      align: "center",
      className: "w-12 text-muted-foreground",
      cell: (_, i) => (page - 1) * PAGE_SIZE + i + 1,
    },
    { key: "name", header: "Name", cell: (u) => <span className="font-medium">{fullName(u)}</span> },
    { key: "email", header: "Email", cell: (u) => u.email },
    {
      key: "role",
      header: "Role",
      align: "center",
      cell: (u) => <Badge variant="secondary">{u.role}</Badge>,
    },
    {
      key: "active",
      header: "Active",
      align: "center",
      cell: (u) => <StatusBadge ok={u.isActive} okLabel="Active" noLabel="Inactive" />,
    },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      cell: (u) => {
        const name = fullName(u);
        return (
          <div className="flex justify-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Change role for ${name}`}
                  onClick={() => open(u, "role")}
                >
                  <Pencil aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Change role</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`${u.isActive ? "Deactivate" : "Activate"} ${name}`}
                  onClick={() => open(u, "status")}
                >
                  {u.isActive ? (
                    <ToggleRight aria-hidden="true" className="text-success" />
                  ) : (
                    <ToggleLeft aria-hidden="true" className="text-muted-foreground" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{u.isActive ? "Deactivate" : "Activate"}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive"
                  aria-label={`Delete ${name}`}
                  onClick={() => open(u, "delete")}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pendingName = pending ? fullName(pending.user) : "";

  return (
    <PageShell
      width="lg"
      title="Manage users"
      description={`${total} user${total === 1 ? "" : "s"}`}
      actions={
        <div className="flex flex-wrap items-end gap-2">
          <div className="grid gap-1.5">
            <Label htmlFor="search" className="sr-only">
              Search by name or email
            </Label>
            <Input
              id="search"
              type="search"
              placeholder="Search name or email…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-56"
              autoComplete="off"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="sortBy" className="sr-only">
              Sort by
            </Label>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
              <SelectTrigger id="sortBy" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="firstName">Name (A–Z)</SelectItem>
                <SelectItem value="createdAt">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      }
    >
      <DataTable
        columns={columns}
        rows={users}
        rowKey={(u) => u.id}
        loading={loading}
        loadingLabel="Loading users"
        emptyMessage="No users found."
        caption="Users"
      />
      <PaginationControls
        className="mt-6"
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <ConfirmDialog
        open={Boolean(pending)}
        onOpenChange={(o) => !o && !acting && setPending(null)}
        loading={acting}
        onConfirm={confirm}
        destructive={pending?.action === "delete"}
        title={
          pending?.action === "delete"
            ? "Delete user?"
            : pending?.action === "status"
            ? `${pending.user.isActive ? "Deactivate" : "Activate"} user?`
            : "Change role"
        }
        confirmLabel={
          pending?.action === "delete"
            ? "Delete"
            : pending?.action === "status"
            ? pending.user.isActive
              ? "Deactivate"
              : "Activate"
            : "Save role"
        }
        description={
          pending?.action === "delete"
            ? `${pendingName} will be permanently deleted. This cannot be undone.`
            : pending?.action === "status"
            ? `${pendingName} will be marked ${pending.user.isActive ? "inactive" : "active"}.`
            : `Choose a new role for ${pendingName}.`
        }
      >
        {pending?.action === "role" ? (
          <div className="grid gap-1.5">
            <Label htmlFor="role">Role</Label>
            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as Role)}>
              <SelectTrigger id="role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(Role).map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </ConfirmDialog>
    </PageShell>
  );
}
