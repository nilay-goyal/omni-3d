// useNearFoldPrefetch.ts
// Prefetches next page images when user scrolls past 70% of grid
import { useEffect, useRef } from 'react';

export function useNearFoldPrefetch({ getNextImageUrls, enabled = true }: {
  getNextImageUrls: () => string[],
  enabled?: boolean
}) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!enabled || !gridRef.current) return;
    let triggered = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !triggered) {
          triggered = true;
          // Prefetch next page images using requestIdleCallback
          window.requestIdleCallback(() => {
            const urls = getNextImageUrls().slice(0, 12);
            urls.forEach(url => {
              const img = new window.Image();
              img.src = url;
            });
          });
        }
      });
    }, {
      threshold: 0.7
    });
    observer.observe(gridRef.current);
    return () => observer.disconnect();
  }, [enabled, getNextImageUrls]);
  return gridRef;
}
