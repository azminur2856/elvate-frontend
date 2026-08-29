"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import { formatDate, formatMoney } from "@/lib/format";
import { useDebounce } from "@/hooks/useDebounce";
import { PageShell } from "@/components/shared/PageShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const IMAGEKIT = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
const PAGE_SIZE = 10;

type User = {
  id: string;
  firstName: string;
  lastName?: string;
  dob?: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  profileImage: string;
  createdAt: string;
  totalPaid: number;
};

type SortBy = "firstName" | "createdAt";
type FieldKey = keyof User;

const mandatoryFields: { key: FieldKey; label: string }[] = [
  { key: "firstName", label: "First name" },
  { key: "lastName", label: "Last name" },
  { key: "email", label: "Email" },
];

const optionalFields: { key: FieldKey; label: string }[] = [
  { key: "dob", label: "Date of birth" },
  { key: "phone", label: "Phone" },
  { key: "role", label: "Role" },
  { key: "isActive", label: "Active" },
  { key: "isEmailVerified", label: "Email verified" },
  { key: "isPhoneVerified", label: "Phone verified" },
  { key: "profileImage", label: "Profile image" },
  { key: "createdAt", label: "Created at" },
  { key: "totalPaid", label: "Total paid" },
];

function photoUrl(user: User): string | undefined {
  if (!user.profileImage) return undefined;
  if (user.profileImage.startsWith("http")) return user.profileImage;
  if (!IMAGEKIT) return undefined;
  if (user.profileImage === "profile.png") {
    return `${IMAGEKIT}/user_profile_image/${user.profileImage}`;
  }
  return `${IMAGEKIT}/user_profile_image/user_${user.id}/${user.profileImage}`;
}

function fieldValue(user: User, key: FieldKey): string {
  const v = user[key];
  if (key === "createdAt") return formatDate(user.createdAt);
  if (key === "dob") return formatDate(user.dob);
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (key === "totalPaid") return formatMoney(user.totalPaid);
  return v == null ? "" : String(v);
}

export default function ViewUsersClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortBy>("firstName");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [loading, setLoading] = useState(false);

  const [printUser, setPrintUser] = useState<User | null>(null);
  const [printFields, setPrintFields] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [exporting, setExporting] = useState(false);
  const printRef = useRef<HTMLDivElement | null>(null);

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

  const openPrint = (user: User) => {
    const state: Partial<Record<FieldKey, boolean>> = {};
    mandatoryFields.forEach((f) => (state[f.key] = true));
    optionalFields.forEach((f) => (state[f.key] = f.key === "profileImage"));
    setPrintFields(state);
    setPrintUser(user);
  };

  const downloadPdf = async () => {
    if (!printRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(printRef.current, {
        backgroundColor: "#fff",
        scale: 2,
        useCORS: true,
      });
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save("user-details.pdf");
      setPrintUser(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not generate the PDF."));
    } finally {
      setExporting(false);
    }
  };

  const columns: DataTableColumn<User>[] = [
    { key: "sl", header: "#", align: "center", className: "w-12 text-muted-foreground", cell: (_, i) => (page - 1) * PAGE_SIZE + i + 1 },
    { key: "name", header: "Name", cell: (u) => <span className="font-medium">{u.firstName} {u.lastName}</span> },
    { key: "email", header: "Email", cell: (u) => u.email },
    { key: "totalPaid", header: "Total paid", numeric: true, cell: (u) => formatMoney(u.totalPaid) },
    { key: "active", header: "Active", align: "center", cell: (u) => <StatusBadge ok={u.isActive} /> },
    { key: "emailVerified", header: "Email verified", align: "center", cell: (u) => <StatusBadge ok={u.isEmailVerified} /> },
    { key: "phoneVerified", header: "Phone verified", align: "center", cell: (u) => <StatusBadge ok={u.isPhoneVerified} /> },
    { key: "phone", header: "Phone", cell: (u) => u.phone || "—" },
    { key: "role", header: "Role", cell: (u) => <Badge variant="secondary">{u.role}</Badge> },
    { key: "created", header: "Created", cell: (u) => <span className="text-muted-foreground">{formatDate(u.createdAt)}</span> },
    {
      key: "download",
      header: "Export",
      align: "center",
      cell: (u) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Download details for ${u.firstName} ${u.lastName ?? ""}`}
              onClick={() => openPrint(u)}
            >
              <Download aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Download PDF</TooltipContent>
        </Tooltip>
      ),
    },
  ];

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <PageShell
      width="xl"
      title="Users"
      description={`${total} user${total === 1 ? "" : "s"}`}
      actions={
        <div className="flex flex-wrap items-end gap-2">
          <div className="grid gap-1.5">
            <Label htmlFor="search" className="sr-only">Search by name or email</Label>
            <Input
              id="search"
              type="search"
              placeholder="Search name or email…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-56"
              autoComplete="off"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="sortBy" className="sr-only">Sort by</Label>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
              <SelectTrigger id="sortBy" className="w-40"><SelectValue /></SelectTrigger>
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
      <PaginationControls className="mt-6" page={page} totalPages={totalPages} onPageChange={setPage} />

      <Dialog open={Boolean(printUser)} onOpenChange={(o) => !o && !exporting && setPrintUser(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Export user details</DialogTitle>
            <DialogDescription>Choose the fields to include, then download the PDF.</DialogDescription>
          </DialogHeader>
          {printUser ? (
            <div className="grid gap-6 md:grid-cols-[minmax(280px,340px)_1fr]">
              {/* Print preview: literal colours on purpose — html2canvas renders this
                  exact box and the PDF must be white regardless of the site theme. */}
              <div
                ref={printRef}
                style={{
                  background: "#fff",
                  color: "#111",
                  borderRadius: 12,
                  boxShadow: "0 0 10px rgba(0,0,0,0.13)",
                  padding: 24,
                  fontFamily: "Arial, sans-serif",
                }}
              >
                {printFields.profileImage && photoUrl(printUser) ? (
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoUrl(printUser)}
                      alt={`Profile photo of ${printUser.firstName}`}
                      width={100}
                      height={100}
                      style={{ borderRadius: 12, border: "1px solid #ddd", objectFit: "cover" }}
                    />
                  </div>
                ) : null}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[...mandatoryFields, ...optionalFields].map((f) =>
                    !printFields[f.key] || f.key === "profileImage" ? null : (
                      <div key={f.key} style={{ display: "flex", gap: 8, fontSize: 15, lineHeight: 1.4 }}>
                        <span style={{ fontWeight: 600 }}>{f.label}:</span>
                        <span>{fieldValue(printUser, f.key)}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <fieldset className="flex max-h-[420px] flex-col gap-2 overflow-y-auto">
                <legend className="mb-2 text-sm font-medium">Fields to include</legend>
                {mandatoryFields.map((f) => (
                  <div key={f.key} className="flex items-center gap-2">
                    <Checkbox id={`field-${f.key}`} checked disabled />
                    <Label htmlFor={`field-${f.key}`} className="font-normal">
                      {f.label} <span className="text-xs text-muted-foreground">(required)</span>
                    </Label>
                  </div>
                ))}
                {optionalFields.map((f) => (
                  <div key={f.key} className="flex items-center gap-2">
                    <Checkbox
                      id={`field-${f.key}`}
                      checked={Boolean(printFields[f.key])}
                      onCheckedChange={(v) => setPrintFields((p) => ({ ...p, [f.key]: v === true }))}
                    />
                    <Label htmlFor={`field-${f.key}`} className="font-normal">{f.label}</Label>
                  </div>
                ))}
                <Button className="mt-4" onClick={downloadPdf} loading={exporting}>
                  <Download aria-hidden="true" />
                  Download PDF
                </Button>
              </fieldset>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
