'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGroups } from '@/hooks/useApi';
import { useSiweAuth } from '@/hooks/useSiweAuth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CreateGroupModal } from '@/components/groups/CreateGroupModal';
import { Plus, Users, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GroupsPage() {
  const router = useRouter();
  const { token } = useSiweAuth();
  const { listGroups: { data: groupsData, execute: executeListGroups, loading: groupsLoading } } = useGroups(token || undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (token) {
      console.log('[GroupsPage] Fetching list of groups for the user...');
      executeListGroups();
    }
  }, [token, executeListGroups]);

  const groups = (groupsData as any[]) || [];
  
  useEffect(() => {
    if (!groupsLoading) {
      console.log('[GroupsPage] Fetched groups:', groups);
    }
  }, [groupsLoading, groups]);

  return (
    <section className="py-10 space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100 mb-8">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-black uppercase">My Groups</h1>
          <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-wider">Predict alongside your inner circle</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus size={18} />}
          className="bg-black text-white hover:bg-gray-800 self-start md:self-center px-8"
        >
          Create Group
        </Button>
      </div>

      {groupsLoading ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p className="text-sm font-medium">Loading your groups...</p>
        </div>
      ) : groups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group, index) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                onClick={() => router.push(`/app/groups/${group.id}`)}
                className="group cursor-pointer hover:border-black/20 hover:shadow-xl hover:shadow-black/5 transition-all duration-300 p-6 flex flex-col h-full bg-white border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-colors duration-300">
                    <Users size={24} />
                  </div>
                  <div className="text-xs font-bold text-gray-300 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded">
                    {group._count?.members || 1} Members
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-black">{group.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-6 flex-grow leading-relaxed">
                  {group.description || 'No description provided.'}
                </p>
                
                <div className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-black transition-colors">
                  Enter Group <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-96 rounded-3xl border-2 border-dashed border-gray-100 bg-gray-50/50 text-gray-400 text-center px-4">
          <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center mb-6 text-gray-300">
            <Users size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No groups yet</h2>
          <p className="text-sm text-gray-500 max-w-xs mb-8 leading-relaxed">
            Prediction markets are better with friends. Create your first group and start making conviction-based calls.
          </p>
          <Button 
            variant="outline"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus size={18} />}
          >
            Start a Group
          </Button>
        </div>
      )}

      <CreateGroupModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(groupId) => router.push(`/app/groups/${groupId}`)}
      />
    </section>
  );
}
