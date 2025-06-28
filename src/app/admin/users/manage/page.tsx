"use client";
import { useEffect, useState } from "react";
import api from "@/lib/authAxios";
import { toast } from "react-hot-toast";
import {
  MdOutlineEdit,
  MdDelete,
  MdToggleOn,
  MdToggleOff,
} from "react-icons/md";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { Role } from "@/lib/enums/role.enum";

type User = {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  role: Role;
  isActive: boolean;
};

type ModalAction = "role" | "status" | "delete" | null;

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"firstName" | "createdAt">("firstName");
  const [loading, setLoading] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalUser, setModalUser] = useState<User | null>(null);
  const [modalAction, setModalAction] = useState<ModalAction>(null);

  // For role update modal
  const [selectedRole, setSelectedRole] = useState<Role>(Role.BUYER);

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

  // Modal openers
  function openModal(user: User, action: ModalAction) {
    setModalUser(user);
    setModalAction(action);
    if (action === "role") {
      setSelectedRole(user.role);
    }
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setModalUser(null);
    setModalAction(null);
  }

  // Action handlers
  async function handleConfirmAction() {
    if (!modalUser || !modalAction) return;
    try {
      if (modalAction === "delete") {
        await api.delete(`/users/deleteUser/${modalUser.id}`);
        toast.success("User deleted.");
      }
      if (modalAction === "status") {
        await api.patch(`/users/updateUserStatus/${modalUser.id}`, {
          status: (!modalUser.isActive).toString(),
        });
        toast.success("User status updated.");
      }
      if (modalAction === "role") {
        await api.patch(`/users/updateUserRole/${modalUser.id}`, {
          role: selectedRole,
        });
        toast.success("User role updated.");
      }
      closeModal();
      fetchUsers();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Action failed.");
    }
  }

  // Pagination
  const totalPages = Math.ceil(total / pageSize);

  // Helper: Blue check or red cross icon
  const Check = ({ ok }: { ok: boolean }) =>
    ok ? (
      <FaCheckCircle className="text-blue-500 inline align-middle" />
    ) : (
      <FaTimesCircle className="text-red-500 inline align-middle" />
    );

  return (
    <div className="min-h-screen bg-black flex flex-col items-center py-25 px-2 font-sans">
      <div className="max-w-4xl w-full">
        <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Manage Users</h1>
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
              id="search"
              name="search"
              autoComplete="off"
            />
            <select
              className="px-2 py-2 rounded bg-zinc-900 text-white border border-zinc-700"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "firstName" | "createdAt")
              }
              id="sortBy"
              name="sortBy"
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
                <th className="px-3 py-2 text-center">SL</th>
                <th className="px-3 py-2 text-left">Full Name</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-center">Role</th>
                <th className="px-3 py-2 text-center">Active</th>
                <th className="px-3 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-500">
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
                    <td className="px-3 py-2 text-center">
                      <span className="px-2 py-1 bg-zinc-800 rounded text-xs font-semibold">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Check ok={user.isActive} />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          title="Change Role"
                          className="text-yellow-500 hover:text-yellow-700"
                          onClick={() => openModal(user, "role")}
                        >
                          <MdOutlineEdit size={20} />
                        </button>
                        <button
                          title="Change Status"
                          className={
                            user.isActive
                              ? "text-green-600 hover:text-green-800"
                              : "text-zinc-400 hover:text-green-500"
                          }
                          onClick={() => openModal(user, "status")}
                        >
                          {user.isActive ? (
                            <MdToggleOn size={22} />
                          ) : (
                            <MdToggleOff size={22} />
                          )}
                        </button>
                        <button
                          title="Delete User"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => openModal(user, "delete")}
                        >
                          <MdDelete size={20} />
                        </button>
                      </div>
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

      {/* Modal */}
      {modalOpen && modalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 max-w-xs w-full relative">
            <button
              className="absolute top-2 right-2 text-neutral-600 hover:text-red-500"
              onClick={closeModal}
              aria-label="Close modal"
            >
              ✕
            </button>
            <div className="text-neutral-900 dark:text-neutral-200">
              {modalAction === "delete" && (
                <>
                  <h2 className="text-lg font-bold mb-2">Delete User?</h2>
                  <p>
                    Are you sure you want to{" "}
                    <span className="text-red-500">delete</span> <br />
                    <span className="font-bold">
                      {modalUser.firstName} {modalUser.lastName}
                    </span>
                    ?<br />
                    This action cannot be undone!
                  </p>
                </>
              )}
              {modalAction === "status" && (
                <>
                  <h2 className="text-lg font-bold mb-2">Change Status</h2>
                  <p>
                    Are you sure you want to set this user as <br />
                    <span
                      className={
                        modalUser.isActive
                          ? "text-zinc-700 dark:text-zinc-200"
                          : "text-green-500 font-semibold"
                      }
                    >
                      {modalUser.isActive ? "Inactive" : "Active"}
                    </span>
                    ?
                  </p>
                </>
              )}
              {modalAction === "role" && (
                <>
                  <h2 className="text-lg font-bold mb-2">Change Role</h2>
                  <p>
                    Change role for{" "}
                    <span className="font-bold">
                      {modalUser.firstName} {modalUser.lastName}
                    </span>
                    :
                  </p>
                  <select
                    className="mt-3 block w-full px-2 py-2 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as Role)}
                  >
                    {Object.values(Role).map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </>
              )}
              <div className="flex gap-3 mt-6">
                <button
                  className="flex-1 py-2 rounded bg-zinc-800 dark:bg-zinc-200 text-white dark:text-black font-bold hover:bg-zinc-700 dark:hover:bg-zinc-300"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  className={`flex-1 py-2 rounded text-white font-bold ${
                    modalAction === "delete"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  onClick={handleConfirmAction}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
