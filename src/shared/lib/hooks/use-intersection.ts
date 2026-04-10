"use client";

import { useEffect, useRef } from "react";

/**
 * Fires `onIntersect` whenever the returned ref target becomes visible.
 * Used for infinite-scroll sentinels.
 */
export function useIntersection<T extends HTMLElement>(
  onIntersect: () => void,
  options?: { rootMargin?: string; enabled?: boolean }
) {
  const ref = useRef<T | null>(null);
  const cbRef = useRef(onIntersect);

  // Keep the latest callback without re-subscribing the observer.
  useEffect(() => {
    cbRef.current = onIntersect;
  });

  const enabled = options?.enabled ?? true;
  const rootMargin = options?.rootMargin ?? "200px";

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            cbRef.current();
            break;
          }
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled, rootMargin]);

  return ref;
}
