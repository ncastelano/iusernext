import { useEffect, RefObject } from "react";

export function useTouchScroll(containerRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onTouchStart = (e: TouchEvent) => {
      const startX = e.touches[0].clientX;
      const scrollLeft = container.scrollLeft;

      const onTouchMove = (e: TouchEvent) => {
        const x = e.touches[0].clientX;
        container.scrollLeft = scrollLeft + (startX - x);
      };

      const cleanup = () => {
        container.removeEventListener("touchmove", onTouchMove);
        container.removeEventListener("touchend", cleanup);
      };

      container.addEventListener("touchmove", onTouchMove);
      container.addEventListener("touchend", cleanup);
    };

    container.addEventListener("touchstart", onTouchStart);
    return () => container.removeEventListener("touchstart", onTouchStart);
  }, [containerRef]);
}
