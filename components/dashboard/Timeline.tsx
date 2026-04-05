"use client";

import React, { useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type StakeDirection = "YES" | "NO" | "ZERO_RISK";

interface StakeEvent {
  id: string;
  time: string;       
  direction: StakeDirection;
  amount: number;     
  walletInitial: string;
  walletColor: string;
  marketLabel: string;
}

// ─── Mock live stake feed ───

const MOCK_STAKES: StakeEvent[] = [
  { id: "s1", time: "16:52", direction: "YES",       amount: 50,  walletInitial: "R", walletColor: "#3b82f6", marketLabel: "BTC > $120K?" },
  { id: "s2", time: "16:48", direction: "NO",        amount: 25,  walletInitial: "M", walletColor: "#f97316", marketLabel: "ETH Flip?" },
  { id: "s3", time: "16:41", direction: "YES",       amount: 100, walletInitial: "A", walletColor: "#3b82f6", marketLabel: "Halving rally?" },
  { id: "s4", time: "16:35", direction: "ZERO_RISK", amount: 8,   walletInitial: "K", walletColor: "#22c55e", marketLabel: "MUSD peg?" },
  { id: "s5", time: "16:22", direction: "NO",        amount: 30,  walletInitial: "T", walletColor: "#f97316", marketLabel: "BTC > $120K?" },
  { id: "s6", time: "16:09", direction: "YES",       amount: 75,  walletInitial: "D", walletColor: "#3b82f6", marketLabel: "Mezo TVL?" },
];

const MAX_STAKE = Math.max(...MOCK_STAKES.map((s) => s.amount));

const directionMeta: Record<StakeDirection, { color: string; bg: string; icon: string }> = {
  YES:       { color: "#3b82f6", bg: "bg-primary",        icon: "check_circle" },
  NO:        { color: "#f97316", bg: "bg-secondary",      icon: "cancel" },
  ZERO_RISK: { color: "#22c55e", bg: "bg-accent-green",   icon: "bolt" },
};

// ─── Live Stake Feed ──────────────────────────────────────────────────────────

const LiveStakeFeed = () => {
  const [stakes, setStakes] = useState<StakeEvent[]>(MOCK_STAKES);

  useEffect(() => {
    let idx = 0;
    const timer = setInterval(() => {
      idx++;
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="col-span-12 lg:col-span-12 xl:col-span-5 bg-white rounded-3xl p-8 flex flex-col h-full min-h-[584px] shadow-sm border border-black/[0.05]">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Live Stake Feed
          </h3>
          <p className="text-[10px] text-gray-300 font-medium mt-0.5 uppercase tracking-wider">
            Real-time market activity
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <div title="YES stakes" className="opacity-50 hover:opacity-100 transition-opacity cursor-help">
            <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'wght' 500" }}>check_circle</span>
          </div>
          <div title="NO stakes" className="opacity-50 hover:opacity-100 transition-opacity cursor-help">
            <span className="material-symbols-outlined text-sm text-secondary" style={{ fontVariationSettings: "'wght' 500" }}>cancel</span>
          </div>
          <div title="Zero Risk stakes" className="opacity-50 hover:opacity-100 transition-opacity cursor-help">
            <span className="material-symbols-outlined text-sm text-accent-green" style={{ fontVariationSettings: "'wght' 500" }}>bolt</span>
          </div>
          <div className="flex items-center gap-1.5 ml-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-300">LIVE</span>
          </div>
        </div>
      </div>

      {/* Stakes timeline */}
      <div className="flex-1 relative border-l border-gray-100 ml-12 space-y-6">
        {stakes.map((stake) => {
          const meta = directionMeta[stake.direction];
          const barWidthPct = Math.round((stake.amount / MAX_STAKE) * 100);
          const isZeroRisk = stake.direction === "ZERO_RISK";

          return (
            <div key={stake.id} className="relative py-1.5">
              <span className="absolute -left-[4.5rem] top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300 tabular-nums">
                {stake.time}
              </span>

              <div style={{ width: `${Math.max(barWidthPct, 35)}%` }}>
                <div
                  className="w-full h-8 rounded-full flex items-center justify-between px-2 transition-all hover:scale-[1.02] cursor-pointer"
                  style={{ 
                    background: isZeroRisk ? "rgba(34, 197, 94, 0.1)" : meta.color,
                    border: isZeroRisk ? "1px solid rgba(34, 197, 94, 0.2)" : "none"
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black"
                    style={{
                      background: isZeroRisk ? "#22c55e" : "rgba(0,0,0,0.1)",
                      color: isZeroRisk ? "#fff" : "rgba(255,255,255,0.9)",
                    }}
                  >
                    {stake.walletInitial}
                  </div>

                  <div className="flex items-center gap-1">
                    <span
                      className="text-[10px] font-bold"
                      style={{ color: isZeroRisk ? "#22c55e" : "#fff" }}
                    >
                      {stake.amount} MUSD
                    </span>
                    <span
                      className="material-symbols-outlined text-[12px]"
                      style={{
                        fontVariationSettings: "'wght' 600",
                        color: isZeroRisk ? "#22c55e" : "#fff",
                      }}
                    >
                      {meta.icon}
                    </span>
                  </div>
                </div>

                <div className="text-[9px] text-gray-400 font-medium mt-0.5 pl-1 truncate">
                  {stake.marketLabel}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer legend */}
      <div className="mt-6 pt-4 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400 border-t border-gray-50">
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary inline-block" />
            YES
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary inline-block" />
            NO
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-green inline-block" />
            Zero Risk
          </span>
        </div>
        <span className="text-gray-300">Last 6 events</span>
      </div>
    </div>
  );
};

export default LiveStakeFeed;
