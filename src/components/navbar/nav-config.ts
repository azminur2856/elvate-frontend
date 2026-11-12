import { Role } from "@/lib/enums/role.enum";

export type NavLink = {
  label: string;
  href: string;
  description?: string;
  /** Small count shown next to the label (e.g. pending reviews). */
  badge?: number;
  /** Screen-reader text after the badge number ("pending"). */
  badgeLabel?: string;
};

export type NavGroup = {
  label: string;
  /** Landing page for the group (also used for active-state matching). */
  href: string;
  /** When present the group renders as a dropdown / expandable section. */
  items?: NavLink[];
  /** Optional column headings for large groups (admin). */
  sections?: { label: string; items: NavLink[] }[];
  /** Don't add the "All …" link at the top of the dropdown. */
  hideAllLink?: boolean;
};

/** The viewer's role, or null when logged out. */
export type NavRole = Role | null | undefined;

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
    label: "Site & users",
    items: [
      { label: "Dashboard", href: "/admin/dashboard" },
      // ADMIN only: not in STAFF_ADMIN_PATHS, so middleware sends STAFF to /403.
      { label: "Settings", href: "/admin/settings" },
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
      { label: "Coupons", href: "/admin/offers/coupons" },
      { label: "Flash sales", href: "/admin/offers/flash-sales" },
      { label: "Reviews", href: "/admin/reviews", badgeLabel: "pending" },
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

/**
 * Primary navigation. Everyone gets the shop + services; delivery men get a
 * Deliveries link; admins get the Admin group.
 */
export function getNavGroups(role: NavRole): NavGroup[] {
  const groups: NavGroup[] = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop", items: SHOP_LINKS },
    { label: "Offers", href: "/offers" },
    { label: "Digital Services", href: "/digitalServices", items: DIGITAL_SERVICE_LINKS },
  ];
  if (role === Role.DELIVERY_MAN) {
    groups.push({ label: "Deliveries", href: "/delivery" });
  }
  if (role === Role.ADMIN) {
    groups.push({ label: "Admin", href: "/admin/dashboard", sections: ADMIN_SECTIONS });
  }
  if (role === Role.STAFF) {
    groups.push({ label: "Shop management", href: "/admin/orders/view", items: STAFF_LINKS, hideAllLink: true });
  }
  return groups;
}

/** STAFF only sees the shop-running pages (see middleware STAFF_ADMIN_PATHS). */
const STAFF_LINKS: NavLink[] = [
  { label: "Orders", href: "/admin/orders/view", description: "Confirm, pack, ship and assign deliveries" },
  { label: "Order stats", href: "/admin/orders/stats", description: "Revenue, status mix and low stock" },
  { label: "Products", href: "/admin/products/view", description: "Catalogue, images, variants and stock" },
  { label: "Categories", href: "/admin/products/categories", description: "Category tree" },
  { label: "Reviews", href: "/admin/reviews", description: "Approve or reject customer reviews", badgeLabel: "pending" },
];

/** Items in the avatar dropdown (rendered once, reused in the mobile sheet). */
export function getUserMenuItems(role: NavRole): NavLink[] {
  if (role === Role.STAFF) {
    return [
      { label: "Profile", href: "/profile" },
      { label: "Orders", href: "/admin/orders/view" },
      { label: "Products", href: "/admin/products/view" },
      { label: "My orders", href: "/orders" },
      { label: "Activity logs", href: "/activity" },
      { label: "Settings", href: "/settings" },
    ];
  }
  if (role === Role.ADMIN) {
    return [
      { label: "Profile", href: "/profile" },
      { label: "Dashboard", href: "/admin/dashboard" },
      { label: "Orders", href: "/admin/orders/view" },
      { label: "Deliveries", href: "/delivery" },
      { label: "My orders", href: "/orders" },
      { label: "Activity logs", href: "/activity" },
      { label: "Settings", href: "/settings" },
    ];
  }
  if (role === Role.DELIVERY_MAN) {
    return [
      { label: "Profile", href: "/profile" },
      { label: "Deliveries", href: "/delivery" },
      { label: "My orders", href: "/orders" },
      { label: "Activity logs", href: "/activity" },
      { label: "Settings", href: "/settings" },
    ];
  }
  return [
    { label: "Profile", href: "/profile" },
    { label: "My orders", href: "/orders" },
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

/** Attach counts (by href) to matching links in groups / sections. */
export function applyBadges(groups: NavGroup[], badges: Record<string, number | undefined>): NavGroup[] {
  const decorate = (l: NavLink): NavLink => (badges[l.href] ? { ...l, badge: badges[l.href] } : l);
  return groups.map((g) => ({
    ...g,
    items: g.items?.map(decorate),
    sections: g.sections?.map((s) => ({ ...s, items: s.items.map(decorate) })),
  }));
}
