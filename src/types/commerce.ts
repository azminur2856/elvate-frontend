/**
 * Commerce types, copied from `project-plan/API-CONTRACT.md` → "Shared types".
 * The contract is the source of truth: when it changes, update this file to match.
 *
 * Money is BDT as a JSON number. Dates are ISO-8601 UTC strings.
 */

// ---------------------------------------------------------------------------
// Conventions
// ---------------------------------------------------------------------------

export type Paginated<T> = { items: T[]; total: number; page: number; pageSize: number; totalPages: number };

// ---------------------------------------------------------------------------
// Shared types (copied exactly)
// ---------------------------------------------------------------------------

export type Category = {
  id: string; name: string; slug: string; imageUrl: string | null;
  parentId: string | null; sortOrder: number; productCount: number;
  children?: Category[];                 // present in tree responses
};

export type ProductCard = {
  id: string; slug: string; name: string; brand: string | null;
  price: number;                         // regular price
  effectivePrice: number;                // flash sale > salePrice > price
  discountPercent: number;               // 0 when not discounted (rounded)
  mainImage: string | null;              // `/img/...` path (BE-28), served by our rewrite
  rating: number; reviewCount: number;   // approved reviews only
  inStock: boolean;
  isFeatured: boolean; isNewArrival: boolean; isOnSale: boolean;
  category: { id: string; name: string; slug: string };
  flashSaleEndsAt: string | null;        // set when an active flash sale applies
};

export type ProductVariant = {
  id: string; size: string | null; color: string | null; sku: string;
  stock: number; price: number; effectivePrice: number;   // variant price override or product price
};

export type ProductDetail = ProductCard & {
  description: string; material: string | null; careInstructions: string | null;
  specifications: Record<string, string>;
  images: { id: string; url: string; isMain: boolean; sortOrder: number }[];
  variants: ProductVariant[];
  breadcrumb: { name: string; slug: string }[];          // root → leaf category
  isActive: boolean;                                      // false only visible to ADMIN
  createdAt: string; updatedAt: string;
};

export type CartLine = {
  id: string | null;                     // null in /cart/preview (guest)
  variantId: string; productId: string; slug: string; name: string; image: string | null;
  size: string | null; color: string | null;
  unitPrice: number; quantity: number; lineTotal: number;
  stock: number; available: boolean;     // false = inactive product or stock < quantity
};
export type CartView = { items: CartLine[]; itemCount: number; subtotal: number; currency: "BDT" };

export type Address = {
  id: string; label: string | null; fullName: string; phone: string;
  addressLine: string; area: string | null; city: string; postalCode: string | null;
  isDefault: boolean; isInsideDhaka: boolean;            // derived from city, drives shipping fee
};

export type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED" | "RETURN_REQUESTED" | "RETURNED";
export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED" | "FAILED";
export type PaymentMethod = "COD" | "STRIPE";

export type OrderSummary = {
  id: string; orderNumber: string;       // e.g. "ELV-261111-7KQ2"
  status: OrderStatus; paymentStatus: PaymentStatus; paymentMethod: PaymentMethod;
  total: number; itemCount: number; firstItemImage: string | null; createdAt: string;
  customer?: { id: string; name: string; email: string; avatarUrl?: string | null };   // admin lists only; avatarUrl BE-28
  deliveryMan?: { id: string; name: string } | null;        // admin lists only
};

export type OrderItem = {
  id: string; productId: string | null; variantId: string | null; slug: string | null;
  productName: string; variantLabel: string | null;       // snapshot at purchase time
  image: string | null; unitPrice: number; quantity: number; lineTotal: number;
  canReview: boolean;                    // DELIVERED and the user has not reviewed the product yet
};

export type OrderDetail = OrderSummary & {
  items: OrderItem[];
  subtotal: number; discount: number; shippingFee: number; total: number;
  couponCode: string | null; notes: string | null;
  adminNotes?: string | null;            // ADMIN only
  shippingAddress: Omit<Address, "id" | "isDefault">;     // snapshot
  statusHistory: { status: OrderStatus; note: string | null; at: string; by: { name: string; role: string } | null }[];
  deliveryMan: { id: string; name: string; phone: string | null } | null;
  customer: { id: string; name: string; email: string; phone: string | null; avatarUrl?: string | null };
  allowedNextStatuses: OrderStatus[];    // for the caller's role; drives the UI buttons
  canCancel: boolean; canPay: boolean;   // canPay = STRIPE && UNPAID && not cancelled
};

export type Quote = {
  items: CartLine[]; subtotal: number; discount: number; shippingFee: number; total: number;
  coupon: { code: string; valid: boolean; message: string; discount: number } | null;
  freeShippingThreshold: number | null;  // shipping is free when (subtotal − discount) ≥ threshold (the amount after the coupon)
};

export type Review = {
  id: string; rating: number; comment: string | null; createdAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  user: { name: string; avatar: string | null } | null;
  product?: { id: string; name: string; slug: string; image: string | null };
};

export type Coupon = {
  id: string; code: string; description: string | null; type: "PERCENT" | "FIXED"; value: number;
  minOrderAmount: number | null; maxDiscount: number | null;
  startsAt: string; expiresAt: string; usageLimit: number | null; perUserLimit: number | null;
  usedCount: number; isPublic: boolean; isActive: boolean;
};

export type FlashSale = {
  id: string; title: string | null; discountPercent: number; startsAt: string; endsAt: string;
  isActive: boolean; product: ProductCard;
};

export type DeviceSession = {
  id: string;
  loginMethod: "localLogin" | "googleOAuth" | "faceLogin";   // exactly the values stored in user_sessions
  userAgent: string | null; createdAt: string; lastUsedAt: string; current: boolean;
};

// ---------------------------------------------------------------------------
// Endpoint-specific shapes (from the endpoint tables in the contract)
// ---------------------------------------------------------------------------

/** `GET /categories/:slug` */
export type CategoryDetail = Category & { children: Category[]; breadcrumb: { name: string; slug: string }[] };

export type ProductSort = "newest" | "price_asc" | "price_desc" | "popular" | "rating";

/** Query for `GET /products` (all optional). `sizes` / `colors` are sent as csv. */
export type ProductQuery = {
  page?: number; pageSize?: number;
  category?: string; q?: string;
  minPrice?: number; maxPrice?: number;
  sizes?: string[]; colors?: string[];
  brand?: string;
  onSale?: boolean; featured?: boolean; newArrival?: boolean; inStock?: boolean;
  sort?: ProductSort;
};

/** `GET /products/filters` */
export type ProductFilters = { sizes: string[]; colors: string[]; brands: string[]; minPrice: number; maxPrice: number };

/** `GET /admin/products` row */
export type AdminProductRow = ProductCard & { isActive: boolean; totalStock: number; variantCount: number };

export type ProductImage = ProductDetail["images"][number];

/** Body for `POST /admin/products/:id/variants` and `PATCH /admin/products/variants/:variantId` */
export type VariantInput = { size?: string; color?: string; sku?: string; stock: number; price?: number };

/** Body for `POST /admin/products` (PATCH = same minus `variants`, all optional) */
export type ProductInput = {
  name: string; slug?: string; description: string; brand?: string; categoryId: string;
  price: number; salePrice?: number; material?: string; careInstructions?: string;
  specifications?: Record<string, string>;
  isFeatured?: boolean; isNewArrival?: boolean; isActive?: boolean;
  variants: VariantInput[];
};

/** Body for `POST /addresses` (PATCH = same, all optional) */
export type AddressInput = {
  label?: string; fullName: string; phone: string; addressLine: string;
  area?: string; city: string; postalCode?: string; isDefault?: boolean;
};

/** `POST /orders` */
export type PlaceOrderResponse = { order: OrderDetail; checkoutUrl: string | null };

/** `POST /orders` 409 body (stock changed). `available` = units in stock now (0 also for inactive products). */
export type PlaceOrderConflict = {
  statusCode: 409; error: "Conflict"; message: string;
  items: { variantId: string; available: number }[];
};

/** `GET /orders/session/:sessionId` */
export type OrderSessionStatus = { orderId: string; orderNumber: string; paymentStatus: PaymentStatus };

/** `GET /admin/orders/delivery-men` */
export type DeliveryManOption = { id: string; name: string; phone: string | null; activeOrders: number };

/** `GET /admin/orders/stats` */
export type OrderStats = {
  totalOrders: number; revenue: number; avgOrderValue: number; pendingCount: number;
  countByStatus: Record<OrderStatus, number>;
  paymentMethodSplit: Record<PaymentMethod, number>;
  byDay: { date: string; count: number; revenue: number }[];
  topProducts: { productId: string; name: string; image: string | null; quantity: number; revenue: number }[];
  lowStock: { variantId: string; productName: string; variantLabel: string | null; stock: number }[];
};

/** `GET /delivery/orders` row */
export type DeliveryOrder = OrderSummary & {
  shippingAddress: OrderDetail["shippingAddress"];
  customerPhone: string | null;
  codDue: number;
};

/** `GET /delivery/stats` */
export type DeliveryStats = {
  assigned: number; outForDelivery: number; deliveredToday: number; deliveredTotal: number; codCollectedToday: number;
};

export type PublicCoupon = Pick<Coupon, "code" | "description" | "type" | "value" | "minOrderAmount" | "maxDiscount" | "expiresAt">;

/** `GET /offers` */
export type OffersResponse = { flashSales: FlashSale[]; publicCoupons: PublicCoupon[] };

/** Body for `POST /admin/coupons` (PATCH = partial) */
export type CouponInput = Omit<Coupon, "id" | "usedCount">;

/** Body for `POST /admin/flash-sales` (PATCH = partial) */
export type FlashSaleInput = {
  productId: string; title?: string; discountPercent: number; startsAt: string; endsAt: string; isActive?: boolean;
};

export type RatingDistribution = Record<1 | 2 | 3 | 4 | 5, number>;

/** `GET /products/:slug/reviews` */
export type ProductReviewsPage = Paginated<Review> & { average: number; count: number; distribution: RatingDistribution };

/** `GET /products/:slug/reviews/eligibility` */
export type ReviewEligibility = { canReview: boolean; reason: string | null };

/** Generic `{ success: true }` reply */
export type SuccessResponse = { success: true };

/** `GET/POST/PATCH /admin/products[/:id]` (ADMIN · STAFF): detail plus admin-only fields. */
export type AdminProductDetail = ProductDetail & {
  salePrice: number | null; viewCount: number; soldCount: number;
  variants: (ProductVariant & { priceOverride: number | null })[];
};
