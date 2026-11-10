import type Lenis from "lenis";

let pendingNavigation: { hash: string } | null = null;
let lenisInstance: Lenis | null = null;

export function setPendingNavigation(hash: string) {
  pendingNavigation = { hash };
}

export function takePendingNavigation() {
  const navigation = pendingNavigation;
  pendingNavigation = null;
  return navigation;
}

export function setLenisInstance(instance: Lenis | null) {
  lenisInstance = instance;
}

export function resetScroll() {
  lenisInstance?.scrollTo(0, { immediate: true, force: true });
}

export function stopScroll() {
  if (lenisInstance) {
    lenisInstance.stop();
    return;
  }

  if (typeof document !== "undefined") {
    document.documentElement.style.overflow = "hidden";
  }
}

export function startScroll() {
  if (lenisInstance) {
    lenisInstance.start();
    return;
  }

  if (typeof document !== "undefined") {
    document.documentElement.style.overflow = "";
  }
}
