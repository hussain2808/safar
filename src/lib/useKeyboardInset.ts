import { useEffect, useState } from 'react';

/**
 * Height (px) of the on-screen keyboard currently covering the layout viewport,
 * derived from the gap between window.innerHeight and the VisualViewport.
 * Lets a `position: fixed` bottom bar float above the keyboard instead of
 * staying pinned to the (now-hidden) bottom of the layout viewport.
 */
export function useKeyboardInset() {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    function update() {
      const gap = window.innerHeight - viewport!.height - viewport!.offsetTop;
      setInset(Math.max(0, Math.round(gap)));
    }

    update();
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
    };
  }, []);

  return inset;
}
