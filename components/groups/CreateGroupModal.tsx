'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGroups } from '@/hooks/useApi';
import { usePresightApi } from '@/lib/ApiProvider';
import { X, Loader2 } from 'lucide-react';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (groupId: string) => void;
}

export function CreateGroupModal({ isOpen, onClose, onSuccess }: CreateGroupModalProps) {
  const { token } = usePresightApi();
  const { createGroup } = useGroups(token || undefined);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const res = await createGroup.execute({ name, description, isPrivate });
    setIsSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else if (res.data) {
      onSuccess((res.data as any).groupId);
      onClose();
      setName('');
      setDescription('');
    }
  };

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

          {/* Modal card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative w-full max-w-md glass-card overflow-hidden shadow-2xl shadow-black/15"
          >
            {/* Decorative top gradient strip */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0a0a0a] via-gray-600 to-[#0a0a0a]" />

            {/* Header */}
            <div className="flex items-start justify-between p-7 pb-5">
              <div>
                <h2 className="text-[22px] font-bold text-gray-900 tracking-tight">Create New Group</h2>
                <p className="text-[13px] text-gray-500 font-medium mt-1">Start a private prediction circle with your friends.</p>
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
            <form onSubmit={handleSubmit} className="px-7 pb-7 space-y-5">
              {/* Group Name */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">
                  Group Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Satoshi's Circle"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 bg-white/70 border border-white/80 rounded-[16px] text-[14px] font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-gray-300 transition-all shadow-sm"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">
                  Description <span className="text-gray-400 font-medium normal-case tracking-normal">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white/70 border border-white/80 rounded-[16px] text-[14px] font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-gray-300 transition-all resize-none h-24 shadow-sm"
                  placeholder="What's this group about?"
                />
              </div>

              {/* Private Group Toggle */}
              <div className="flex items-center justify-between p-4 bg-white/40 rounded-2xl border border-white/60">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                    Private Group
                  </label>
                  <p className="text-[11px] text-gray-400 font-medium">Allow only invited members</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPrivate(!isPrivate)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${isPrivate ? 'bg-[#0a0a0a]' : 'bg-gray-200'}`}
                >
                  <motion.div
                    animate={{ x: isPrivate ? 26 : 2 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                  />
                </button>
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
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed justify-center py-3.5"
                  whileHover={{ scale: isSubmitting ? 1 : 1.03, boxShadow: '0 6px 28px rgba(0,0,0,0.20)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2 justify-center">
                      <Loader2 size={15} className="animate-spin" /> Creating...
                    </span>
                  ) : (
                    'Create Group'
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
