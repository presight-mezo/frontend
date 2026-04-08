'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useMarkets, useStakes, useTrove } from '@/hooks/useApi';
import { useSiweAuth } from '@/hooks/useSiweAuth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Clock, Shield, Zap, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatUnits, parseUnits } from 'viem';

export default function MarketDetailPage({ params }: { params: Promise<{ marketId: string }> }) {
  const { marketId } = use(params);
  const router = useRouter();
  const { token } = useSiweAuth();
  
  const { getMarket: { data: marketData, execute: executeGetMarket } } = useMarkets(token || undefined);
  const { placeStake: { execute: executeStake, loading: stakeLoading, error: stakeError } } = useStakes(token || undefined);
  const { data: troveData, loading: troveLoading } = useTrove(token || undefined);
  
  const [stakeAmount, setStakeAmount] = useState('10');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [outcome, setOutcome] = useState<'YES' | 'NO' | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    executeGetMarket(marketId);
  }, [marketId]);

  const market = marketData as any;

  const handleStake = async (selectedOutcome: 'YES' | 'NO') => {
    if (!token || isSubmitting) return;
    
    setIsSubmitting(true);
    setOutcome(selectedOutcome);
    
    const amountWei = parseUnits(stakeAmount, 18).toString();
    const res = await executeStake({
      marketId,
      outcome: selectedOutcome,
      amount: amountWei
    });
    
    setIsSubmitting(false);
    if (!res.error) {
      setSuccess(true);
      executeGetMarket(marketId); // Refresh data
      setTimeout(() => setSuccess(false), 50000);
    }
  };

  if (!market && !marketData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
        <Loader2 className="h-10 w-10 animate-spin mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest text-center">Reading Market State...</p>
      </div>
    );
  }

  if (!market) return null;

  const yesAmount = BigInt(market.yesAmount || '0');
  const noAmount = BigInt(market.noAmount || '0');
  const totalAmount = yesAmount + noAmount;
  const yesPercent = totalAmount > BigInt(0) ? Number((yesAmount * BigInt(100)) / totalAmount) : 50;
  const noPercent = 100 - yesPercent;

  return (
    <section className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-xs font-black text-gray-400 hover:text-black uppercase tracking-[0.2em] transition-colors mb-4 group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Back to Group
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-8 md:p-12 border-gray-100 bg-white rounded-[32px] shadow-xl shadow-black/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
               <TrendingUp size={120} strokeWidth={3} />
            </div>

            <div className="relative z-10 space-y-8">
              <div className="flex flex-wrap items-center gap-4">
                <Badge mode={market.stakeMode} />
                <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-xl">
                  <Clock size={14} />
                  Ends in 2 days
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none">
                {market.question}
              </h1>

              {/* Progress Detail */}
              <div className="space-y-6">
                <div className="flex justify-between items-end mb-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Yes Pool</span>
                    <div className="text-2xl font-black text-gray-900 tracking-tight">
                      {parseFloat(formatUnits(yesAmount, 18)).toFixed(2)} <span className="text-sm font-bold text-gray-400">MUSD</span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">No Pool</span>
                    <div className="text-2xl font-black text-gray-900 tracking-tight">
                       {parseFloat(formatUnits(noAmount, 18)).toFixed(2)} <span className="text-sm font-bold text-gray-400">MUSD</span>
                    </div>
                  </div>
                </div>

                <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden flex">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${yesPercent}%` }}
                    className="h-full bg-btc-orange"
                  />
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${noPercent}%` }}
                    className="h-full bg-mezo-teal"
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] font-black text-gray-300 uppercase tracking-widest">
                  <span>{yesPercent}% Probability</span>
                  <span>{noPercent}% Probability</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Description Card */}
          <Card className="p-8 border-gray-100 bg-white rounded-3xl">
             <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Context</h3>
             <p className="text-gray-500 leading-relaxed font-medium">
               This market is resolved by <span className="text-gray-900 font-bold">{market.resolverAddress?.slice(0, 8)}...</span>. 
               {market.stakeMode === 'zero-risk' 
                 ? " Since this is a Zero Risk market, your principal MUSD is never locked - only your accrued yield from your Bitcoin trove is at stake." 
                 : " This is a High Conviction market. Your MUSD principal will be locked until the resolver calls the outcome."}
             </p>
          </Card>
        </div>

        {/* Sidebar Staking */}
        <div className="space-y-6">
          <Card className="p-8 border-gray-100 bg-white rounded-[32px] sticky top-8">
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-6">Place your stake</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Amount (MUSD)</label>
                <div className="relative">
                   <Input 
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="h-14 font-black text-lg border-gray-100 bg-gray-50 rounded-2xl"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase">
                    MAX
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => handleStake('YES')}
                  isLoading={isSubmitting && outcome === 'YES'}
                  disabled={isSubmitting}
                  className="h-20 flex-col bg-orange-50 border-2 border-transparent hover:border-orange-400 text-orange-600 rounded-2xl group transition-all"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Back</span>
                  <span className="text-xl font-black uppercase">Yes</span>
                </Button>
                <Button 
                  onClick={() => handleStake('NO')}
                  isLoading={isSubmitting && outcome === 'NO'}
                  disabled={isSubmitting}
                  className="h-20 flex-col bg-emerald-50 border-2 border-transparent hover:border-emerald-400 text-emerald-600 rounded-2xl group transition-all"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Back</span>
                  <span className="text-xl font-black uppercase">No</span>
                </Button>
              </div>

              <div className="pt-4 flex items-start gap-3 p-4 bg-blue-50 rounded-2xl text-blue-600 border border-blue-100">
                <Zap size={18} className="shrink-0 mt-0.5" />
                <p className="text-[11px] font-bold leading-tight uppercase tracking-tight">
                  Gasless transaction enabled via Mezo Passport Prediction Mandate.
                </p>
              </div>

              <AnimatePresence>
                {success && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 bg-emerald-500 text-white rounded-2xl text-center font-bold text-sm shadow-lg shadow-emerald-500/20"
                  >
                    🚀 Stake Successful!
                  </motion.div>
                )}
                {stakeError && (
                   <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-red-50 text-red-500 rounded-2xl text-xs font-bold border border-red-100"
                  >
                    {stakeError}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>

          <Card className="p-6 border-gray-100 bg-gray-50/50 rounded-3xl flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400">
               <AlertCircle size={20} />
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Prediction Status</span>
                <span className="text-sm font-bold text-gray-900">Active - Ends Friday</span>
             </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
