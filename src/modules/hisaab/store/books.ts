import { create } from 'zustand';
import type { BookWithStats } from '@/modules/hisaab/types';

interface BooksStore {
  books: BookWithStats[];
  isLoaded: boolean;
  setBooks: (books: BookWithStats[]) => void;
  setLoaded: (v: boolean) => void;
}

export const useBooksStore = create<BooksStore>((set) => ({
  books: [],
  isLoaded: false,
  setBooks: (books) => set({ books, isLoaded: true }),
  setLoaded: (isLoaded) => set({ isLoaded }),
}));
