'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useMarkets, useStakes } from '@/hooks/useApi';
import { useSiweAuth } from '@/hooks/useSiweAuth';
import { Loader2, ArrowLeft, ShieldCheck, Flame, CircleDollarSign, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { parseUnits, formatUnits } from 'viem';

export default function MarketDetailPage({ params }: { params: Promise<{ marketId: string }> }) {
  const { marketId } = use(params);
  const router = useRouter();
  const { token, address } = useSiweAuth();

  const { getMarket: { data: marketData, execute: executeGetMarket } } = useMarkets(token || undefined);
  const { placeStake: { execute: executeStake, error: stakeError }, getStakes: { data: stakesResponse, execute: executeGetStakes } } = useStakes(token || undefined);

  const [stakeAmount, setStakeAmount] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [outcome, setOutcome] = useState<'YES' | 'NO' | null>(null);
  const [success, setSuccess] = useState(false);
  const [simulatedYield, setSimulatedYield] = useState<number>(0);

  useEffect(() => { 
    executeGetMarket(marketId); 
    executeGetStakes(marketId);
  }, [marketId, executeGetMarket, executeGetStakes]);

  useEffect(() => {
    const market = marketData as any;
    if (!market || market.mode !== 'zero-risk' || !market.simulatedYieldBase) return;
    
    // Simulate yield incrementing
    const base = parseFloat(market.simulatedYieldBase);
    const rate = parseFloat(market.simulatedYieldRatePerSecond || "0.0000000001");
    
    setSimulatedYield(base);
    
    const interval = setInterval(() => {
      setSimulatedYield(prev => prev + (rate * 10)); // increment every 100ms
    }, 100);
    
    return () => clearInterval(interval);
  }, [marketData]);

  const handleResolve = async (outcomeResult: 'YES' | 'NO') => {
    try {
      const res = await fetch(`/api/v1/markets/${marketId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ outcome: outcomeResult })
      });
      const json = await res.json();
      if (!res.ok) alert(json.message);
      else {
        alert("Market Resolved Successfully!");
        executeGetMarket(marketId);
        executeGetStakes(marketId);
      }
    } catch (e: unknown) {
      const err = e as Error;
      alert("Error resolving market: " + err.message);
    }
  };

  const handleStake = async () => {
    if (!token || isSubmitting || !outcome) return;
    setIsSubmitting(true);
    const amountWei = parseUnits(stakeAmount, 18).toString();
    const res = await executeStake({ marketId, direction: outcome, amount: amountWei });
    setIsSubmitting(false);
    if (!res.error) {
      setSuccess(true);
      executeGetMarket(marketId);
      executeGetStakes(marketId);
      setTimeout(() => setSuccess(false), 5000);
    }
  };

  // Enforce Real Data completely. If market hasn't loaded, stay on loader.
  const market = marketData as any;

  if (!market) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-sm font-semibold uppercase tracking-widest text-center">Loading Market...</p>
      </div>
    );
  }

  const yesAmount   = BigInt(market.yesAmount || '0');
  const noAmount    = BigInt(market.noAmount  || '0');
  const totalAmount = yesAmount + noAmount;
  let yesPercent = 50, noPercent = 50;
  if (totalAmount > BigInt(0)) {
    yesPercent = Number((yesAmount * BigInt(1000)) / totalAmount) / 10;
    noPercent  = 100 - yesPercent;
  }

  const totalMUSD = parseFloat(formatUnits(totalAmount, 18)).toFixed(2);
  const isZeroRisk = market.stakeMode === 'zero-risk';
  const rawStakes = (stakesResponse as any)?.stakes || [];
  const participantCount = market.participantCount || 0;

  // Determine stake amounts bounds
  let minStake = '0';
  let maxStake = '0';
  if (rawStakes.length > 0) {
    // Only real numbered stakes mapped for max/min correctly
    const numericStakes = rawStakes.filter((s: any) => s.amount !== '???').map((s: any) => parseFloat(formatUnits(BigInt(s.amount), 18)));
    if (numericStakes.length > 0) {
      minStake = Math.min(...numericStakes).toFixed(1);
      maxStake = Math.max(...numericStakes).toFixed(1);
    } else {
      minStake = '???';
      maxStake = '???';
    }
  }

  const infoRows = [
    { label: 'Volume',       value: <span className="flex items-center gap-1.5"><CircleDollarSign size={14} className="text-gray-400" />{totalMUSD} MUSD</span> },
    { label: 'Participants', value: `${participantCount} Users` },
    { label: 'Stake Range',  value: <span className="flex items-center gap-1.5"><CircleDollarSign size={14} className="text-gray-400" />{rawStakes.length > 0 ? `${minStake} - ${maxStake}` : '0'} MUSD</span> },
    { label: 'End Date',     value: new Date(market.deadline).toLocaleDateString() },
    { label: 'Market Type',  value: isZeroRisk
        ? <span className="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-bold"><ShieldCheck size={14} /> Zero Risk</span>
        : <span className="inline-flex items-center gap-1.5 text-orange-700 text-xs font-bold"><Flame size={14} /> Full Stake</span>
    },
    { label: 'Oracle',      value: <div className="flex items-center gap-1.5 text-gray-900 truncate"><span className="w-2 h-2 rounded-full bg-blue-500" />{market.resolverAddress?.slice(0,6) || 'Mezo Oracle'}</div> },
  ];

  return (
    <div className="font-sans min-h-screen py-10 space-y-10">
      <div>
        
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 uppercase tracking-widest transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Group
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (Main Content) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
            
            {/* Header Card */}
            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <img
                  src={`https://api.dicebear.com/7.x/identicon/svg?seed=${market.id}`}
                  alt="Market"
                  className="w-14 h-14 rounded-2xl object-cover border border-gray-100"
                />
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-tight tracking-tight">
                    {market.question}
                  </h1>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
                    <span className="text-[12px] font-semibold text-gray-600">ID: {market.id.slice(0,8)}</span>
                  </div>
                </div>
              </div>

              {/* Progress Tracking */}
              <div className="space-y-3 mt-8">
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-bold text-emerald-600 leading-none">
                    {yesPercent.toFixed(1)}<span className="text-sm font-medium text-emerald-600/70 ml-1">% Yes</span>
                  </span>
                  <span className="text-2xl font-bold text-rose-500 leading-none">
                    {noPercent.toFixed(1)}<span className="text-sm font-medium text-rose-500/70 ml-1">% No</span>
                  </span>
                </div>
                {/* Split Track */}
                <div className="h-4 w-full bg-gray-100 rounded-full flex overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${yesPercent}%` }}
                  />
                  <div 
                    className="h-full bg-rose-500 transition-all duration-500"
                    style={{ width: `${noPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest pt-1 px-1">
                  <span>{formatUnits(yesAmount, 18)} MUSD</span>
                  <span>{formatUnits(noAmount, 18)} MUSD</span>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 grid grid-cols-2 sm:grid-cols-3 gap-6">
              {infoRows.map((row) => (
                <div key={row.label} className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{row.label}</span>
                  <span className="text-sm font-semibold text-gray-900">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Recent Votes */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-sm font-bold text-gray-900">Recent Votes</h3>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {rawStakes.length} Total
                </span>
              </div>
              
              {rawStakes.length === 0 ? (
                 <div className="text-sm text-gray-400 font-medium py-4 px-1">No stakes have been placed yet.</div>
              ) : (
                <div className="space-y-2">
                  {rawStakes.map((stake: any, i: number) => {
                    // if amount is obscured (stake.amount === "???"), we just display "Obscured"
                    const amountDisplay = stake.amount === '???' 
                       ? 'Obscured Amount' 
                       : `${parseFloat(formatUnits(BigInt(stake.amount), 18)).toFixed(2)} MUSD`;

                    const timeStr = stake.created_at ? new Date(stake.created_at).toLocaleString() : 'Recent';
                    const shortenedAddress = stake.user_address === '0x***' 
                       ? 'Anonymous' 
                       : `${stake.user_address.slice(0,6)}...${stake.user_address.slice(-4)}`;

                    return (
                      <div key={stake.id || i} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${stake.user_address}`} className="w-8 h-8 rounded-full bg-gray-100 object-cover" alt="user" />
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900 leading-tight">{shortenedAddress}</span>
                            <span className="text-xs text-gray-500 font-medium">{timeStr}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-900 truncate max-w-[120px] sm:max-w-[150px]">{amountDisplay}</span>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider min-w-[48px] text-center ${stake.direction === 'YES' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {stake.direction}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Right Column (Side Panel) */}
          <div className="lg:col-span-5 xl:col-span-4 relative">
            <div className="sticky top-28 flex flex-col gap-6">
              
              {/* Prediction Form */}
              <div className="bg-white rounded-[32px] p-8 border border-gray-200 shadow-xl shadow-black/[0.03]">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">Make Your Prediction</h2>
                  <p className="text-sm text-gray-500 mt-1">Choose your stance and confirm your stake.</p>
                </div>

                {/* YES/NO Selection */}
                <div className="flex gap-3 mb-6">
                  {(['YES', 'NO'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setOutcome(opt)}
                      className={`flex-1 py-4 px-6 rounded-2xl text-sm font-bold transition-all duration-200 ${
                        outcome === opt
                          ? opt === 'YES' 
                            ? 'bg-emerald-500 text-white shadow-md' 
                            : 'bg-rose-500 text-white shadow-md'
                          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {/* Amount Input */}
                <div className="mb-6">
                  {isZeroRisk ? (
                    <div className="flex flex-col items-center justify-center p-6 bg-teal-50 border border-teal-100 rounded-2xl">
                      <div className="text-[11px] font-bold text-teal-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                        Yield Accruing
                      </div>
                      <div className="text-2xl font-black text-teal-900 tracking-tight flex items-center gap-2">
                        {simulatedYield.toFixed(8)} <span className="text-lg text-teal-600 font-bold">MUSD</span>
                      </div>
                      <p className="text-xs text-teal-600 font-medium mt-2 text-center">
                        Principal is safe. You are only staking accrued yield.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-2 px-1">
                        Stake Amount (MUSD)
                      </label>
                      <input
                        type="number"
                        placeholder="1.0"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-center text-xl font-bold text-gray-900 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors"
                      />
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleStake}
                  disabled={!outcome || isSubmitting}
                  className={`flex items-center justify-center w-full py-4 text-[15px] font-bold rounded-2xl transition-all duration-200 ${
                    (!outcome || isSubmitting)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-black text-white hover:bg-gray-900 shadow-md'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Staking...</span>
                  ) : (
                    'Confirm Stake'
                  )}
                </button>

                {/* Status Messages */}
                {success && (
                  <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold">
                    <CheckCircle2 size={16} /> Stake successful!
                  </div>
                )}
                {stakeError && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-center text-sm font-bold">
                    {stakeError}
                  </div>
                )}
              </div>

              {/* Resolver Panel */}
              {market.status === 'OPEN' && address && market.resolverAddress?.toLowerCase() === address.toLowerCase() && (
                <div className="bg-white border-2 border-red-500 rounded-[32px] p-6 text-center shadow-sm">
                  <div className="flex justify-center items-center gap-2 text-red-600 font-bold mb-3">
                    <ShieldAlert size={20} /> Trusted Resolver Panel
                  </div>
                  <p className="text-[12px] text-gray-600 mb-5 leading-relaxed">
                    You are the designated resolver for this market. Your resolution is final and irreversible.
                  </p>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleResolve('YES')}
                      className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                    >
                      Trigger YES
                    </button>
                    <button 
                      onClick={() => handleResolve('NO')}
                      className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                    >
                      Trigger NO
                    </button>
                  </div>
                </div>
              )}

              {/* Resolved State */}
              {market.status === 'RESOLVED' && (
                <div className="bg-gray-900 border border-black rounded-[32px] p-8 text-center shadow-lg">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Market Closed</div>
                  <div className="text-2xl font-black text-white tracking-tight mb-2">
                    Outcome: <span className={market.outcome === 'YES' ? 'text-emerald-400' : 'text-rose-500'}>{market.outcome}</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    All winning stakes have been automatically distributed to participants.
                  </p>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
