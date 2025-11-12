import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if the current device is mobile
 * @param breakpoint - The breakpoint in pixels to consider as mobile (default: 768)
 * @returns boolean indicating if the device is mobile
 */
export function useMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
}

