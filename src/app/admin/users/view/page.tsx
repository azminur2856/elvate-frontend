"use client";
import { useEffect, useRef, useState } from "react";
import api from "@/lib/authAxios";
import { FaCheckCircle, FaTimesCircle, FaDownload } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const IMAGEKIT_URL_ENDPOINT = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

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

const mandatoryFields = [
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "email", label: "Email" },
];

const optionalFields = [
  { key: "dob", label: "Date of Birth" },
  { key: "phone", label: "Phone" },
  { key: "role", label: "Role" },
  { key: "isActive", label: "Active" },
  { key: "isEmailVerified", label: "Email Verified" },
  { key: "isPhoneVerified", label: "Phone Verified" },
  { key: "profileImage", label: "Profile Image" },
  { key: "createdAt", label: "Created At" },
  { key: "totalPaid", label: "Total Paid" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState<"firstName" | "createdAt">("firstName");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [printModalUser, setPrintModalUser] = useState<User | null>(null);
  const [printFields, setPrintFields] = useState<{ [key: string]: boolean }>(
    {}
  );
  const printRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [page, sortBy, search]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await api.get("/users/getAllUsersWithTotalPaid", {
        params: { page, pageSize, sortBy, search },
      });
      setUsers(res.data.users);
      setTotal(res.data.total);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  function openPrintModal(user: User) {
    const fieldState: { [key: string]: boolean } = {};
    mandatoryFields.forEach((f) => (fieldState[f.key] = true));
    optionalFields.forEach(
      (f) => (fieldState[f.key] = f.key === "profileImage")
    );
    setPrintFields(fieldState);
    setPrintModalUser(user);
  }

  // Download PDF
  async function handleDownloadPDF() {
    if (!printRef.current) return;
    const canvas = await html2canvas(printRef.current, {
      backgroundColor: "#fff",
      scale: 2,
      useCORS: true,
      // Remove all foreign CSS by keeping only inline background/text colors!
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save("user-details.pdf");
    setPrintModalUser(null);
  }

  const totalPages = Math.ceil(total / pageSize);

  const Check = ({ ok }: { ok: boolean }) =>
    ok ? (
      <FaCheckCircle className="text-blue-500 inline align-middle" />
    ) : (
      <FaTimesCircle className="text-red-500 inline align-middle" />
    );

  const getUserPhotoUrl = (user: User) => {
    if (!user.profileImage) return undefined;
    if (user.profileImage.startsWith("http")) return user.profileImage;
    if (!IMAGEKIT_URL_ENDPOINT) return undefined;
    if (user.profileImage === "profile.png") {
      return `${IMAGEKIT_URL_ENDPOINT}/user_profile_image/${user.profileImage}`;
    }
    return `${IMAGEKIT_URL_ENDPOINT}/user_profile_image/user_${user.id}/${user.profileImage}`;
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center py-25 px-2 font-sans">
      <div className="max-w-6xl w-full">
        <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Users</h1>
            <p className="text-neutral-400 text-sm">
              {total} user{total !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-2 items-end">
            <input
              className="px-3 py-2 rounded bg-zinc-900 text-white border border-zinc-700 placeholder:text-zinc-400"
              placeholder="Search name/email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <select
              className="px-2 py-2 rounded bg-zinc-900 text-white border border-zinc-700"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "firstName" | "createdAt")
              }
            >
              <option value="firstName">Name (A-Z)</option>
              <option value="createdAt">Oldest First</option>
            </select>
          </div>
        </div>
        <div className="relative overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-900">
          {loading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
            </div>
          )}
          <table className="min-w-full divide-y divide-neutral-800">
            <thead>
              <tr className="text-neutral-300 bg-neutral-800">
                <th className="px-3 py-2 text-center">#</th>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">Total Paid</th>
                <th className="px-3 py-2 text-center">Active</th>
                <th className="px-3 py-2 text-center">Email Verified</th>
                <th className="px-3 py-2 text-center">Phone Verified</th>
                <th className="px-3 py-2 text-left">Phone</th>
                <th className="px-3 py-2 text-left">Role</th>
                <th className="px-3 py-2 text-left">Created</th>
                <th className="px-3 py-2 text-center">Download</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={12}
                    className="py-8 text-center text-neutral-500"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user, idx) => (
                  <tr
                    key={user.id}
                    className="hover:bg-neutral-800/60 transition-colors"
                  >
                    <td className="px-3 py-2 text-center text-neutral-400">
                      {(page - 1) * pageSize + idx + 1}
                    </td>
                    <td className="px-3 py-2 text-neutral-100 font-semibold">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-3 py-2 text-neutral-100">{user.email}</td>
                    <td className="px-3 py-2 text-neutral-100 font-mono">
                      {user.totalPaid.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Check ok={user.isActive} />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Check ok={user.isEmailVerified} />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Check ok={user.isPhoneVerified} />
                    </td>
                    <td className="px-3 py-2 text-neutral-100">
                      {user.phone || "-"}
                    </td>
                    <td className="px-3 py-2 text-neutral-100">{user.role}</td>
                    <td className="px-3 py-2 text-neutral-100 text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        className="text-blue-500 hover:text-blue-700"
                        onClick={() => openPrintModal(user)}
                        title="Download user details"
                      >
                        <FaDownload size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-6">
          <div className="text-neutral-400 text-sm">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              className="px-4 py-1 rounded bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <button
              className="px-4 py-1 rounded bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* PDF Download Modal */}
      {printModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg p-6 max-w-3xl w-full relative flex flex-col md:flex-row gap-6">
            <button
              className="absolute top-2 right-2 text-neutral-600 dark:text-neutral-300 hover:text-red-500"
              onClick={() => setPrintModalUser(null)}
              aria-label="Close"
            >
              <MdClose size={24} />
            </button>

            {/* PREVIEW */}
            <div
              ref={printRef}
              style={{
                minWidth: 300,
                maxWidth: 350,
                background: "#fff",
                color: "#111",
                borderRadius: 12,
                boxShadow: "0 0 10px #0002",
                marginBottom: 8,
                padding: 24,
                marginRight: 0,
              }}
            >
              {/* Profile Image */}
              {printFields["profileImage"] &&
                printModalUser.profileImage &&
                IMAGEKIT_URL_ENDPOINT && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginBottom: 16,
                    }}
                  >
                    <img
                      src={getUserPhotoUrl(printModalUser)}
                      alt="Profile"
                      width={100}
                      height={100}
                      style={{
                        borderRadius: "12px",
                        border: "1px solid #ddd",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                )}

              {/* User Details */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[...mandatoryFields, ...optionalFields].map((field) => {
                  if (!printFields[field.key] || field.key === "profileImage")
                    return null;
                  return (
                    <div
                      key={field.key}
                      style={{
                        display: "flex",
                        gap: 8,
                        fontSize: 15,
                        lineHeight: 1.4,
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{field.label}:</span>
                      <span>
                        {field.key === "createdAt" && printModalUser[field.key]
                          ? new Date(
                              printModalUser[field.key]!
                            ).toLocaleDateString()
                          : field.key === "isActive" ||
                            field.key === "isEmailVerified" ||
                            field.key === "isPhoneVerified"
                          ? printModalUser[field.key]
                            ? "Yes"
                            : "No"
                          : field.key === "totalPaid"
                          ? printModalUser[field.key]?.toLocaleString(
                              undefined,
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            ) ?? "0.00"
                          : (printModalUser as any)[field.key]?.toString() ??
                            ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SELECTOR */}
            <div className="flex-1 flex flex-col gap-2 text-neutral-800 dark:text-neutral-200 max-h-[400px] overflow-y-auto">
              <h3 className="text-base font-semibold mb-2">
                Select fields to include:
              </h3>
              {mandatoryFields.map((field) => (
                <label
                  key={field.key}
                  htmlFor={`field-checkbox-${field.key}`}
                  className="flex items-center gap-2"
                >
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="accent-blue-500"
                    id={`field-checkbox-${field.key}`}
                    name={field.key}
                  />
                  <span className="font-semibold">{field.label}</span>
                  <span className="ml-1 text-xs text-blue-500">(Required)</span>
                </label>
              ))}
              {optionalFields.map((field) => (
                <label
                  key={field.key}
                  htmlFor={`field-checkbox-${field.key}`}
                  className="flex items-center gap-2"
                >
                  <input
                    type="checkbox"
                    checked={!!printFields[field.key]}
                    onChange={(e) =>
                      setPrintFields((prev) => ({
                        ...prev,
                        [field.key]: e.target.checked,
                      }))
                    }
                    className="accent-blue-500"
                    id={`field-checkbox-${field.key}`}
                    name={field.key}
                  />
                  <span>{field.label}</span>
                </label>
              ))}
              <button
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded flex items-center justify-center gap-2"
                onClick={handleDownloadPDF}
                type="button"
              >
                <FaDownload /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
