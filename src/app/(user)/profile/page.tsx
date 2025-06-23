"use client";
import api from "@/lib/authAxios";
import { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaPhoneAlt,
  FaEnvelope,
  FaUserCheck,
  FaCamera,
} from "react-icons/fa";
import UpdateUserModal, {
  UpdateUserData,
} from "@/components/modal/UpdateUserModal";
import ChangePasswordModal from "@/components/modal/ChangePasswordModal";
import PhoneVerificationModal from "@/components/modal/PhoneVerificationModal";
import FaceVerificationModal from "@/components/modal/FaceVerificationModal";
import ProfileImageUploadModal from "@/components/modal/ProfileImageUploadModal";

type UserProfile = {
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
  profileImage?: string;
  isFaceVerified?: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  lastLogoutAt?: string;
};

type SubscriptionStatus = {
  isSubscribed: boolean;
  daysLeft: number;
  startDate: string | null;
  endDate: string | null;
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [imgSrc, setImgSrc] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [imgLoading, setImgLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUpdate, setShowUpdate] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [faceModalOpen, setFaceModalOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(
    null
  );

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api
      .get("/users/profile")
      .then((res) => {
        if (!isMounted) return;
        setUser(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Failed to load profile."
        );
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    setImgLoading(true);
    api
      .get("/users/profileImage", { responseType: "blob" })
      .then((res) => {
        const url = URL.createObjectURL(res.data);
        setImgSrc(url);
        setImgLoading(false);
      })
      .catch(() => {
        setImgSrc("/default-profile.png");
        setImgLoading(false);
      });
    return () => {
      if (imgSrc) URL.revokeObjectURL(imgSrc);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    api
      .get("/subscriptions/status")
      .then((res) => setSubscription(res.data))
      .catch(() => setSubscription(null));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900">
        <div className="text-white text-lg">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900">
        <div className="text-red-400 text-lg">{error}</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900 font-sans pt-24">
      <div className="bg-neutral-900/95 border border-neutral-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex flex-col items-center">
          {/* Profile Image */}
          <div className="relative w-32 h-32 mb-4 group flex-shrink-0">
            {imgLoading ? (
              <div className="w-32 h-32 flex items-center justify-center rounded-full bg-neutral-800 text-gray-400 text-xl">
                Loading...
              </div>
            ) : (
              <img
                src={imgSrc}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-2 border-blue-700 bg-neutral-800"
                onError={(e) => (e.currentTarget.src = "/default-profile.png")}
              />
            )}
            {user.isActive && (
              <div
                className="absolute bottom-2 right-3 w-6 h-6 rounded-full bg-green-400 border-2 border-white shadow-md flex items-center justify-center"
                title="Active"
              >
                {/* <FaCheckCircle className="text-white" size={30} /> */}
              </div>
            )}

            {/* Camera overlay button */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/0 group-hover:bg-black/60 transition opacity-0 group-hover:opacity-100 text-white font-semibold z-10 focus:outline-none"
              style={{ fontSize: 16, cursor: "pointer" }}
              aria-label="Change Profile Picture"
              type="button"
            >
              <FaCamera size={28} className="mb-1" />
              <span className="text-sm">Change</span>
            </button>
          </div>

          <h2 className="text-3xl font-bold text-white mb-1 text-center">
            {(user.firstName + " " + (user.lastName || "")).toUpperCase()}
          </h2>

          {/* Email and Phone Side by Side */}
          <div className="flex w-full gap-3 mb-4 mt-2 justify-center">
            <div className="flex flex-col items-center w-1/2">
              <span className="flex items-center text-gray-200">
                <FaEnvelope className="mr-2" /> {user.email}
              </span>
              <span
                className={`mt-1 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${
                  user.isEmailVerified
                    ? "bg-green-700 text-green-100"
                    : "bg-red-800 text-red-200"
                }`}
                title={user.isEmailVerified ? "Email Verified" : "Not Verified"}
              >
                {user.isEmailVerified ? (
                  <>
                    <FaCheckCircle size={13} /> Verified
                  </>
                ) : (
                  <>
                    <FaTimesCircle size={13} /> Not Verified
                  </>
                )}
              </span>
            </div>
            <div className="flex flex-col items-center w-1/2">
              <span className="flex items-center text-gray-200">
                <FaPhoneAlt className="mr-2" />
                {user.phone || (
                  <span className="italic text-gray-500">N/A</span>
                )}
              </span>
              {user.phone && (
                <span
                  className={`mt-1 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${
                    user.isPhoneVerified
                      ? "bg-blue-700 text-blue-100"
                      : "bg-red-800 text-red-200"
                  }`}
                  title={
                    user.isPhoneVerified ? "Phone Verified" : "Not Verified"
                  }
                >
                  {user.isPhoneVerified ? (
                    <>
                      <FaCheckCircle size={13} /> Verified
                    </>
                  ) : (
                    <>
                      <FaTimesCircle size={13} /> Not Verified
                    </>
                  )}
                </span>
              )}
              {user.phone && !user.isPhoneVerified && (
                <button
                  onClick={() => setPhoneModalOpen(true)}
                  className="ml-2 text-xs underline text-blue-400 hover:text-blue-300 hover:cursor-pointer"
                  type="button"
                >
                  Verify now
                </button>
              )}
            </div>
          </div>

          {/* Profile Details Table */}
          <table className="w-full text-left text-gray-300 mb-2">
            <tbody>
              <tr>
                <td className="py-1">DOB:</td>
                <td>
                  {user.dob ? (
                    new Date(user.dob).toLocaleDateString()
                  ) : (
                    <span className="italic text-gray-500">N/A</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="py-1">Role:</td>
                <td className="capitalize">{user.role}</td>
              </tr>
              <tr>
                <td className="py-1">Subscription:</td>
                <td>
                  {subscription ? (
                    subscription.isSubscribed ? (
                      <>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-700 text-green-100">
                          <FaCheckCircle size={13} />
                          Active&nbsp;–&nbsp;{subscription.daysLeft} day
                          {subscription.daysLeft > 1 ? "s" : ""} left
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-800 text-red-200">
                          <FaTimesCircle size={13} /> Not Subscribed
                        </span>
                        <button
                          className="ml-2 text-xs underline text-blue-400 hover:text-blue-300 hover:cursor-pointer"
                          onClick={() =>
                            (window.location.href = "/subscription")
                          }
                          type="button"
                        >
                          Subscribe
                        </button>
                      </>
                    )
                  ) : (
                    <span className="italic text-gray-500">Loading...</span>
                  )}
                  {subscription && subscription.isSubscribed && (
                    <span className="block text-xs text-gray-400 mt-1">
                      {subscription.startDate && (
                        <>
                          {/* From{" "}
                          {new Date(
                            subscription.startDate
                          ).toLocaleDateString()}{" "}
                        </>
                      )}
                      {subscription.endDate && (
                        <>
                          to{" "}
                          {new Date(subscription.endDate).toLocaleDateString()} */}
                        </>
                      )}
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="py-1">Face Status:</td>
                <td>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      user.isFaceVerified
                        ? "bg-blue-700 text-blue-100"
                        : "bg-red-800 text-red-200"
                    }`}
                  >
                    {user.isFaceVerified ? (
                      <>
                        <FaUserCheck size={14} /> Verified
                      </>
                    ) : (
                      <>
                        <FaTimesCircle size={14} /> Not Verified
                      </>
                    )}
                  </span>
                  {!user.isFaceVerified && (
                    <button
                      className="ml-2 text-xs underline text-blue-400 hover:text-blue-300 hover:cursor-pointer"
                      onClick={() => setFaceModalOpen(true)}
                      type="button"
                    >
                      Verify Face
                    </button>
                  )}
                </td>
              </tr>
              <tr>
                <td className="py-1">Created:</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td className="py-1">Last Login:</td>
                <td>
                  {user.lastLoginAt ? (
                    new Date(user.lastLoginAt).toLocaleString()
                  ) : (
                    <span className="italic text-gray-500">N/A</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="py-1">Last Logout:</td>
                <td>
                  {user.lastLogoutAt ? (
                    new Date(user.lastLogoutAt).toLocaleString()
                  ) : (
                    <span className="italic text-gray-500">N/A</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="flex gap-3 mt-2 w-full">
            <button
              onClick={() => setShowUpdate(true)}
              className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded-lg transition hover:cursor-pointer"
            >
              Update Profile
            </button>
            <button
              onClick={() => setShowChangePassword(true)}
              className="flex-1 bg-neutral-700 hover:bg-neutral-800 text-white font-semibold px-4 py-2 rounded-lg transition hover:cursor-pointer"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
      {/* Update User Modal */}
      {user && (
        <UpdateUserModal
          open={showUpdate}
          onClose={() => setShowUpdate(false)}
          user={{
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
          }}
          onSuccess={() => {
            // Refetch user after update
            api.get("/users/profile").then((res) => setUser(res.data));
          }}
        />
      )}
      {/* Change Password Modal */}
      <ChangePasswordModal
        open={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
      {/* Phone Verification Modal */}
      <PhoneVerificationModal
        open={phoneModalOpen}
        onClose={() => setPhoneModalOpen(false)}
        phone={user.phone || ""}
        // Optional: pass onVerified={() => window.location.reload()} to refresh after success
        onVerified={() => {
          api.get("/users/profile").then((res) => setUser(res.data));
        }}
      />
      {/* Face Verification Modal */}
      <FaceVerificationModal
        open={faceModalOpen}
        onClose={() => setFaceModalOpen(false)}
        onVerified={() => {
          api.get("/users/profile").then((res) => setUser(res.data));
        }}
      />
      {/* Profile Image Upload Modal */}
      <ProfileImageUploadModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSuccess={() => {
          // Refresh profile image or data here (call refetch etc)
          window.location.reload();
        }}
      />
    </div>
  );
}
