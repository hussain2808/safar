import { create } from 'zustand';

// TEMPORARY DEBUG AID — remove this file + DebugErrorBanner.tsx + the App.tsx
// wiring once sync is confirmed stable. Patches console.error so any swallowed
// error (e.g. failed Firestore pushes) surfaces on screen instead of only
// in devtools.

interface DebugError {
  id: number;
  message: string;
  timestamp: number;
}

interface DebugErrorStore {
  errors: DebugError[];
  dismiss: (id: number) => void;
  clearAll: () => void;
}

let nextId = 0;

export const useDebugErrorStore = create<DebugErrorStore>((set) => ({
  errors: [],
  dismiss: (id) => set((s) => ({ errors: s.errors.filter((e) => e.id !== id) })),
  clearAll: () => set({ errors: [] }),
}));

let patched = false;

export function installDebugErrorCapture() {
  if (patched) return;
  patched = true;

  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    originalError(...args);
    const message = args.map((a) => (a instanceof Error ? a.message : String(a))).join(' ');
    useDebugErrorStore.setState((s) => ({
      errors: [...s.errors, { id: nextId++, message, timestamp: Date.now() }].slice(-5),
    }));
  };

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled rejection:', event.reason);
  });
}
