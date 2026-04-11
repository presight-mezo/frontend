'use client';

import { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMarkets, useStakes } from '@/hooks/useApi';
import { useSiweAuth } from '@/hooks/useSiweAuth';
import { Loader2, ArrowLeft } from 'lucide-react';
import {
  motion,
  AnimatePresence,
  useInView,
} from 'framer-motion';
import { parseUnits } from 'viem';

/* ── animation variants ──────────────────────────────────────── */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.10, delayChildren: 0.12 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.58, ease: [0.25, 0.1, 0.25, 1] } },
};
const fadeLeft = {
  hidden: { opacity: 0, x: -22 },
  show: { opacity: 1, x: 0, transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] } },
};
const fadeScale = {
  hidden: { opacity: 0, scale: 0.88 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.52, ease: [0.25, 0.1, 0.25, 1] } },
};

/* ── scroll-triggered section wrapper ───────────────────────── */
function ScrollReveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px 0px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.62, ease: [0.25, 0.1, 0.25, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function MarketDetailPage({ params }: { params: Promise<{ marketId: string }> }) {
  const { marketId } = use(params);
  const router = useRouter();
  const { token } = useSiweAuth();

  const { getMarket: { data: marketData, execute: executeGetMarket } } = useMarkets(token || undefined);
  const { placeStake: { execute: executeStake, error: stakeError } } = useStakes(token || undefined);

  const [stakeAmount, setStakeAmount] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [outcome, setOutcome] = useState<'YES' | 'NO' | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => { executeGetMarket(marketId); }, [marketId]);

  const hardcodedMarket1 = {
    id: marketId,
    question: 'Will sigma cat be rizz',
    endTime: Math.floor(new Date('2026-03-14').getTime() / 1000),
    stakeMode: 'zero-risk' as const,
    yesAmount: '50000000000000000000000',
    noAmount: '0',
    resolverAddress: '0x1234567890abcdef1234567890abcdef12345678',
    status: 'OPEN',
  };
  const hardcodedMarket2 = {
    id: marketId,
    question: 'Will Bitcoin reach $100k by end of 2024?',
    endTime: Math.floor(new Date('2026-03-14').getTime() / 1000),
    stakeMode: 'full-stake' as const,
    yesAmount: '30000000000000000000',
    noAmount: '10000000000000000000',
    resolverAddress: '0x1234567890abcdef1234567890abcdef12345678',
    status: 'OPEN',
  };

  const market = marketData ? (marketData as any) : (marketId === '2' ? hardcodedMarket2 : hardcodedMarket1);

  const handleStake = async () => {
    if (!token || isSubmitting || !outcome) return;
    setIsSubmitting(true);
    const amountWei = parseUnits(stakeAmount, 18).toString();
    const res = await executeStake({ marketId, direction: outcome, amount: amountWei });
    setIsSubmitting(false);
    if (!res.error) {
      setSuccess(true);
      executeGetMarket(marketId);
      setTimeout(() => setSuccess(false), 5000);
    }
  };

  if (!market) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
        <Loader2 className="h-10 w-10 animate-spin mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest text-center">Reading Market State...</p>
      </div>
    );
  }

  const yesAmount   = BigInt(market.yesAmount || '0');
  const noAmount    = BigInt(market.noAmount  || '0');
  const totalAmount = yesAmount + noAmount;
  let yesPercent = 100, noPercent = 0;
  if (totalAmount > BigInt(0)) {
    yesPercent = Number((yesAmount * BigInt(100)) / totalAmount);
    noPercent  = 100 - yesPercent;
  }

  const isZeroRisk = market.stakeMode === 'zero-risk';

  const infoRows = [
    { label: 'Volume',       value: <span className="flex items-center gap-1.5"><span className="text-[10px]">💰</span>1</span> },
    { label: 'Participants', value: '2' },
    { label: 'Stake Range',  value: <span className="flex items-center gap-1.5"><span className="text-[10px]">💰</span>1 - 1</span> },
    { label: 'End Date',     value: new Date(market.endTime * 1000).toLocaleDateString() },
    { label: 'Market Type',  value: isZeroRisk
        ? <span className="inline-flex items-center gap-1.5 bg-blue-100/80 px-2.5 py-0.5 rounded-full text-blue-700 text-[11px] font-bold border border-blue-200/50">😎 Zero Risk</span>
        : <span className="inline-flex items-center gap-1.5 bg-orange-100/80 px-3 py-0.5 rounded-full text-orange-700 text-[11px] font-bold border border-orange-200/50">🔥 Full Stake</span>
    },
    { label: 'Creator',      value: <span className="flex items-center gap-1.5 bg-white/70 pr-2 p-0.5 rounded-full border border-white/80"><img src="https://picsum.photos/seed/bimajadiva/24/24" className="w-5 h-5 rounded-full" alt="" />bimajadiva</span> },
  ];

  return (
    <div className="relative font-sans bg-transparent min-h-screen">
      {/* ── Main content ───────────────────────────────────────── */}
      <motion.section
        className="relative z-10 p-4 md:p-8 max-w-3xl mx-auto py-10 space-y-10"
        initial="hidden"
        animate="show"
        variants={stagger}
      >
        {/* Back button */}
        <motion.button
          variants={fadeLeft}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[11px] font-bold text-gray-500 hover:text-black uppercase tracking-[0.2em] transition-colors group"
          whileHover={{ x: -3 }}
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Group
        </motion.button>

        {/* ── Glass card ─────────────────────────────────────── */}
        <motion.div
          variants={fadeScale}
          className="glass-card p-8 md:p-12 relative overflow-hidden"
        >
          {/* Colored top strip */}
          <div
            className="absolute top-0 left-0 right-0 h-[3px]"
            style={{ background: isZeroRisk ? 'linear-gradient(90deg,#3b82f6,#60a5fa)' : 'linear-gradient(90deg,#f97316,#fb923c)' }}
          />

          {/* Header */}
          <motion.div variants={stagger} className="mb-8">
            <motion.div variants={fadeUp} className="flex items-start gap-4 mb-6">
              <motion.img
                src="https://picsum.photos/seed/sigmacat/80/80"
                alt="Market"
                className="w-14 h-14 rounded-2xl object-cover shadow-sm border border-white/50"
                whileHover={{ scale: 1.08, rotate: 3 }}
                transition={{ type: 'spring', stiffness: 380, damping: 18 }}
              />
              <div>
                <h1 className="text-[26px] md:text-[30px] font-bold text-gray-900 mb-1 leading-tight tracking-tight">
                  {market.question}
                </h1>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/60 rounded-full border border-white/80 shadow-sm">
                  <span className="text-[12px] font-bold text-gray-600">cat enjoyer</span>
                </div>
              </div>
            </motion.div>

            {/* Progress bars */}
            <motion.div variants={fadeUp} className="space-y-4">
              {/* YES */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[13px] font-medium">
                  <span className="text-gray-600">Yes</span>
                  <motion.span
                    className="text-xl font-bold text-gray-900 tracking-tight"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {yesPercent}%
                  </motion.span>
                </div>
                <div className="h-[9px] w-full bg-white/60 rounded-full overflow-hidden border border-white/80 shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${yesPercent}%` }}
                    transition={{ duration: 1.1, ease: [0.25, 0.1, 0.25, 1], delay: 0.3 }}
                    className="h-full bg-emerald-400 rounded-full"
                  />
                </div>
              </div>
              {/* NO */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[13px] font-medium">
                  <span className="text-gray-600">No</span>
                  <motion.span
                    className="text-xl font-bold text-gray-900 tracking-tight"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    {noPercent}%
                  </motion.span>
                </div>
                <div className="h-[9px] w-full bg-white/60 rounded-full overflow-hidden border border-white/80 shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${noPercent}%` }}
                    transition={{ duration: 1.1, ease: [0.25, 0.1, 0.25, 1], delay: 0.4 }}
                    className="h-full bg-gray-300 rounded-full"
                  />
                </div>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-1">
                <span>1 votes</span>
                <span>0 votes</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Info grid */}
          <ScrollReveal delay={0.05}>
            <div className="border-t border-black/5 pt-8 space-y-4">
              {infoRows.map((row, i) => (
                <motion.div
                  key={row.label}
                  className="flex justify-between items-center text-[13px]"
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.42, delay: i * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
                  whileHover={{ x: 2 }}
                >
                  <span className="text-gray-500 font-medium">{row.label}</span>
                  <span className="text-gray-900 font-bold">{row.value}</span>
                </motion.div>
              ))}
            </div>
          </ScrollReveal>
        </motion.div>

        {/* ── Recent Votes ───────────────────────────────────── */}
        <ScrollReveal delay={0.08}>
          <div className="space-y-4">
            <div className="text-[13px] font-bold px-1">
              <span className="text-gray-900">Recent Votes</span>
              <span className="text-gray-400 font-medium ml-1.5">from cat enjoyer</span>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Isallkun',   date: '2026-03-08', seed: 'user1' },
                { name: 'yaelahsall', date: '2026-03-08', seed: 'user2' },
              ].map((vote, i) => (
                <motion.div
                  key={i}
                  className="flex justify-between items-center p-3.5 glass-card border border-white/70 shadow-sm"
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.46, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                  whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(0,0,0,0.10)' }}
                >
                  <div className="flex items-center gap-3.5">
                    <motion.img
                      src={`https://picsum.photos/seed/${vote.seed}/40/40`}
                      className="w-[36px] h-[36px] rounded-full shadow-sm border border-white"
                      alt={vote.name}
                      whileHover={{ scale: 1.12, rotate: -4 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    />
                    <div>
                      <div className="text-[14px] font-bold text-gray-900 leading-none">{vote.name}</div>
                      <div className="text-[11px] font-medium text-gray-500 leading-none mt-0.5">
                        {new Date(vote.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-bold text-gray-900 flex items-center gap-1.5">
                      <span className="text-[10px]">💰</span> 1
                    </span>
                    <motion.span
                      className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full uppercase tracking-wider border border-emerald-200/50"
                      whileHover={{ scale: 1.08 }}
                    >
                      Yes
                    </motion.span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ── Prediction Form ────────────────────────────────── */}
        <ScrollReveal delay={0.12}>
          <motion.div
            className="glass-card p-8 md:p-10 space-y-6 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0a0a0a] via-gray-500 to-[#0a0a0a]" />

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.46 }}
            >
              <div className="text-[20px] text-gray-900 font-bold tracking-tight">Make Your Prediction</div>
              <div className="text-[13px] text-gray-500 font-medium mt-1">Choose your stance and stake amount</div>
            </motion.div>

            {/* YES / NO buttons */}
            <div className="flex gap-4">
              {(['YES', 'NO'] as const).map((opt) => (
                <motion.button
                  key={opt}
                  onClick={() => setOutcome(opt)}
                  className={`relative flex-1 py-4 rounded-full text-[14px] font-bold overflow-hidden group transition-all duration-300 ${
                    outcome === opt
                      ? `border-transparent shadow-lg shadow-black/20 text-white ${opt === 'YES' ? 'bg-emerald-400' : 'bg-rose-500'}`
                      : 'bg-white/60 border border-white/80 shadow-sm text-gray-700'
                  }`}
                  whileHover={{ scale: outcome === opt ? 1.02 : 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 20 }}
                >
                  <span
                    className={`absolute inset-0 pointer-events-none transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${
                      opt === 'YES' ? 'bg-emerald-400' : 'bg-rose-500'
                    } ${
                      outcome === opt ? 'translate-x-0' : '-translate-x-[101%] group-hover:translate-x-0'
                    }`}
                  />
                  <span className={`relative z-10 transition-colors duration-500 ${outcome === opt ? 'text-white' : 'text-gray-700 group-hover:text-white'}`}>
                    {opt}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Amount input */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">
                Amount <span className="text-[10px]">💰</span> MUSD
              </div>
              <motion.input
                type="text"
                placeholder="1 - 1"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="w-full text-center text-[16px] py-4 bg-white/80 border border-white rounded-[20px] focus:outline-none focus:ring-4 focus:ring-black/5 transition-all text-gray-900 font-bold shadow-sm"
                whileFocus={{ scale: 1.015, boxShadow: '0 0 0 4px rgba(0,0,0,0.05)' }}
              />
            </motion.div>

            {/* Confirm button */}
            <motion.button
              onClick={handleStake}
              disabled={!outcome || isSubmitting}
              className={`relative overflow-hidden w-full font-bold justify-center py-4 text-[15px] rounded-[100px] transition-all duration-300 group ${
                (!outcome || isSubmitting)
                  ? 'bg-black/10 text-black/30 border border-transparent cursor-not-allowed shadow-none'
                  : 'bg-gray-100 text-gray-800 cursor-pointer shadow-sm border border-gray-200' 
              }`}
              whileHover={{ scale: (!outcome || isSubmitting) ? 1 : 1.035, boxShadow: (!outcome || isSubmitting) ? 'none' : '0 8px 32px rgba(0,0,0,0.15)' }}
              whileTap={{ scale: (!outcome || isSubmitting) ? 1 : 0.97 }}
              transition={{ type: 'spring', stiffness: 360, damping: 20 }}
            >
              {outcome && !isSubmitting && (
                <span className="absolute inset-0 bg-orange-500 pointer-events-none -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]" />
              )}
              <span className={`relative z-10 flex items-center justify-center gap-2 transition-colors duration-500 ${outcome && !isSubmitting ? 'group-hover:text-white' : ''}`}>
                {isSubmitting
                  ? <><Loader2 size={15} className="animate-spin" /> Placing Stake...</>
                  : 'Confirm Stake'
                }
              </span>
            </motion.button>

            {/* Feedback */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.88, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.88 }}
                  transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                  className="p-3 w-full bg-emerald-500 text-white rounded-[16px] text-center font-bold text-[13px] shadow-lg shadow-emerald-500/25"
                >
                  ✨ Stake successful!
                </motion.div>
              )}
              {stakeError && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 w-full bg-red-50 text-red-600 rounded-[16px] text-[13px] font-bold border border-red-200 text-center"
                >
                  {stakeError}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </ScrollReveal>
      </motion.section>
    </div>
  );
}
