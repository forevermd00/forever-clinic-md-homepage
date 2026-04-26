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
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
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

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
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
