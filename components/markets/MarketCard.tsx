'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Users, Clock, TrendingUp, ChevronRight } from 'lucide-react';
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

      if (diff <= 0) {
        setTimeLeft('Ended');
        return;
      }

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

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        onClick={onClick}
        className="group cursor-pointer bg-white border-gray-100 hover:border-black/10 hover:shadow-2xl hover:shadow-black/5 transition-all p-0 overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Badge 
              mode={market.stakeMode}
            />
            <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
              <Clock size={12} />
              {timeLeft}
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-black transition-colors">
            {market.question}
          </h3>

          <div className="space-y-4">
            {/* Probability Bar */}
            <div className="relative h-12 w-full rounded-2xl overflow-hidden flex bg-gray-50 border border-gray-50">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${yesPercent}%` }}
                className="h-full bg-btc-orange flex items-center pl-4 relative"
              >
                <span className="text-xs font-black text-white uppercase tracking-tighter">Yes</span>
              </motion.div>
              <motion.div 
                initial={{ width: '100%' }}
                animate={{ width: `${noPercent}%` }}
                className="h-full bg-mezo-teal flex items-center justify-end pr-4"
              >
                 <span className="text-xs font-black text-white uppercase tracking-tighter">No</span>
              </motion.div>
              
              <div className="absolute inset-0 flex justify-between items-center px-4 pointer-events-none">
                <span className="text-[10px] font-bold text-white/90">{yesPercent}%</span>
                <span className="text-[10px] font-bold text-white/90">{noPercent}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Total Volume</span>
                  <span className="text-sm font-black text-gray-900">{totalMUSD} MUSD</span>
                </div>
                <div className="h-4 w-px bg-gray-100" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Resolver</span>
                  <span className="text-sm font-black text-gray-900 truncate max-w-[80px]">
                    {market.resolverAddress === '0x' ? 'System' : market.resolverAddress?.slice(0, 6)}
                  </span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-black group-hover:text-white transition-all transform group-hover:scale-110">
                <ChevronRight size={16} />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
