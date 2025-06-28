"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaSearch, FaUser, FaShoppingCart, FaUserShield } from "react-icons/fa";
import { HiOutlineSquares2X2 } from "react-icons/hi2";
import { cn } from "@/lib/utils";
import { HoveredLink, Menu, MenuItem } from "@/components/ui/navbar-menu";
import type { Session } from "@/lib/session";
import { Role } from "@/lib/enums/role.enum"; // <-- use the enum here!
import api from "@/lib/authAxios";

const BREAKPOINT = 1300; // px

type Props = {
  className?: string;
  session: Session | null;
};

const IMAGEKIT_URL_ENDPOINT = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

const NavbarClient = ({ className, session }: Props) => {
  const [active, setActive] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  // Helper for admin
  const isAdmin = session?.user?.role === Role.ADMIN;

  // Responsive state
  useEffect(() => {
    const handleResize = () => {
      setIsCompact(window.innerWidth <= BREAKPOINT);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Click away for dropdowns
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest("#user-dropdown") && !t.closest("#user-btn") && showUser)
        setShowUser(false);
      if (!t.closest("#menu-dropdown") && !t.closest("#menu-btn") && showMenu)
        setShowMenu(false);
    };
    if (showUser || showMenu) {
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }
  }, [showUser, showMenu]);

  // User image URL logic
  let userImage: string | undefined = undefined;
  if (
    session?.user?.id &&
    session?.user?.profileImage &&
    IMAGEKIT_URL_ENDPOINT
  ) {
    if (session.user.profileImage === "profile.png") {
      userImage = `${IMAGEKIT_URL_ENDPOINT}/user_profile_image/${session.user.profileImage}`;
    } else {
      userImage = `${IMAGEKIT_URL_ENDPOINT}/user_profile_image/user_${session.user.id}/${session.user.profileImage}`;
    }
  }

  return (
    <header
      className={cn(
        "fixed top-4 inset-x-0 z-50 px-4 md:px-16 flex items-center",
        className
      )}
    >
      {/* LEFT: Logo */}
      <div className="flex-1 text-left min-w-0">
        <Link href="/" className="flex items-center space-x-1">
          <span className="text-xl italic font-medium text-white">Elvate</span>
        </Link>
      </div>

      {/* MIDDLE: Menu */}
      <div className="flex-[2] flex justify-center min-w-0">
        {isAdmin ? (
          // ADMIN MENU
          <Menu setActive={setActive}>
            {/* Home */}
            <Link href={"/"}>
              <MenuItem setActive={setActive} active={active} item="Home" />
            </Link>
            {/* Manage Users */}
            <MenuItem setActive={setActive} active={active} item="Users">
              <div className="flex flex-col space-y-4 text-sm">
                <Link href="/admin/users/view">
                  <HoveredLink>View Users</HoveredLink>
                </Link>
                <Link href="/admin/users/manage">
                  <HoveredLink>Manage Users</HoveredLink>
                </Link>
                <Link href="/admin/users/stats">
                  <HoveredLink>View Stats</HoveredLink>
                </Link>
              </div>
            </MenuItem>
            {/* Manage Products */}
            <MenuItem setActive={setActive} active={active} item="Products">
              <div className="flex flex-col space-y-4 text-sm">
                <Link href="/admin/products/view">
                  <HoveredLink>View Products</HoveredLink>
                </Link>
                <Link href="/admin/products/categories">
                  <HoveredLink>Manage Categories</HoveredLink>
                </Link>
              </div>
            </MenuItem>
            {/* Manage Orders */}
            <MenuItem setActive={setActive} active={active} item="Orders">
              <div className="flex flex-col space-y-4 text-sm">
                <Link href="/admin/orders/view">
                  <HoveredLink>View Orders</HoveredLink>
                </Link>
                <Link href="/admin/orders/stats">
                  <HoveredLink>View Stats</HoveredLink>
                </Link>
              </div>
            </MenuItem>
            {/* Manage Subscriptions */}
            <MenuItem setActive={setActive} active={active} item="Subscription">
              <div className="flex flex-col space-y-4 text-sm">
                <Link href="/admin/subscription/history">
                  <HoveredLink>View Subscription History</HoveredLink>
                </Link>
                <Link href="/admin/subscription/stats">
                  <HoveredLink>View Stats</HoveredLink>
                </Link>
              </div>
            </MenuItem>
            {/* payment */}
            <MenuItem setActive={setActive} active={active} item="Payment">
              <div className="flex flex-col space-y-4 text-sm">
                <Link href="/admin/payment/history">
                  <HoveredLink>View Payment History</HoveredLink>
                </Link>
                <Link href="/admin/payment/stats">
                  <HoveredLink>View Stats</HoveredLink>
                </Link>
              </div>
            </MenuItem>
            {/* Activity Logs */}
            <MenuItem setActive={setActive} active={active} item="Activity">
              <div className="flex flex-col space-y-4 text-sm">
                <Link href="/admin/activity/logs">
                  <HoveredLink>View Logs</HoveredLink>
                </Link>
                <Link href="/admin/activity/stats">
                  <HoveredLink>View Stats</HoveredLink>
                </Link>
              </div>
            </MenuItem>
          </Menu>
        ) : (
          // USER MENU and GUEST MENU
          <Menu setActive={setActive}>
            <Link href={"/"}>
              <MenuItem setActive={setActive} active={active} item="Home" />
            </Link>
            <MenuItem setActive={setActive} active={active} item="Shop">
              <div className="flex flex-col space-y-4 text-sm">
                <Link href="/shop/men">
                  <HoveredLink>Men</HoveredLink>
                </Link>
                <Link href="/shop/women">
                  <HoveredLink>Women</HoveredLink>
                </Link>
                <Link href="/shop/children">
                  <HoveredLink>Children</HoveredLink>
                </Link>
              </div>
            </MenuItem>
            <Link href={"/sales&offer"}>
              <MenuItem
                setActive={setActive}
                active={active}
                item="Sales & Offers"
              />
            </Link>
            <MenuItem
              setActive={setActive}
              active={active}
              item="Digital Services"
            >
              <div className="flex flex-col space-y-4 text-sm">
                <Link href="/digitalServices/pdfToText">
                  <HoveredLink>Pdf to Text</HoveredLink>
                </Link>
                <Link href="/digitalServices/imageToText">
                  <HoveredLink>Image to Text</HoveredLink>
                </Link>
                <Link href="/digitalServices/imageResize">
                  <HoveredLink>Image Resize</HoveredLink>
                </Link>
                <Link href="/digitalServices/backgroundRemove">
                  <HoveredLink>Background Remove</HoveredLink>
                </Link>
                <Link href="/digitalServices/editImage">
                  <HoveredLink>Edit Image</HoveredLink>
                </Link>
              </div>
            </MenuItem>
          </Menu>
        )}
      </div>

      {/* RIGHT: Responsive Layout */}
      <div className="flex-1 flex items-center justify-end gap-2 md:gap-4 min-w-0 relative">
        {/* --- Compact (Mobile) Mode --- */}
        {isCompact ? (
          <>
            {/* If not admin, show Search/Cart/ShopNow */}
            {!isAdmin && (
              <div className="relative">
                <button
                  id="menu-btn"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700"
                  aria-label="Menu"
                  onClick={() => setShowMenu((prev) => !prev)}
                >
                  <HiOutlineSquares2X2 className="text-2xl text-gray-200" />
                </button>
                {showMenu && (
                  <div
                    id="menu-dropdown"
                    className="absolute right-0 mt-2 w-64 bg-zinc-900 rounded-xl shadow-xl border border-zinc-800 z-50 p-4 flex flex-col gap-4"
                  >
                    {/* Search */}
                    <div className="flex items-center relative">
                      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search"
                        className="pl-10 pr-3 py-1.5 rounded-md bg-zinc-800 text-zinc-100 placeholder:text-zinc-400 border border-zinc-700 focus:ring-2 focus:ring-zinc-600 outline-none w-full"
                      />
                    </div>
                    {/* Cart */}
                    <button className="flex items-center gap-2 bg-zinc-800 rounded-md px-4 py-2 hover:bg-zinc-700 text-white font-semibold">
                      <span className="relative">
                        <FaShoppingCart className="text-lg" />
                        <span className="absolute -top-2 -right-2 bg-zinc-900 text-xs px-1.5 py-0.5 rounded-full border border-zinc-800 text-white font-bold">
                          3
                        </span>
                      </span>
                      Cart
                      <span className="ml-auto text-zinc-300">$199</span>
                    </button>
                    {/* Shop Button */}
                    <Link href="/shop">
                      <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition border-2 border-white hover:border-gray-900 w-full">
                        Shop Now
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Admin Icon/Dropdown or Normal User/Login */}
            {session?.user ? (
              isAdmin ? (
                <div className="relative">
                  <button
                    id="user-btn"
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-800 hover:bg-blue-700 overflow-hidden"
                    aria-label="Admin"
                    onClick={() => setShowUser((prev) => !prev)}
                  >
                    {/* <FaUserShield className="text-white text-xl" /> */}
                    {userImage ? (
                      <img
                        src={userImage}
                        alt="User"
                        className="w-full h-full object-cover rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <FaUser className="text-gray-300 text-lg" />
                    )}
                  </button>
                  {showUser && (
                    <ul
                      id="user-dropdown"
                      className="absolute right-0 mt-2 w-48 bg-zinc-900 rounded-xl shadow-xl border border-zinc-800 z-50 p-2"
                    >
                      <li>
                        <Link href="/profile">
                          <div className="flex items-center justify-between text-white py-2 px-2 rounded hover:bg-zinc-800 transition cursor-pointer">
                            Profile
                          </div>
                        </Link>
                      </li>
                      <li>
                        <Link href="/admin/dashboard">
                          <div className="flex items-center justify-between text-blue-400 py-2 px-2 rounded hover:bg-zinc-800 transition cursor-pointer font-semibold">
                            Dashboard
                          </div>
                        </Link>
                      </li>
                      <li>
                        <Link href="/activity">
                          <div className="block text-white py-2 px-2 rounded hover:bg-zinc-800 transition cursor-pointer">
                            Activity Logs
                          </div>
                        </Link>
                      </li>
                      <li>
                        <button
                          className="block text-red-400 py-2 px-2 rounded hover:bg-zinc-800 transition cursor-pointer w-full text-left"
                          onClick={async () => {
                            await api.post("auth/logout");
                            window.location.href = "/login";
                          }}
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              ) : (
                // ...your normal user profile dropdown here...
                <div className="relative">
                  <button
                    id="user-btn"
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 overflow-hidden"
                    aria-label="User"
                    onClick={() => setShowUser((prev) => !prev)}
                  >
                    {userImage ? (
                      <img
                        src={userImage}
                        alt="User"
                        className="w-full h-full object-cover rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <FaUser className="text-gray-300 text-lg" />
                    )}
                  </button>
                  {showUser && (
                    <ul
                      id="user-dropdown"
                      className="absolute right-0 mt-2 w-44 bg-zinc-900 rounded-xl shadow-xl border border-zinc-800 z-50 p-2"
                    >
                      <li>
                        <Link href="/profile">
                          <div className="flex items-center justify-between text-white py-2 px-2 rounded hover:bg-zinc-800 transition cursor-pointer">
                            Profile
                          </div>
                        </Link>
                      </li>
                      <li>
                        <Link href="/subscription/details">
                          <div className="block text-white py-2 px-2 rounded hover:bg-zinc-800 transition cursor-pointer">
                            Subscription Details
                          </div>
                        </Link>
                      </li>
                      <li>
                        <Link href="/payment/history">
                          <div className="block text-white py-2 px-2 rounded hover:bg-zinc-800 transition cursor-pointer">
                            Payment History
                          </div>
                        </Link>
                      </li>
                      <li>
                        <Link href="/activity">
                          <div className="block text-white py-2 px-2 rounded hover:bg-zinc-800 transition cursor-pointer">
                            Activity Logs
                          </div>
                        </Link>
                      </li>
                      <li>
                        <Link href="/settings">
                          <div className="block text-white py-2 px-2 rounded hover:bg-zinc-800 transition cursor-pointer">
                            Settings
                          </div>
                        </Link>
                      </li>
                      <li>
                        <button
                          className="block text-red-400 py-2 px-2 rounded hover:bg-zinc-800 transition cursor-pointer w-full text-left"
                          onClick={async () => {
                            await api.post("auth/logout");
                            window.location.href = "/login";
                          }}
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              )
            ) : (
              <Link href="/login">
                <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition border-2 border-white hover:border-gray-900">
                  Login
                </button>
              </Link>
            )}
          </>
        ) : (
          // ---- Desktop (Normal) Mode ----
          <>
            {/* Show only if not admin */}
            {!isAdmin && (
              <>
                {/* Search: desktop */}
                <div className="hidden md:flex items-center relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search"
                    className="pl-10 pr-3 py-1.5 rounded-md bg-zinc-900 text-zinc-100 placeholder:text-zinc-400 border border-zinc-700 focus:ring-2 focus:ring-zinc-600 outline-none transition-all duration-150 w-36 md:w-44 h-10"
                  />
                </div>
                {/* Cart Icon */}
                <div className="relative">
                  <button
                    id="cart-btn"
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 relative"
                    aria-label="Cart"
                  >
                    <FaShoppingCart className="text-gray-200" />
                    <span className="absolute -top-1 -right-1 bg-zinc-900 text-xs px-1.5 py-0.5 rounded-full border border-zinc-800 text-white font-bold">
                      3
                    </span>
                  </button>
                </div>
                {/* Shop Button */}
                <Link href="/shop">
                  <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition border-2 border-white hover:border-gray-900 flex items-center gap-2">
                    Shop
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </Link>
              </>
            )}
            {/* Admin/User Icon or Login */}
            {session?.user ? (
              isAdmin ? (
                <div className="relative">
                  <button
                    id="user-btn"
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-800 hover:bg-blue-700 overflow-hidden"
                    aria-label="Admin"
                    onClick={() => setShowUser((prev) => !prev)}
                  >
                    {/* <FaUserShield className="text-white text-xl" /> */}
                    {userImage ? (
                      <img
                        src={userImage}
                        alt="User"
                        className="w-full h-full object-cover rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <FaUser className="text-gray-300 text-lg" />
                    )}
                  </button>
                  {showUser && (
                    <ul
                      id="user-dropdown"
                      className="absolute right-0 mt-2 w-48 bg-zinc-900 rounded-xl shadow-xl border border-zinc-800 z-50 p-2"
                    >
                      <li>
                        <Link href="/profile">
                          <div className="flex items-center justify-between text-white py-2 px-2 rounded hover:bg-zinc-800 transition cursor-pointer">
                            Profile
                          </div>
                        </Link>
                      </li>
                      <li>
                        <Link href="/admin/dashboard">
                          <div className="flex items-center justify-between text-blue-400 py-2 px-2 rounded hover:bg-zinc-800 transition cursor-pointer font-semibold">
                            Dashboard
                          </div>
                        </Link>
                      </li>
                      <li>
                        <Link href="/activity">
                          <div className="block text-white py-2 px-2 rounded hover:bg-zinc-800 transition cursor-pointer">
                            Activity Logs
                          </div>
                        </Link>
                      </li>
                      <li>
                        <button
                          className="block text-red-400 py-2 px-2 rounded hover:bg-zinc-800 transition cursor-pointer w-full text-left"
                          onClick={async () => {
                            await api.post("auth/logout");
                            window.location.href = "/login";
                          }}
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              ) : (
                // ...your normal user profile dropdown here...
                <div className="relative">
                  <button
                    id="user-btn"
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 overflow-hidden"
                    aria-label="User"
                    onClick={() => setShowUser((prev) => !prev)}
                  >
                    {userImage ? (
                      <img
                        src={userImage}
                        alt="User"
                        className="w-full h-full object-cover rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <FaUser className="text-gray-300 text-lg" />
                    )}
                  </button>
                  {showUser && (
                    <ul
                      id="user-dropdown"
                      className="absolute right-0 mt-2 w-44 bg-zinc-900 rounded-xl shadow-xl border border-zinc-800 z-50 p-2"
                    >
                      <li>
                        <Link href="/profile">
                          <div className="flex items-center justify-between text-white py-2 px-2 rounded hover:bg-zinc-800 transition cursor-pointer">
                            Profile
                          </div>
                        </Link>
                      </li>
                      <li>
                        <Link href="/subscription/details">
                          <div className="block text-white py-2 px-2 rounded hover:bg-zinc-800 transition cursor-pointer">
                            Subscription Details
                          </div>
                        </Link>
                      </li>
                      <li>
                        <Link href="/payment/history">
                          <div className="block text-white py-2 px-2 rounded hover:bg-zinc-800 transition cursor-pointer">
                            Payment History
                          </div>
                        </Link>
                      </li>
                      <li>
                        <Link href="/activity">
                          <div className="block text-white py-2 px-2 rounded hover:bg-zinc-800 transition cursor-pointer">
                            Activity Logs
                          </div>
                        </Link>
                      </li>
                      <li>
                        <Link href="/settings">
                          <div className="block text-white py-2 px-2 rounded hover:bg-zinc-800 transition cursor-pointer">
                            Settings
                          </div>
                        </Link>
                      </li>
                      <li>
                        <button
                          className="block text-red-400 py-2 px-2 rounded hover:bg-zinc-800 transition cursor-pointer w-full text-left"
                          onClick={async () => {
                            await api.post("auth/logout");
                            window.location.href = "/login";
                          }}
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              )
            ) : (
              <Link href="/login">
                <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition border-2 border-white hover:border-gray-900">
                  Login
                </button>
              </Link>
            )}
          </>
        )}
      </div>
    </header>
  );
};

export default NavbarClient;
