import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Resets the window scroll position to the top on every route change.
 * Mount once inside the router. Uses an instant jump to avoid any
 * delayed scroll animation or layout shift between pages.
 */
export function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location]);

  return null;
}
