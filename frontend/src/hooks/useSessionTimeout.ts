import { useEffect, useRef, useCallback } from "react";

/**
 * Auto-locks the app after a period of user inactivity.
 * Tracks mouse, keyboard, touch, and scroll events.
 * Checks every 30 seconds whether the timeout has elapsed.
 */
export function useSessionTimeout(
  onTimeout: () => void,
  timeoutMs: number = 15 * 60 * 1000
): { resetTimer: () => void } {
  const lastActivityRef = useRef(Date.now());
  const onTimeoutRef = useRef(onTimeout);

  // Keep callback ref current without re-running effects
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    // Reset on mount so the timer starts fresh
    lastActivityRef.current = Date.now();

    const activityEvents: (keyof WindowEventMap)[] = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
    ];

    const handleActivity = () => {
      lastActivityRef.current = Date.now();
    };

    activityEvents.forEach((event) =>
      window.addEventListener(event, handleActivity, { passive: true })
    );

    const intervalId = setInterval(() => {
      if (Date.now() - lastActivityRef.current >= timeoutMs) {
        onTimeoutRef.current();
      }
    }, 30_000);

    return () => {
      activityEvents.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );
      clearInterval(intervalId);
    };
  }, [timeoutMs]);

  return { resetTimer };
}
