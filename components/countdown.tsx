"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
  endDate: Date;
}

export function Countdown({ endDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endDate.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
      <span>Migration ends in:</span>
      <div className="flex gap-1 font-mono text-cyan-400">
        <span className="bg-secondary px-2 py-1 rounded">{String(timeLeft.days).padStart(2, "0")}d</span>
        <span>:</span>
        <span className="bg-secondary px-2 py-1 rounded">{String(timeLeft.hours).padStart(2, "0")}h</span>
        <span>:</span>
        <span className="bg-secondary px-2 py-1 rounded">{String(timeLeft.minutes).padStart(2, "0")}m</span>
        <span>:</span>
        <span className="bg-secondary px-2 py-1 rounded">{String(timeLeft.seconds).padStart(2, "0")}s</span>
      </div>
    </div>
  );
}
