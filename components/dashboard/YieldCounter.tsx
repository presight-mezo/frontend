"use client";

import React, { useEffect, useState } from "react";

interface YieldCounterProps {
  /** Starting accrued MUSD amount */
  initialAmount?: number;
  /** MUSD per second accrual rate (simulated) */
  ratePerSecond?: number;
  className?: string;
}

const YieldCounter: React.FC<YieldCounterProps> = ({
  initialAmount = 0.42,
  ratePerSecond = 0.000003,
  className = "",
}) => {
  const [accrued, setAccrued] = useState(initialAmount);

  // Sync internal state with prop changes (from API refreshes)
  useEffect(() => {
    setAccrued(initialAmount);
  }, [initialAmount]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAccrued((prev) => prev + ratePerSecond);
    }, 1000); // tick every 1s for better "live" feel

    return () => clearInterval(interval);
  }, [ratePerSecond]);

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${className}`}
      style={{
        background: "rgba(0, 194, 168, 0.08)",
        borderColor: "rgba(0, 194, 168, 0.25)",
        color: "#00C2A8",
      }}
    >
      <span
        className="material-symbols-outlined text-sm"
        style={{ fontVariationSettings: "'wght' 500", color: "#00C2A8" }}
      >
        trending_up
      </span>
      <span>
        Yield accruing:{" "}
        <span className="tabular-nums">{accrued.toFixed(4)}</span> MUSD ↑
      </span>
    </div>
  );
};

export default YieldCounter;
