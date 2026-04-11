'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, ChevronRight } from 'lucide-react';
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
  const yesPercent = totalAmount > BigInt(0) ? Number((yesAmount * BigInt(100)) / totalAmount) : 50;
  const noPercent = 100 - yesPercent;
  const totalMUSD = parseFloat(formatUnits(totalAmount, 18)).toFixed(2);

  const isZeroRisk = market.stakeMode === 'zero-risk';

  return (
    <motion.div
      onClick={onClick}
      className="glass-card cursor-pointer p-6 relative overflow-hidden group"
      whileHover={{ y: -6, boxShadow: '0 20px 48px rgba(0,0,0,0.12)' }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
    >
      {/* Subtle gradient accent top strip */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{
          background: isZeroRisk
            ? 'linear-gradient(90deg, #3b82f6, #60a5fa)'
            : 'linear-gradient(90deg, #f97316, #fb923c)',
        }}
      />

      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        {/* Stake mode badge */}
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
            isZeroRisk
              ? 'bg-blue-50/80 text-blue-700 border-blue-200/60'
              : 'bg-orange-50/80 text-orange-700 border-orange-200/60'
          }`}
        >
          <span className="text-[12px]">{isZeroRisk ? '😎' : '🔥'}</span>
          {isZeroRisk ? 'Zero Risk' : 'Full Stake'}
        </div>

        {/* Timer */}
        <div className="flex items-center gap-1.5 text-gray-400 font-bold text-[10px] uppercase tracking-widest bg-white/50 px-2.5 py-1 rounded-full border border-white/70">
          <Clock size={11} />
          {timeLeft || '—'}
        </div>
      </div>

      {/* Question */}
      <h3 className="text-[18px] font-bold text-gray-900 mb-5 leading-snug tracking-tight group-hover:text-black transition-colors">
        {market.question}
      </h3>

      {/* Progress bars */}
      <div className="space-y-2.5 mb-5">
        {/* YES */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[11px] font-bold">
            <span className="text-gray-500">Yes</span>
            <span className="text-gray-800">{yesPercent}%</span>
          </div>
          <div className="h-[7px] w-full bg-white/60 rounded-full overflow-hidden border border-white/70">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${yesPercent}%` }}
              transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] as any }}
              className="h-full bg-emerald-400 rounded-full"
            />
          </div>
        </div>
        {/* NO */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[11px] font-bold">
            <span className="text-gray-500">No</span>
            <span className="text-gray-800">{noPercent}%</span>
          </div>
          <div className="h-[7px] w-full bg-white/60 rounded-full overflow-hidden border border-white/70">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${noPercent}%` }}
              transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] as any, delay: 0.08 }}
              className="h-full bg-gray-300 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between pt-3 border-t border-black/5">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Volume</span>
            <span className="text-[13px] font-bold text-gray-900">{totalMUSD} MUSD</span>
          </div>
          <div className="h-4 w-px bg-black/8" />
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Resolver</span>
            <span className="text-[13px] font-bold text-gray-900 truncate max-w-[72px]">
              {market.resolverAddress === '0x' ? 'System' : market.resolverAddress?.slice(0, 6)}
            </span>
          </div>
        </div>

        <motion.div
          className="w-8 h-8 rounded-full bg-white/70 border border-white flex items-center justify-center text-gray-300"
          whileHover={{ scale: 1.15, backgroundColor: '#0a0a0a', color: '#fff' }}
          transition={{ type: 'spring', stiffness: 380, damping: 20 }}
        >
          <ChevronRight size={15} />
        </motion.div>
      </div>
    </motion.div>
  );
}
