export type NavLink = {
  label: string;
  href: string;
  description?: string;
};

export type NavGroup = {
  label: string;
  /** Landing page for the group (also used for active-state matching). */
  href: string;
  /** When present the group renders as a dropdown / expandable section. */
  items?: NavLink[];
  /** Optional column headings for large groups (admin). */
  sections?: { label: string; items: NavLink[] }[];
};

export const DIGITAL_SERVICE_LINKS: NavLink[] = [
  { label: "PDF to Text", href: "/digitalServices/pdfToText", description: "Extract text from PDF files" },
  { label: "Image to Text", href: "/digitalServices/imageToText", description: "OCR for photos and scans" },
  { label: "Image Resize", href: "/digitalServices/imageResize", description: "Resize to presets or exact pixels" },
  { label: "Background Remove", href: "/digitalServices/backgroundRemove", description: "Cut out backgrounds" },
  { label: "Edit Image", href: "/digitalServices/editImage", description: "Crop, rotate, adjust" },
];

const SHOP_LINKS: NavLink[] = [
  { label: "Men", href: "/shop/men" },
  { label: "Women", href: "/shop/women" },
  { label: "Children", href: "/shop/children" },
];

const ADMIN_SECTIONS: NavGroup["sections"] = [
  {
    label: "Users",
    items: [
      { label: "Dashboard", href: "/admin/dashboard" },
      { label: "View users", href: "/admin/users/view" },
      { label: "Manage users", href: "/admin/users/manage" },
      { label: "User stats", href: "/admin/users/stats" },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { label: "Products", href: "/admin/products/view" },
      { label: "Categories", href: "/admin/products/categories" },
      { label: "Orders", href: "/admin/orders/view" },
      { label: "Order stats", href: "/admin/orders/stats" },
    ],
  },
  {
    label: "Billing & activity",
    items: [
      { label: "Subscription history", href: "/admin/subscription/history" },
      { label: "Subscription stats", href: "/admin/subscription/stats" },
      { label: "Payment history", href: "/admin/payment/history" },
      { label: "Payment stats", href: "/admin/payment/stats" },
      { label: "Activity logs", href: "/admin/activity/logs" },
      { label: "Activity stats", href: "/admin/activity/stats" },
    ],
  },
];

/** Primary navigation. Admins get everything a customer gets plus an Admin group. */
export function getNavGroups(isAdmin: boolean): NavGroup[] {
  const groups: NavGroup[] = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop", items: SHOP_LINKS },
    { label: "Sales & Offers", href: "/sales&offer" },
    { label: "Digital Services", href: "/digitalServices", items: DIGITAL_SERVICE_LINKS },
  ];
  if (isAdmin) {
    groups.push({ label: "Admin", href: "/admin/dashboard", sections: ADMIN_SECTIONS });
  }
  return groups;
}

/** Items in the avatar dropdown (rendered once, reused in the mobile sheet). */
export function getUserMenuItems(isAdmin: boolean): NavLink[] {
  if (isAdmin) {
    return [
      { label: "Profile", href: "/profile" },
      { label: "Dashboard", href: "/admin/dashboard" },
      { label: "Activity logs", href: "/activity" },
    ];
  }
  return [
    { label: "Profile", href: "/profile" },
    { label: "Subscription", href: "/subscription/details" },
    { label: "Payment history", href: "/payment/history" },
    { label: "Activity logs", href: "/activity" },
    { label: "Settings", href: "/settings" },
  ];
}

/** True when `pathname` is `href` or nested under it (except for "/"). */
export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
