"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { setLenisInstance, takePendingNavigation } from "@/lib/scroll";

export function SmoothScroll() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (time) => Math.min(1, 1.001 - Math.pow(2, -10 * time)),
      smoothWheel: true,
      anchors: true,
    });
    lenisRef.current = lenis;
    setLenisInstance(lenis);

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };

    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
      setLenisInstance(null);
    };
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    const pending = takePendingNavigation();
    const hash = pending ? pending.hash : window.location.hash;

    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        lenis.resize();

        if (hash) {
          try {
            const target = document.querySelector(hash);
            if (target instanceof HTMLElement) {
              lenis.scrollTo(target, { duration: 1.2 });
              if (pending?.hash) {
                window.history.replaceState(
                  window.history.state,
                  "",
                  `${window.location.pathname}${window.location.search}${pending.hash}`,
                );
              }
              return;
            }
          } catch {
            // Ignore invalid hash selectors and fall back to the top.
          }
        }

        if (pending) {
          lenis.scrollTo(0, { immediate: true, force: true });
        } else {
          lenis.scrollTo(window.scrollY, { immediate: true, force: true });
        }
      });
    });

    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [pathname]);

  return null;
}
