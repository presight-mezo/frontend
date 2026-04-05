"use client";

import React, { useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface StatsCardProps {
  title: string;
  value: string;
  unit: string;
  change: string;
  isUp: boolean;
  subtext: string;
  type: "sparkline" | "bars";
  color?: "primary" | "secondary" | "purple" | "green";
  className?: string;
}

// ─── Mock data (swap for live API responses) ──────────────────────────────────

const MOCK_MARKETS: Array<{ label: string; yes: number; no: number }> = [
  { label: "BTC > $120K?",  yes: 92, no: 28 },
  { label: "ETH Flip?",     yes: 40, no: 96 },
  { label: "Halving rally?", yes: 80, no: 49 },
  { label: "MUSD peg?",     yes: 67, no: 34 },
  { label: "Mezo TVL?",     yes: 58, no: 20 },
  { label: "BTC > $100K?",  yes: 84, no: 39 },
  { label: "ETF flows?",    yes: 48, no: 51 },
  { label: "Macro pump?",   yes: 72, no: 36 },
  { label: "OP staking?",   yes: 52, no: 81 },
];

const colorMap = {
  primary: { text: "text-primary", bg: "bg-primary", hex: "var(--color-primary)" },
  secondary: { text: "text-secondary", bg: "bg-secondary", hex: "var(--color-secondary)" },
  purple: { text: "text-accent-purple", bg: "bg-accent-purple", hex: "var(--color-accent-purple)" },
  green: { text: "text-accent-green", bg: "bg-accent-green", hex: "var(--color-accent-green)" },
};

// ─── StatsCard ────────────────────────────────────────────────────────────────

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  unit,
  change,
  isUp,
  subtext,
  type,
  color = "primary",
  className = "",
}) => {
  const meta = colorMap[color];

  return (
    <div className={`bg-white rounded-3xl p-8 flex flex-col justify-between h-[280px] shadow-sm border border-black/[0.05] ${className}`}>
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{title}</span>
        <span className="text-gray-300 font-bold cursor-pointer hover:text-gray-500 transition-colors">···</span>
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-headline font-bold text-black tabular-nums tracking-tighter">
            {value}
          </span>
          <span className={`text-2xl font-headline font-bold ${meta.text}`}>{unit}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <span className={`material-symbols-outlined text-sm ${meta.text}`} style={{ fontVariationSettings: "'wght' 500" }}>
            {isUp ? "arrow_drop_up" : "arrow_drop_down"}
          </span>
          <span className="text-xs font-bold">{change}</span>
        </div>
        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{subtext}</div>
      </div>

      {type === "sparkline" && (
        <div className="h-16 w-full mt-2">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30">
            <defs>
              <linearGradient id={`sparkGrad-${color}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={meta.hex} stopOpacity="0.2" />
                <stop offset="100%" stopColor={meta.hex} stopOpacity="1" />
              </linearGradient>
            </defs>
            <path
              d="M0 25 L10 18 L20 22 L30 12 L40 16 L50 9 L60 14 L70 6 L80 11 L90 4 L100 8"
              fill="none"
              stroke={`url(#sparkGrad-${color})`}
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}

      {type === "bars" && (
        <div className="grid grid-cols-8 gap-1 items-end h-12 mt-2">
          {[
            { h: 30, c: "secondary" },
            { h: 60, c: "primary" },
            { h: 40, c: "gray-100" },
            { h: 80, c: "secondary" },
            { h: 50, c: "accent-purple" },
            { h: 70, c: "primary" },
            { h: 45, c: "gray-100" },
            { h: 90, c: "secondary" },
          ].map((bar, i) => (
            <div
              key={i}
              className={`rounded-full bg-${bar.c} transition-all opacity-80 hover:opacity-100`}
              style={{ height: `${bar.h}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Markets Activity (Volume Chart) ─────────────────────────────────────────

export const MarketsActivity = () => {
  const [markets] = useState(MOCK_MARKETS);
  const totalMUSD = markets.reduce((acc, m) => acc + m.yes + m.no, 0);
  const maxTotal = Math.max(...markets.map((m) => m.yes + m.no));

  return (
    <div className="col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-black/[0.05]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Markets Activity
          </h3>
          <p className="text-[10px] text-gray-300 font-medium mt-0.5 uppercase tracking-wider">
            YES vs NO pool distribution
          </p>
        </div>
        <span className="text-gray-300 font-bold cursor-pointer hover:text-gray-500 transition-colors">···</span>
      </div>

      <div className="grid grid-cols-9 gap-3 h-52 items-end justify-items-center border-b border-gray-50 pb-3">
        {markets.map((market, i) => {
          const total = market.yes + market.no;
          const scale = total / maxTotal; 
          const yesH = Math.round(market.yes * scale);
          const noH = Math.round(market.no * scale);

          return (
            <div
              key={i}
              className="flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer"
              title={market.label}
            >
              <div
                className="w-10 rounded-full bg-primary flex items-center justify-center text-white text-[9px] font-bold transition-all group-hover:scale-105"
                style={{ height: `${Math.max(yesH, 14)}%`, minHeight: "18px" }}
              >
                {market.yes > 30 ? market.yes : ""}
              </div>
              <div
                className="w-10 rounded-full bg-secondary flex items-center justify-center text-white text-[9px] font-bold transition-all group-hover:scale-105"
                style={{ height: `${Math.max(noH, 10)}%`, minHeight: "14px" }}
              >
                {market.no > 30 ? market.no : ""}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
        <div className="flex gap-5">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary inline-block" />
            YES Pool
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary inline-block" />
            NO Pool
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-100 inline-block" />
            Pending
          </span>
        </div>
        <span className="text-gray-400">
          Total: <span className="text-black font-bold">{totalMUSD.toLocaleString()} MUSD</span>
        </span>
      </div>
    </div>
  );
};

export const VolumeChart = MarketsActivity;

export default StatsCard;
