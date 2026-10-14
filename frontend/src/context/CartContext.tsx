import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/types";

export type CartLine = { product: Product; quantity: number };

type CartValue = {
  lines: CartLine[];
  count: number;
  total: number;
  add: (product: Product, quantity?: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
};

const STORAGE_KEY = "agrimika_cart_v1";
const CartContext = createContext<CartValue | null>(null);

const load = (): CartLine[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as CartLine[];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [lines, setLines] = useState<CartLine[]>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* storage unavailable */
    }
  }, [lines]);

  const add = useCallback((product: Product, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing)
        return prev.map((l) =>
          l.product.id === product.id ? { product, quantity: Math.min(product.stock, l.quantity + quantity) } : l,
        );
      return [...prev, { product, quantity: Math.min(product.stock, quantity) }];
    });
  }, []);

  const setQuantity = useCallback((productId: number, quantity: number) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.product.id !== productId)
        : prev.map((l) => (l.product.id === productId ? { ...l, quantity: Math.min(l.product.stock, quantity) } : l)),
    );
  }, []);

  const remove = useCallback((productId: number) => setLines((prev) => prev.filter((l) => l.product.id !== productId)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      total: lines.reduce((n, l) => n + l.quantity * l.product.price, 0),
      add,
      setQuantity,
      remove,
      clear,
    }),
    [lines, add, setQuantity, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
