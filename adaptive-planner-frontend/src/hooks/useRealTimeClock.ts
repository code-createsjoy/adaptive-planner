import { useState, useEffect } from 'react';

export interface RealTimeClockData {
  now: Date;
  timeFormatted: string;
  dateFormatted: string;
  minuteTimestamp: number;
}

/**
 * High-precision, low-overhead live clock hook
 * - Ticks every 1000ms for live digital clock display
 * - Exposes minuteTimestamp for components that only need minute-level recalculation
 */
export function useRealTimeClock(): RealTimeClockData {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeFormatted = now.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const dateFormatted = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const minuteTimestamp = Math.floor(now.getTime() / 60000);

  return {
    now,
    timeFormatted,
    dateFormatted,
    minuteTimestamp,
  };
}
