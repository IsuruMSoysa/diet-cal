import { useState, useEffect } from "react";

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)"); // Tailwind's `md` breakpoint starts at 768px
    const handleChange = () => setIsMobile(mediaQuery.matches);

    // Set initial value
    handleChange();

    // Add event listener
    mediaQuery.addEventListener("change", handleChange);

    // Cleanup event listener on unmount
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return isMobile;
}
