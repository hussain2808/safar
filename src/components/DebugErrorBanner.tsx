import { useDebugErrorStore } from '@/lib/debugErrorLog';

// TEMPORARY DEBUG AID — see src/lib/debugErrorLog.ts

export function DebugErrorBanner() {
  const errors = useDebugErrorStore((s) => s.errors);
  const dismiss = useDebugErrorStore((s) => s.dismiss);
  const clearAll = useDebugErrorStore((s) => s.clearAll);

  if (!errors.length) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-[100] p-2 space-y-1.5 pointer-events-none">
      <div className="flex justify-end pointer-events-auto">
        {errors.length > 1 && (
          <button
            onClick={clearAll}
            className="text-[11px] text-white/80 bg-black/40 rounded px-2 py-0.5 mb-1"
          >
            Clear all
          </button>
        )}
      </div>
      {errors.map((e) => (
        <div
          key={e.id}
          className="pointer-events-auto bg-red-600 text-white text-[12px] leading-snug rounded-lg px-3 py-2 shadow-lg flex items-start gap-2"
        >
          <span className="flex-1 break-words font-mono">{e.message}</span>
          <button onClick={() => dismiss(e.id)} className="text-white/80 shrink-0 font-bold">
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
