"use client";

import React, { useEffect, useState, useCallback } from "react";
import { usePresightApi } from "@/lib/ApiProvider";
import { useAccount } from "wagmi";

// ─── Types ────────────────────────────────────────────────────────────────────

type StakeDirection = "YES" | "NO" | "ZERO_RISK";

interface StakeEvent {
  id: string;
  time: string;       
  direction: StakeDirection;
  amount: string | number;     
  walletInitial: string;
  marketLabel: string;
}

const directionMeta: Record<StakeDirection, { color: string; bg: string; icon: string }> = {
  YES:       { color: "#3b82f6", bg: "bg-primary",        icon: "check_circle" },
  NO:        { color: "#f97316", bg: "bg-secondary",      icon: "cancel" },
  ZERO_RISK: { color: "#22c55e", bg: "bg-accent-green",   icon: "bolt" },
};

// ─── Live Stake Feed ──────────────────────────────────────────────────────────

const LiveStakeFeed = () => {
  const { ws } = usePresightApi();
  const [stakes, setStakes] = useState<StakeEvent[]>([]);

  const handleNewStake = useCallback((data: any) => {
    const newEvent: StakeEvent = {
      id: data.txHash || Math.random().toString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      direction: data.direction as StakeDirection,
      amount: data.amount === "???" ? "Masked" : data.amount,
      walletInitial: "0x",
      marketLabel: data.marketId ? `Market: ${data.marketId.slice(0, 10)}...` : "New Stake Placed",
    };

    setStakes(prev => [newEvent, ...prev].slice(0, 6));
  }, []);

  useEffect(() => {
    if (!ws) return;

    // Use the custom .on() method from PresightWebSocket
    const unsubscribe = ws.on("stake:placed", (message: any) => {
      // The message is already the full event object from the server broadcast
      if (message.data) {
        handleNewStake(message.data);
      }
    });

    return () => unsubscribe();
  }, [ws, handleNewStake]);

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
        {stakes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 py-20">
             <div className="relative mb-6">
               <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center animate-pulse">
                 <span className="material-symbols-outlined text-gray-300 text-3xl">sensors</span>
               </div>
               <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-primary/20 animate-ping opacity-20" />
             </div>
             <p className="text-[11px] font-black text-black/50 uppercase tracking-[0.2em] leading-relaxed">
               Scanning for<br/>Market Activity
             </p>
             <p className="text-[10px] text-black/20 font-bold uppercase tracking-widest mt-2">
               New events will stream here
             </p>
          </div>
        ) : (
          stakes.map((stake) => {
            const meta = directionMeta[stake.direction] || directionMeta.YES;
            const isZeroRisk = stake.direction === "ZERO_RISK";

            return (
              <div key={stake.id} className="relative py-1.5 animate-in slide-in-from-left-4 fade-in duration-500">
                <span className="absolute -left-[4.5rem] top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300 tabular-nums">
                  {stake.time}
                </span>

                <div className="w-full">
                  <div
                    className="w-full h-10 rounded-full flex items-center justify-between px-3 transition-all hover:scale-[1.02] cursor-pointer shadow-sm border border-black/[0.03]"
                    style={{ 
                      background: isZeroRisk ? "rgba(34, 197, 94, 0.05)" : "white",
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black"
                      style={{
                        background: isZeroRisk ? "#22c55e" : meta.color,
                        color: "#fff",
                      }}
                    >
                      {stake.walletInitial}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className="text-[11px] font-black tracking-tight"
                        style={{ color: isZeroRisk ? "#22c55e" : "#000" }}
                      >
                        {typeof stake.amount === 'number' ? stake.amount.toLocaleString() : stake.amount} MUSD
                      </span>
                      <span
                        className="material-symbols-outlined text-[14px]"
                        style={{
                          fontVariationSettings: "'wght' 700",
                          color: isZeroRisk ? "#22c55e" : meta.color,
                        }}
                      >
                        {meta.icon}
                      </span>
                    </div>
                  </div>

                  <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1.5 pl-3 truncate">
                    {stake.marketLabel}
                  </div>
                </div>
              </div>
            );
          })
        )}
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
        <span className="text-gray-300">Live Stream</span>
      </div>
    </div>
  );
};

export default LiveStakeFeed;
