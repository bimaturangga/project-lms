import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Id } from "../../convex/_generated/dataModel";

export interface CartItem {
  _id: Id<"courses">;
  title: string;
  instructor: string;
  price: number;
  thumbnail: string;
}

interface CartState {
  items: CartItem[];
  count: number;
  addToCart: (course: CartItem) => void;
  removeFromCart: (courseId: Id<"courses">) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  isInCart: (courseId: Id<"courses">) => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      count: 0,
      addToCart: (course) => {
        const { items } = get();
        const existingItem = items.find((item) => item._id === course._id);

        if (!existingItem) {
          const newItems = [...items, course];
          set({
            items: newItems,
            count: newItems.length,
          });
        }
      },
      removeFromCart: (courseId) => {
        const { items } = get();
        const newItems = items.filter((item) => item._id !== courseId);
        set({
          items: newItems,
          count: newItems.length,
        });
      },
      clearCart: () => set({ items: [], count: 0 }),
      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price, 0);
      },
      isInCart: (courseId) => {
        const { items } = get();
        return items.some((item) => item._id === courseId);
      },
    }),
    {
      name: "cart-storage",
    },
  ),
);
