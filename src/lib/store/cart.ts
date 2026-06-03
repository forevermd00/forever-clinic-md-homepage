'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // unique: `${treatmentSlug}-${packageId}`
  treatmentSlug: string;
  treatmentName: string;
  packageLabel: string;
  unitPrice: number;
  quantity: number;
  category: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  /** 여러 옵션을 한 번에 담되, 동일 id는 주어진 수량으로 "설정"(덮어쓰기)한다. 옵션 선택기에서 사용. */
  setItems: (items: CartItem[]) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
        });
      },

      setItems: (incoming) => {
        set((state) => {
          const next = [...state.items];
          for (const item of incoming) {
            const idx = next.findIndex((i) => i.id === item.id);
            if (idx >= 0) {
              next[idx] = { ...next[idx], ...item };
            } else {
              next.push(item);
            }
          }
          return { items: next };
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 0) return;
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        }));
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => {
        return get().items.reduce(
          (sum, item) => sum + (item.quantity > 0 ? item.quantity : 0),
          0,
        );
      },

      subtotal: () => {
        return get().items.reduce(
          (sum, item) =>
            sum + (item.quantity > 0 ? item.unitPrice * item.quantity : 0),
          0,
        );
      },
    }),
    {
      name: 'forever-clinic-cart',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Filter out items with quantity 0 on hydration
          state.items = state.items.filter((item) => item.quantity > 0);
        }
      },
    },
  ),
);
