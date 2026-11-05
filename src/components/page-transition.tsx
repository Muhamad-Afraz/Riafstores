"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { resetScroll, setPendingNavigation } from "@/lib/scroll";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);
  const allowNavigationRef = useRef(false);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (allowNavigationRef.current) return;
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest("a");
      if (!anchor || (anchor.target && anchor.target !== "_self")) return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/")) return;

      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        allowNavigationRef.current = true;
        anchor.click();
        allowNavigationRef.current = false;
        return;
      }

      setPendingNavigation(url.hash);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);

      containerRef.current?.classList.add("page-leave");
      timeoutRef.current = window.setTimeout(() => {
        resetScroll();

        if (url.hash) {
          router.push(url.pathname + url.search);
          return;
        }

        allowNavigationRef.current = true;
        anchor.click();
        allowNavigationRef.current = false;
      }, 170);
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [router]);

  useEffect(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    containerRef.current?.classList.remove("page-leave");
  }, [pathname]);

  return (
    <div ref={containerRef} key={pathname} className="page-enter">
      {children}
    </div>
  );
}
