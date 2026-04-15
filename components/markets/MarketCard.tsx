'use client';

import { useState, useEffect } from 'react';
import { Clock, ChevronRight, ShieldCheck, Flame, Scale, TrendingUp } from 'lucide-react';
import { formatUnits } from 'viem';

interface MarketCardProps {
  market: {
    id: string;
    question: string;
    endTime: number;
    stakeMode: 'full-stake' | 'zero-risk';
    yesAmount?: string;
    noAmount?: string;
    description?: string;
    resolverAddress?: string;
    status?: string;
  };
  onClick?: () => void;
}

export function MarketCard({ market, onClick }: MarketCardProps) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = market.endTime - now;
      if (diff <= 0) { setTimeLeft('Ended'); return; }
      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      const mins = Math.floor((diff % 3600) / 60);
      if (days > 0) setTimeLeft(`${days}d ${hours}h`);
      else if (hours > 0) setTimeLeft(`${hours}h ${mins}m`);
      else setTimeLeft(`${mins}m`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [market.endTime]);

  const yesAmount = BigInt(market.yesAmount || '0');
  const noAmount = BigInt(market.noAmount || '0');
  const totalAmount = yesAmount + noAmount;
  
  // Calculate exact percentages
  let yesPercent = 50;
  let noPercent = 50;
  if (totalAmount > BigInt(0)) {
    yesPercent = Number((yesAmount * BigInt(1000)) / totalAmount) / 10;
    noPercent = 100 - yesPercent;
  }
  
  const totalMUSD = parseFloat(formatUnits(totalAmount, 18)).toFixed(0);
  const isZeroRisk = market.stakeMode === 'zero-risk';

  return (
    <div
      onClick={onClick}
      className="group flex flex-col justify-between h-full cursor-pointer bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.1)] hover:border-gray-200"
    >
      <div className="flex-col flex h-full">
        {/* Header Badges */}
        <div className="flex items-start justify-between mb-5 gap-2">
          {/* Mode Badge */}
          <div className="flex bg-gray-50 border border-gray-100 rounded-full py-1.5 px-3 items-center gap-1.5">
            {isZeroRisk ? (
              <ShieldCheck size={14} className="text-emerald-600" />
            ) : (
              <Flame size={14} className="text-orange-600" />
            )}
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700 pt-[1px]">
              {isZeroRisk ? 'Zero Risk' : 'Full Stake'}
            </span>
          </div>

          {/* Timer Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-medium text-gray-500">
            <Clock size={12} className="text-gray-400" />
            <span className="pt-[1px]">{timeLeft || '—'}</span>
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 leading-snug line-clamp-3">
            {market.question}
          </h3>
        </div>

        {/* Lower Section (Pools + Stats) */}
        <div className="mt-auto space-y-6">
          {/* Progress Split Bar */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-lg font-bold text-emerald-600 leading-none">
                {yesPercent.toFixed(1)}<span className="text-sm font-medium text-emerald-600/70 ml-0.5">% Yes</span>
              </span>
              <span className="text-lg font-bold text-rose-500 leading-none">
                {noPercent.toFixed(1)}<span className="text-sm font-medium text-rose-500/70 ml-0.5">% No</span>
              </span>
            </div>

            {/* Split Track */}
            <div className="h-2 w-full bg-gray-100 rounded-full flex overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${yesPercent}%` }}
              />
              <div 
                className="h-full bg-rose-500 transition-all duration-500"
                style={{ width: `${noPercent}%` }}
              />
            </div>
          </div>

          {/* Footer Stats Row */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-5">
              {/* Volume */}
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-gray-400" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-medium text-gray-500 leading-none mb-1">Volume</span>
                  <span className="text-xs font-semibold text-gray-900 leading-none">{totalMUSD} MUSD</span>
                </div>
              </div>

              {/* Resolver */}
              <div className="flex items-center gap-2 hidden sm:flex">
                <Scale size={16} className="text-gray-400" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-medium text-gray-500 leading-none mb-1">Oracle</span>
                  <span className="text-xs font-semibold text-gray-900 leading-none truncate max-w-[80px]">
                    {market.resolverAddress === '0x' || !market.resolverAddress ? 'Mezo' : market.resolverAddress?.slice(0, 6)}
                  </span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-900 transition-colors">
              <ChevronRight size={16} strokeWidth={2} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
