'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMarkets } from '@/hooks/useApi';
import { useSiweAuth } from '@/hooks/useSiweAuth';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Calendar, Trash2, HelpCircle } from 'lucide-react';

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

  // Sync address when modal opens
  useState(() => {
    if (address && !resolverAddress) setResolverAddress(address);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !resolverAddress.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const endTime = Math.floor(Date.now() / 1000) + (parseInt(durationInDays) * 86400);

    const res = await createMarket.execute({
      groupId,
      question,
      endTime,
      stakeMode,
      resolverAddress,
    });

    setIsSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else if (res.data) {
      onSuccess();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">Create Prediction Market</h2>
                <p className="text-sm text-gray-400 mt-1 uppercase tracking-widest font-bold">Define the future of your group</p>
              </div>
              <button onClick={onClose} className="p-2 text-gray-300 hover:text-gray-900 transition-colors">
                 <Trash2 size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  The Question
                </label>
                <Input
                  placeholder="Will BTC hit $100k by next week?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    Duration
                  </label>
                  <select
                    value={durationInDays}
                    onChange={(e) => setDurationInDays(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all text-sm font-bold"
                  >
                    <option value="1">1 Day</option>
                    <option value="3">3 Days</option>
                    <option value="7">7 Days (Week)</option>
                    <option value="14">14 Days</option>
                    <option value="30">30 Days (Month)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    Risk Mode
                  </label>
                  <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-50">
                    <button
                      type="button"
                      onClick={() => setStakeMode('zero-risk')}
                      className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${stakeMode === 'zero-risk' ? 'bg-white shadow-sm text-emerald-500' : 'text-gray-400'}`}
                    >
                      Zero Risk
                    </button>
                    <button
                      type="button"
                      onClick={() => setStakeMode('full-stake')}
                      className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${stakeMode === 'full-stake' ? 'bg-white shadow-sm text-orange-500' : 'text-gray-400'}`}
                    >
                      Full Stake
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Trusted Resolver
                </label>
                <Input
                  placeholder="0x... (defaults to you)"
                  value={resolverAddress}
                  onChange={(e) => setResolverAddress(e.target.value)}
                  required
                />
              </div>
              
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex gap-3 items-start">
                <HelpCircle size={18} className="text-gray-400 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed text-gray-500 font-medium">
                  <strong>Zero Risk Mode</strong> stakes only accrued yield, keeping principals safe. 
                  <strong>Full Stake Mode</strong> requires direct MUSD principal locks. 
                  The <strong>Resolver</strong> is the person responsible for calling the outcome once the deadline expires.
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 p-4 rounded-2xl border border-red-100 animate-in fade-in zoom-in-95">
                  {error}
                </p>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="flex-1 rounded-2xl h-14"
                >
                  Discard
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !question.trim()}
                  className="flex-1 bg-black text-white hover:bg-gray-800 rounded-2xl h-14 font-black uppercase tracking-widest"
                >
                  {isSubmitting ? 'Deploying...' : 'Deploy Market'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
