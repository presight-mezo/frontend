'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMarkets } from '@/hooks/useApi';
import { useSiweAuth } from '@/hooks/useSiweAuth';
import { useAccount } from 'wagmi';
import { X, HelpCircle, Loader2 } from 'lucide-react';

interface CreateMarketModalProps {
  isOpen: boolean;
  groupId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateMarketModal({ isOpen, groupId, onClose, onSuccess }: CreateMarketModalProps) {
  const { token } = useSiweAuth();
  const { address } = useAccount();
  const { createMarket } = useMarkets(token || undefined);

  const [question, setQuestion] = useState('');
  const [durationInDays, setDurationInDays] = useState('7');
  const [stakeMode, setStakeMode] = useState<'full-stake' | 'zero-risk'>('zero-risk');
  const [resolverAddress, setResolverAddress] = useState(address || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useState(() => {
    if (address && !resolverAddress) setResolverAddress(address);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !resolverAddress.trim()) return;

    setIsSubmitting(true);
    setError(null);

    // Backend expects `deadline` as an ISO date string in the future
    const deadlineMs = Date.now() + parseInt(durationInDays) * 86400 * 1000;
    const deadline = new Date(deadlineMs).toISOString();

    const res = await createMarket.execute({
      groupId,
      question,
      deadline,       // ISO string — matches backend field name
      mode: stakeMode, // 'mode' — matches backend field name
      resolverAddress,
    });

    setIsSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else if (res.data) {
      onSuccess();
      onClose();
      setQuestion('');
      setDurationInDays('7');
      setStakeMode('zero-risk');
    }
  };

  const inputClass =
    'w-full px-4 py-3.5 bg-white/70 border border-white/80 rounded-[16px] text-[14px] font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-gray-300 transition-all shadow-sm';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/30 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.90, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.90, y: 28 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="relative w-full max-w-lg glass-card shadow-2xl shadow-black/15 overflow-hidden"
          >
            {/* Top accent strip */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0a0a0a] via-gray-500 to-[#0a0a0a]" />

            {/* Header */}
            <div className="flex items-start justify-between p-7 pb-5 border-b border-black/5">
              <div>
                <h2 className="text-[22px] font-bold text-gray-900 tracking-tight">Create Prediction Market</h2>
                <p className="text-[12px] text-gray-400 font-bold uppercase tracking-widest mt-1">Define the future of your group</p>
              </div>
              <motion.button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/60 border border-white/80 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors mt-0.5 ml-4 shrink-0"
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(0,0,0,0.06)' }}
                whileTap={{ scale: 0.95 }}
              >
                <X size={14} />
              </motion.button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-7 space-y-5 max-h-[72vh] overflow-y-auto no-scrollbar">

              {/* Question */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">The Question</label>
                <input
                  type="text"
                  placeholder="Will BTC hit $100k by next week?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              {/* Duration + Risk Mode */}
              <div className="grid grid-cols-2 gap-4">
                {/* Duration */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Duration</label>
                  <select
                    value={durationInDays}
                    onChange={(e) => setDurationInDays(e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/70 border border-white/80 rounded-[16px] text-[14px] font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-gray-300 transition-all shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="1">1 Day</option>
                    <option value="3">3 Days</option>
                    <option value="7">7 Days</option>
                    <option value="14">14 Days</option>
                    <option value="30">30 Days</option>
                  </select>
                </div>

                {/* Risk Mode toggle */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Risk Mode</label>
                  <div className="flex bg-white/50 p-1 rounded-[16px] border border-white/80 gap-1">
                    <motion.button
                      type="button"
                      onClick={() => setStakeMode('zero-risk')}
                      className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-[12px] transition-all ${
                        stakeMode === 'zero-risk'
                          ? 'bg-white shadow text-blue-600 border border-blue-100/60'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      whileTap={{ scale: 0.96 }}
                    >
                      😎 Zero
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setStakeMode('full-stake')}
                      className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-[12px] transition-all ${
                        stakeMode === 'full-stake'
                          ? 'bg-white shadow text-orange-600 border border-orange-100/60'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      whileTap={{ scale: 0.96 }}
                    >
                      🔥 Full
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Resolver */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Trusted Resolver</label>
                <input
                  type="text"
                  placeholder="0x... (defaults to you)"
                  value={resolverAddress}
                  onChange={(e) => setResolverAddress(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              {/* Info box */}
              <div className="flex gap-3 items-start p-4 bg-white/50 rounded-[16px] border border-white/80">
                <HelpCircle size={16} className="text-gray-400 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed text-gray-500 font-medium">
                  <strong className="text-gray-700">😎 Zero Risk</strong> stakes only your accrued yield — principal stays safe.{' '}
                  <strong className="text-gray-700">🔥 Full Stake</strong> locks your actual MUSD.{' '}
                  The <strong className="text-gray-700">Resolver</strong> calls the outcome when the deadline hits.
                </p>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[13px] text-red-600 font-medium bg-red-50 px-4 py-3 rounded-[14px] border border-red-100"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-full text-[14px] font-bold text-gray-600 bg-white/60 border border-white/80 hover:border-gray-300 shadow-sm transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Discard
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isSubmitting || !question.trim() || !resolverAddress.trim()}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed justify-center py-3.5"
                  whileHover={{ scale: isSubmitting ? 1 : 1.03, boxShadow: '0 6px 28px rgba(0,0,0,0.22)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2 justify-center">
                      <Loader2 size={15} className="animate-spin" /> Deploying...
                    </span>
                  ) : (
                    'Deploy Market'
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
