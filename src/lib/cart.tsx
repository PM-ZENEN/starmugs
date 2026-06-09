import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CartItem } from "./products";
import { PRODUCTS } from "./products";

type CartCtx = {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (idx: number) => void;
  clear: () => void;
  total: number;
  count: number;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "sternbecher_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  const add = (item: CartItem) => setItems((p) => [...p, item]);
  const remove = (idx: number) => setItems((p) => p.filter((_, i) => i !== idx));
  const clear = () => setItems([]);
  const total = items.reduce((sum, it) => {
    const p = PRODUCTS.find((x) => x.id === it.productId);
    return sum + (p?.price ?? 0) * it.qty;
  }, 0);
  const count = items.reduce((s, it) => s + it.qty, 0);

  return <Ctx.Provider value={{ items, add, remove, clear, total, count }}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
}
