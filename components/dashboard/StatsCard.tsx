"use client";

import React, { useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface StatsCardProps {
  title: string;
  value: string | number;
  unit: string;
  change?: string;
  isUp?: boolean;
  subtext?: string;
  type: "sparkline" | "bars";
  color?: "primary" | "secondary" | "purple" | "green";
  className?: string;
  loading?: boolean;
}

const colorMap = {
  primary: { text: "text-primary", bg: "bg-primary", hex: "#F7931A" },
  secondary: { text: "text-secondary", bg: "bg-secondary", hex: "#000000" },
  purple: { text: "text-accent-purple", bg: "bg-accent-purple", hex: "#A855F7" },
  green: { text: "text-accent-green", bg: "bg-accent-green", hex: "#22C55E" },
};

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
  loading = false,
}) => {
  const meta = colorMap[color];

  return (
    <div className={`bg-white rounded-3xl p-8 flex flex-col justify-between h-[280px] shadow-sm border border-black/[0.05] ${className}`}>
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{title}</span>
        <span className="text-gray-300 font-bold cursor-pointer hover:text-gray-500 transition-colors">···</span>
      </div>

      <div className="space-y-1">
        {loading ? (
          <div className="space-y-3">
            <div className="h-10 w-32 bg-gray-100 animate-pulse rounded-lg" />
            <div className="h-3 w-24 bg-gray-50 animate-pulse rounded-full" />
          </div>
        ) : (
          <>
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className="text-4xl font-headline font-bold text-black tabular-nums tracking-tight">
                {value}
              </span>
              <span className={`text-xl font-headline font-bold ${meta.text}`}>{unit}</span>
            </div>
            {change && (
              <div className="flex items-center gap-1 text-gray-600">
                <span className={`material-symbols-outlined text-sm ${meta.text}`} style={{ fontVariationSettings: "'wght' 500" }}>
                  {isUp ? "arrow_drop_up" : "arrow_drop_down"}
                </span>
                <span className="text-xs font-bold">{change}</span>
              </div>
            )}
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{subtext}</div>
          </>
        )}
      </div>

      <div className="h-16 w-full mt-2 relative">
        {type === "sparkline" ? (
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30">
            <path
              d="M0 25 L10 18 L20 22 L30 12 L40 16 L50 9 L60 14 L70 6 L80 11 L90 4 L100 8"
              fill="none"
              stroke={meta.hex}
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              className={loading ? "opacity-10" : "opacity-30"}
            />
          </svg>
        ) : (
          <div className="grid grid-cols-8 gap-1 items-end h-12">
            {[30, 60, 40, 80, 50, 70, 45, 90].map((h, i) => (
              <div
                key={i}
                className={`rounded-full ${meta.bg} transition-all opacity-20`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Markets Activity (Volume Chart) ─────────────────────────────────────────

interface MarketData {
  id: string;
  question: string;
  yes_pool: string | number;
  no_pool: string | number;
}

export const MarketsActivity = ({ markets = [], loading = false }: { markets?: MarketData[]; loading?: boolean }) => {
  const displayMarkets = markets.slice(0, 9);
  const totalMUSD = displayMarkets.reduce((acc, m) => acc + Number(m.yes_pool) + Number(m.no_pool), 0);
  const maxTotal = Math.max(...displayMarkets.map((m) => Number(m.yes_pool) + Number(m.no_pool)), 1);

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
        {loading ? (
          Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1 w-10 h-full justify-end animate-pulse">
              <div className="bg-gray-100 rounded-full w-full h-[40%]" />
              <div className="bg-gray-50 rounded-full w-full h-[20%]" />
            </div>
          ))
        ) : displayMarkets.length === 0 ? (
          <div className="col-span-9 h-full flex items-center justify-center text-[10px] font-bold text-gray-300 uppercase tracking-widest">
            No active markets found
          </div>
        ) : (
          displayMarkets.map((market, i) => {
            const yes = Number(market.yes_pool);
            const no = Number(market.no_pool);
            const total = yes + no;
            const scale = total / maxTotal; 
            const yesH = Math.round((yes / total) * 100 * scale);
            const noH = Math.round((no / total) * 100 * scale);

            return (
              <div
                key={market.id || i}
                className="flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer"
                title={market.question}
              >
                <div
                  className="w-10 rounded-full bg-primary flex items-center justify-center text-white text-[9px] font-bold transition-all group-hover:scale-105"
                  style={{ height: `${Math.max(yesH, 14)}%`, minHeight: "18px" }}
                >
                  {yes > 100 ? Math.round(yes) : ""}
                </div>
                <div
                  className="w-10 rounded-full bg-secondary flex items-center justify-center text-white text-[9px] font-bold transition-all group-hover:scale-105"
                  style={{ height: `${Math.max(noH, 10)}%`, minHeight: "14px" }}
                >
                  {no > 100 ? Math.round(no) : ""}
                </div>
              </div>
            );
          })
        )}
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
        </div>
        <span className="text-gray-400">
          Platform Volume: <span className="text-black font-bold">{Math.round(totalMUSD).toLocaleString()} MUSD</span>
        </span>
      </div>
    </div>
  );
};

export const VolumeChart = MarketsActivity;

export default StatsCard;
