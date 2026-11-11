"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import type { CartLine, CartView } from "@/types/commerce";

/** Per-line cap from the contract (also capped at stock). */
export const MAX_PER_LINE = 10;

const STORAGE_KEY = "elvate:cart";
const EMPTY: CartView = { items: [], itemCount: 0, subtotal: 0, currency: "BDT" };

type GuestLine = { variantId: string; quantity: number };

// ---------------------------------------------------------------------------
// Guest cart storage (may be unavailable: private mode, blocked site data)
// ---------------------------------------------------------------------------

function readGuest(): GuestLine[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (l): l is GuestLine =>
          typeof l?.variantId === "string" && Number.isInteger(l?.quantity) && l.quantity > 0
      )
      .map((l) => ({ variantId: l.variantId, quantity: Math.min(MAX_PER_LINE, l.quantity) }));
  } catch {
    return [];
  }
}

function writeGuest(lines: GuestLine[]) {
  try {
    if (lines.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // storage blocked: the cart then only lives for this page view
  }
}

const toGuest = (view: CartView): GuestLine[] =>
  view.items.map((l) => ({ variantId: l.variantId, quantity: l.quantity }));

/** Local re-pricing for optimistic updates (the server answer replaces it). */
function recompute(items: CartLine[]): CartView {
  const lines = items.map((l) => ({
    ...l,
    lineTotal: l.unitPrice * l.quantity,
    available: l.stock > 0 && l.quantity <= l.stock,
  }));
  return {
    items: lines,
    itemCount: lines.reduce((s, l) => s + l.quantity, 0),
    subtotal: lines.reduce((s, l) => s + (l.available ? l.lineTotal : 0), 0),
    currency: "BDT",
  };
}

/** Stable key of a line: server id when logged in, variant for guests. */
export const lineKey = (l: CartLine) => l.id ?? l.variantId;

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

type CartContextValue = {
  cart: CartView;
  /** False until the first load finished. */
  ready: boolean;
  loggedIn: boolean;
  /** Item count for the badge (falls back to local storage while pricing fails). */
  count: number;
  /** Quantity of a variant already in the cart. */
  quantityOf: (variantId: string) => number;
  addItem: (variantId: string, quantity: number) => Promise<boolean>;
  setQuantity: (line: CartLine, quantity: number) => Promise<void>;
  removeLine: (line: CartLine) => Promise<void>;
  /** Re-fetch (e.g. after placing an order, which clears the server cart). */
  refresh: () => Promise<void>;
  miniCartOpen: boolean;
  setMiniCartOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

/**
 * Cart state for the whole app.
 *  - Logged out: `{ variantId, quantity }[]` in localStorage, priced by `POST /cart/preview`.
 *  - Logged in: the server cart (`/cart`). Right after login the guest cart is merged
 *    with `POST /cart/merge` and local storage is cleared.
 *  - Quantity changes / removals are optimistic with rollback + toast on error.
 *    Only the newest response is applied, so fast clicking can't reorder state.
 */
export function CartProvider({ loggedIn, children }: { loggedIn: boolean; children: React.ReactNode }) {
  const [cart, setCart] = useState<CartView>(EMPTY);
  const [ready, setReady] = useState(false);
  const [guestCount, setGuestCount] = useState(0);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const seq = useRef(0);
  const cartRef = useRef(cart);
  cartRef.current = cart;

  const priceGuest = useCallback(async (lines: GuestLine[]): Promise<CartView> => {
    setGuestCount(lines.reduce((s, l) => s + l.quantity, 0));
    if (!lines.length) return EMPTY;
    const res = await api.post<CartView>("/cart/preview", { items: lines });
    // Drop variants the server no longer knows (deleted products).
    writeGuest(toGuest(res.data));
    return res.data;
  }, []);

  const load = useCallback(async () => {
    const my = ++seq.current;
    try {
      let view: CartView;
      if (loggedIn) {
        const guest = readGuest();
        if (guest.length) {
          view = (await api.post<CartView>("/cart/merge", { items: guest })).data;
          writeGuest([]);
          toast.success("Items from your guest cart were added to your cart.");
        } else {
          view = (await api.get<CartView>("/cart")).data;
        }
      } else {
        view = await priceGuest(readGuest());
      }
      if (my === seq.current) setCart(view);
    } catch {
      // Keep whatever we had; the badge falls back to the stored count.
    } finally {
      if (my === seq.current) setReady(true);
    }
  }, [loggedIn, priceGuest]);

  useEffect(() => {
    void load();
  }, [load]);

  // Keep guest carts in sync across tabs.
  useEffect(() => {
    if (loggedIn) return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) void load();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [loggedIn, load]);

  const quantityOf = useCallback(
    (variantId: string) => cart.items.find((l) => l.variantId === variantId)?.quantity ?? 0,
    [cart.items]
  );

  const addItem = useCallback(
    async (variantId: string, quantity: number) => {
      const my = ++seq.current;
      try {
        let view: CartView;
        if (loggedIn) {
          view = (await api.post<CartView>("/cart/items", { variantId, quantity })).data;
        } else {
          const lines = readGuest();
          const existing = lines.find((l) => l.variantId === variantId);
          if (existing) existing.quantity = Math.min(MAX_PER_LINE, existing.quantity + quantity);
          else lines.push({ variantId, quantity: Math.min(MAX_PER_LINE, quantity) });
          writeGuest(lines);
          view = await priceGuest(lines);
        }
        if (my === seq.current) setCart(view);
        return true;
      } catch (err) {
        toast.error(getErrorMessage(err, "Could not add this item to your cart."));
        return false;
      }
    },
    [loggedIn, priceGuest]
  );

  /** Optimistic change: apply `next` locally, sync, roll back on failure. */
  const mutate = useCallback(
    async (nextItems: CartLine[], sync: () => Promise<CartView>, failMessage: string) => {
      const previous = cartRef.current;
      const prevGuest = loggedIn ? null : readGuest();
      const my = ++seq.current;
      setCart(recompute(nextItems));
      try {
        const view = await sync();
        if (my === seq.current) setCart(view);
      } catch (err) {
        if (my === seq.current) {
          setCart(previous);
          if (prevGuest) writeGuest(prevGuest);
        }
        toast.error(getErrorMessage(err, failMessage));
      }
    },
    [loggedIn]
  );

  const removeLine = useCallback(
    async (line: CartLine) => {
      const key = lineKey(line);
      const next = cartRef.current.items.filter((l) => lineKey(l) !== key);
      await mutate(
        next,
        async () => {
          if (loggedIn && line.id) return (await api.delete<CartView>(`/cart/items/${line.id}`)).data;
          const lines = next.map((l) => ({ variantId: l.variantId, quantity: l.quantity }));
          writeGuest(lines);
          return priceGuest(lines);
        },
        "Could not remove this item."
      );
    },
    [loggedIn, mutate, priceGuest]
  );

  const setQuantity = useCallback(
    async (line: CartLine, quantity: number) => {
      if (quantity <= 0) return removeLine(line);
      const q = Math.min(MAX_PER_LINE, quantity);
      const key = lineKey(line);
      const next = cartRef.current.items.map((l) => (lineKey(l) === key ? { ...l, quantity: q } : l));
      await mutate(
        next,
        async () => {
          if (loggedIn && line.id) {
            return (await api.patch<CartView>(`/cart/items/${line.id}`, { quantity: q })).data;
          }
          const lines = toGuest({ ...cartRef.current, items: next });
          writeGuest(lines);
          return priceGuest(lines);
        },
        "Could not update the quantity."
      );
    },
    [loggedIn, mutate, priceGuest, removeLine]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      ready,
      loggedIn,
      count: cart.items.length ? cart.itemCount : loggedIn ? 0 : guestCount,
      quantityOf,
      addItem,
      setQuantity,
      removeLine,
      refresh: load,
      miniCartOpen,
      setMiniCartOpen,
    }),
    [cart, ready, loggedIn, guestCount, quantityOf, addItem, setQuantity, removeLine, load, miniCartOpen]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
