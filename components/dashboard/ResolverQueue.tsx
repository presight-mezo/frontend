"use client";

import React from "react";
import Link from "next/link";

interface PendingMarket {
  id: string;
  question: string;
  groupName?: string;
  totalMUSD?: string | number;
  deadline?: string;
  color?: string;
}

const ResolverQueue = ({ markets = [], loading = false }: { markets?: PendingMarket[]; loading?: boolean }) => {
  if (!loading && markets.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl p-8 flex flex-col h-full shadow-sm border border-black/[0.05] relative overflow-hidden group">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl -z-10 group-hover:bg-orange-500/10 transition-colors duration-700" />
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-orange-500">
            Action Required: Resolver Queue
          </h3>
          <p className="text-[10px] text-gray-400 font-medium mt-0.5 uppercase tracking-wider">
            Markets awaiting your trusted arbitration
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!loading && (
            <>
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-orange-500">{markets.length} Markets</span>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4 flex-1">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="p-5 rounded-2xl bg-gray-50 border border-black/[0.03] animate-pulse">
              <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-1/2 bg-gray-100 rounded" />
            </div>
          ))
        ) : (
          markets.map((market) => (
            <div 
              key={market.id} 
              className="p-5 rounded-2xl bg-gray-50 border border-black/[0.03] flex flex-col gap-4 hover:border-orange-500 transition-all hover:bg-white active:scale-95 cursor-pointer group/card"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                    {market.groupName || "Prediction Market"}
                  </p>
                  <h4 className="font-headline font-bold text-sm text-black leading-tight">
                    {market.question}
                  </h4>
                </div>
                {market.deadline && (
                  <div className="text-[9px] font-bold px-2 py-1 bg-white border border-black/[0.05] rounded-full text-orange-500 tabular-nums">
                    {market.deadline}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Total Pool</span>
                  <span className="text-xs font-bold text-black tabular-nums">{market.totalMUSD || "0.00"} MUSD</span>
                </div>
                <Link href={`/app/markets/${market.id}`}>
                  <button className="px-4 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all shadow-md">
                    Resolve Now
                  </button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-8 pt-4 border-t border-black/[0.03]">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          <span className="material-symbols-outlined text-sm">security</span>
          <span>Community Trusted Arbitration</span>
        </div>
      </div>
    </div>
  );
};

export default ResolverQueue;
