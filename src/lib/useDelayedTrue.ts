import { useEffect, useState } from 'react';

/** Returns true only after `value` has been continuously true for `delayMs`. Resets immediately when `value` goes false. */
export function useDelayedTrue(value: boolean, delayMs: number): boolean {
  const [delayed, setDelayed] = useState(false);

  useEffect(() => {
    if (!value) {
      setDelayed(false);
      return;
    }
    const timer = setTimeout(() => setDelayed(true), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return delayed;
}
