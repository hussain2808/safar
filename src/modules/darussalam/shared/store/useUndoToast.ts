import { create } from 'zustand';

interface PendingUndo {
  id: number;
  message: string;
  onUndo: () => Promise<void>;
}

interface UndoToastStore {
  pending: PendingUndo | null;
  showUndo: (message: string, onUndo: () => Promise<void>) => void;
  dismiss: () => void;
}

export const useUndoToast = create<UndoToastStore>((set) => ({
  pending: null,
  showUndo: (message, onUndo) => set({ pending: { id: Date.now(), message, onUndo } }),
  dismiss: () => set({ pending: null }),
}));
