import { create } from 'zustand';
import type { Wish } from '@/modules/wishbook/types';

interface WishesStore {
  wishes: Wish[];
  isLoaded: boolean;
  setWishes: (wishes: Wish[]) => void;
  setLoaded: (v: boolean) => void;
}

export const useWishesStore = create<WishesStore>((set) => ({
  wishes: [],
  isLoaded: false,
  setWishes: (wishes) => set({ wishes, isLoaded: true }),
  setLoaded: (isLoaded) => set({ isLoaded }),
}));
