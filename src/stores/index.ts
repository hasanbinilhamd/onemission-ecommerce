// ─── State management foundation ──────────────────────────────────────────────
// Install a state management library (Zustand recommended) and add feature
// stores here as modules are implemented.
//
// Example pattern with Zustand:
//
//   import { create } from 'zustand';
//
//   interface CartStore {
//     items: CartItem[];
//     addItem: (item: CartItem) => void;
//     clearCart: () => void;
//   }
//
//   export const useCartStore = create<CartStore>((set) => ({
//     items: [],
//     addItem: (item) => set((s) => ({ items: [...s.items, item] })),
//     clearCart: () => set({ items: [] }),
//   }));

export {};
