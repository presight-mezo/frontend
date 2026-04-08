'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGroups } from '@/hooks/useApi';
import { useSiweAuth } from '@/hooks/useSiweAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (groupId: string) => void;
}

export function CreateGroupModal({ isOpen, onClose, onSuccess }: CreateGroupModalProps) {
  const { token } = useSiweAuth();
  const { createGroup } = useGroups(token || undefined);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    console.log('[CreateGroupModal] Submitting new group creation request:', { name, description });
    setIsSubmitting(true);
    setError(null);

    const res = await createGroup.execute({ name, description });
    console.log('[CreateGroupModal] API Response:', res);
    setIsSubmitting(false);

    if (res.error) {
      console.error('[CreateGroupModal] Error creating group:', res.error);
      setError(res.error);
    } else if (res.data) {
      console.log('[CreateGroupModal] Successfully created group with ID:', (res.data as any).groupId);
      onSuccess((res.data as any).groupId);
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
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Create New Group</h2>
              <p className="text-sm text-gray-500 mt-1">Start a private prediction circle with your friends.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                  Group Name
                </label>
                <Input
                  placeholder="e.g. Satoshi's Circle"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none h-24 text-sm"
                  placeholder="What's this group about?"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="flex-1 bg-black text-white hover:bg-gray-800"
                >
                  {isSubmitting ? 'Creating...' : 'Create Group'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
