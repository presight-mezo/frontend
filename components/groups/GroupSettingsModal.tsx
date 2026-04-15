import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Loader2, AlertCircle } from 'lucide-react';
import { useGroups } from '@/hooks/useApi';
import { useSiweAuth } from '@/hooks/useSiweAuth';

interface GroupSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  initialName: string;
  initialDescription?: string;
  initialIsPrivate?: boolean;
  onSuccess: () => void;
}

export function GroupSettingsModal({
  isOpen,
  onClose,
  groupId,
  initialName,
  initialDescription = '',
  initialIsPrivate = false,
  onSuccess,
}: GroupSettingsModalProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription || '');
  const [isPrivate, setIsPrivate] = useState(initialIsPrivate);
  
  const { token } = useSiweAuth();
  const { updateGroup, deleteGroup } = useGroups(token || undefined);

  const handleUpdate = async () => {
    if (!name.trim()) return;
    const res = await updateGroup.execute(groupId, { name, description, isPrivate });
    if (!res.error) {
      onSuccess();
      onClose();
    }
  };

  const handleArchive = async () => {
    if (!confirm('Are you sure you want to archive this group?')) return;
    const res = await deleteGroup.execute(groupId);
    if (!res.error) {
      window.location.href = '/app/groups';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden glass-card"
        >
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                  <Settings size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight">Group Settings</h3>
                  <p className="text-sm text-gray-500 font-medium">Manage details and privacy</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {updateGroup.error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 flex items-start gap-3 border border-red-100">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm font-medium text-red-800">{updateGroup.error}</p>
              </div>
            )}

            {deleteGroup.error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 flex items-start gap-3 border border-red-100">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm font-medium text-red-800">{deleteGroup.error}</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mezo Alpha Testers"
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-[15px] font-bold text-gray-900 focus:outline-none focus:border-black focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this group about?"
                  rows={3}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-[15px] font-medium text-gray-900 focus:outline-none focus:border-black focus:bg-white transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border-2 border-gray-100">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-1">
                    Private Group
                  </label>
                  <p className="text-[11px] text-gray-500 font-medium">Hide from public discovery</p>
                </div>
                <button
                  onClick={() => setIsPrivate(!isPrivate)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${isPrivate ? 'bg-[#0a0a0a]' : 'bg-gray-200'}`}
                >
                  <motion.div
                    animate={{ x: isPrivate ? 26 : 2 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                  />
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleUpdate}
                  disabled={updateGroup.loading || !name.trim()}
                  className="btn-primary w-full py-4 text-sm disabled:opacity-50"
                  style={{ borderRadius: '1rem' }}
                >
                  {updateGroup.loading ? <Loader2 className="animate-spin mx-auto" /> : 'Save Changes'}
                </button>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100">
                <p className="text-sm font-bold text-red-600 mb-3">Danger Zone</p>
                <button
                  onClick={handleArchive}
                  disabled={deleteGroup.loading}
                  className="w-full py-4 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-2xl transition-colors disabled:opacity-50"
                >
                  {deleteGroup.loading ? <Loader2 className="animate-spin mx-auto" /> : 'Archive Group'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
