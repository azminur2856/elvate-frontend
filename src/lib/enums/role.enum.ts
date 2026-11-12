export enum Role {
  BUYER = 'BUYER',
  ADMIN = 'ADMIN',
  DELIVERY_MAN = 'DELIVERY_MAN',
  /** Runs the shop day to day: orders, products, categories, reviews. */
  STAFF = 'STAFF',
}

/** Human labels + what each role may do (shown when an admin changes a role). */
export const ROLE_INFO: Record<Role, { label: string; description: string }> = {
  [Role.BUYER]: { label: "Customer", description: "Shops, orders and uses the digital tools." },
  [Role.STAFF]: {
    label: "Staff",
    description: "Manages orders, products, categories and reviews. No access to users, billing, offers or the dashboard.",
  },
  [Role.DELIVERY_MAN]: { label: "Delivery man", description: "Sees assigned deliveries and updates their status." },
  [Role.ADMIN]: { label: "Admin", description: "Full access to everything, including users, billing and offers." },
};

/** Admin areas a STAFF member may open (prefix match on path segments). */
export const STAFF_ADMIN_PATHS = ["/admin/orders", "/admin/deliveries", "/admin/products", "/admin/reviews"];

/** True for ADMIN and STAFF (anyone who can open part of /admin). */
export const isShopManager = (role: string | null | undefined) => role === Role.ADMIN || role === Role.STAFF;
