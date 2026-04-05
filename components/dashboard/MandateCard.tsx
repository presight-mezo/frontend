"use client";

import React from "react";
import Link from "next/link";

interface MandateCardProps {
  limit: string;
  status: "active" | "setup" | "warning";
  used: string;
  className?: string;
}

const MandateCard: React.FC<MandateCardProps> = ({
  limit,
  status,
  used,
  className = "",
}) => {
  const isActive = status === "active";
  
  return (
    <div className={`bg-white rounded-3xl p-8 flex flex-col justify-between h-[280px] shadow-sm border border-black/[0.05] group hover:border-primary/20 transition-all ${className}`}>
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Passport Mandate
          </span>
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-accent-green" : "bg-orange-500"} animate-pulse`} />
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? "text-accent-green" : "text-orange-500"}`}>
              {isActive ? "Active" : "Setup Required"}
            </span>
          </div>
        </div>
        <Link href="/app/onboard">
          <button className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-white border border-gray-100 transition-all active:scale-90">
            <span className="material-symbols-outlined text-lg">settings</span>
          </button>
        </Link>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-headline font-bold text-black tabular-nums tracking-tighter">
              {limit}
            </span>
            <span className="text-2xl font-headline font-bold text-primary">MUSD</span>
          </div>
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Spending Limit Per Market
          </div>
        </div>

        {/* Progress Bar for Mandate Usage */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
            <span className="text-gray-400">Used this period</span>
            <span className="text-black">{used} MUSD</span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-1000" 
              style={{ width: `${(parseFloat(used) / parseFloat(limit)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-black/[0.03] mt-2">
        <p className="text-[10px] text-gray-400 leading-relaxed italic">
          "Mezo Passport ensures every stake is gasless within your mandate limit."
        </p>
      </div>
    </div>
  );
};

export default MandateCard;
