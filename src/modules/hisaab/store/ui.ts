import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Transaction } from '@/modules/hisaab/types';

interface UIStore {
  theme: 'light' | 'dark';
  maskAmounts: boolean;
  addTransactionSheetOpen: boolean;
  addTransactionBookId: string | null;
  editingTransaction: Transaction | null;
  transactionDetailOpen: boolean;
  viewingTransaction: Transaction | null;
  toggleTheme: () => void;
  toggleMaskAmounts: () => void;
  openAddTransaction: (bookId: string) => void;
  openEditTransaction: (tx: Transaction) => void;
  closeAddTransaction: () => void;
  openTransactionDetail: (tx: Transaction) => void;
  closeTransactionDetail: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      theme: 'light',
      maskAmounts: false,
      addTransactionSheetOpen: false,
      addTransactionBookId: null,
      editingTransaction: null,
      transactionDetailOpen: false,
      viewingTransaction: null,
      toggleTheme: () =>
        set((s) => {
          const next = s.theme === 'light' ? 'dark' : 'light';
          document.documentElement.classList.toggle('dark', next === 'dark');
          return { theme: next };
        }),
      toggleMaskAmounts: () => set((s) => ({ maskAmounts: !s.maskAmounts })),
      openAddTransaction: (bookId: string) =>
        set({ addTransactionSheetOpen: true, addTransactionBookId: bookId, editingTransaction: null }),
      openEditTransaction: (tx: Transaction) =>
        set({ addTransactionSheetOpen: true, addTransactionBookId: tx.bookId, editingTransaction: tx }),
      closeAddTransaction: () =>
        set({ addTransactionSheetOpen: false, addTransactionBookId: null, editingTransaction: null }),
      openTransactionDetail: (tx: Transaction) =>
        set({ transactionDetailOpen: true, viewingTransaction: tx }),
      closeTransactionDetail: () =>
        set({ transactionDetailOpen: false, viewingTransaction: null }),
    }),
    {
      name: 'hisaab-ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ theme: s.theme, maskAmounts: s.maskAmounts }),
    },
  ),
);

// Apply persisted theme on startup
const savedTheme = useUIStore.getState().theme;
document.documentElement.classList.toggle('dark', savedTheme === 'dark');
