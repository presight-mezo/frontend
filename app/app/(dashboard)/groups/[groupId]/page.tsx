'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useGroups, useMarkets } from '@/hooks/useApi';
import { useSiweAuth } from '@/hooks/useSiweAuth';
import { Button } from '@/components/ui/Button';
import { MarketCard } from '@/components/markets/MarketCard';
import { CreateMarketModal } from '@/components/markets/CreateMarketModal';
import { Plus, Users, Share2, ArrowLeft, Loader2, Info, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GroupLandingPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = use(params);
  const router = useRouter();
  const { token } = useSiweAuth();
  
  const { getGroup: { data: group, execute: executeGetGroup, loading: groupLoading, error: groupError } } = useGroups(token || undefined);
  const { listMarkets: { data: marketsData, execute: executeListMarkets, loading: marketsLoading } } = useMarkets(token || undefined);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    console.log('[GroupLandingPage] Mounted for groupId:', groupId);
    console.log('[GroupLandingPage] Fetching group details and markets...');
    executeGetGroup(groupId);
    executeListMarkets(groupId);
  }, [groupId]);

  useEffect(() => {
    if (!groupLoading) {
      console.log('[GroupLandingPage] Group fetch result:', { group, groupError });
    }
  }, [groupLoading, group, groupError]);

  useEffect(() => {
    if (!marketsLoading) {
      console.log('[GroupLandingPage] Markets fetch result:', marketsData);
    }
  }, [marketsLoading, marketsData]);

  const markets = (marketsData as any[]) || [];

  const handleCopyInvite = () => {
    const url = `${window.location.origin}/group/${groupId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (groupLoading && !group) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
        <Loader2 className="h-10 w-10 animate-spin mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest">Entering Group...</p>
      </div>
    );
  }

  if (groupError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-6">
           <Info size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Group access denied</h2>
        <p className="text-gray-500 max-w-sm mb-8">{groupError}</p>
        <Button variant="outline" onClick={() => router.push('/app/groups')}>Back to Groups</Button>
      </div>
    );
  }

  return (
    <section className="p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[40px] bg-gray-50 p-10 md:p-14">
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="header-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="black" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#header-grid)" />
          </svg>
        </div>

        <div className="relative z-10">
          <button 
            onClick={() => router.push('/app/groups')}
            className="flex items-center gap-2 text-xs font-black text-gray-400 hover:text-black uppercase tracking-[0.2em] transition-colors mb-10 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to my list
          </button>

          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-black text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest">
                  Public Group
                </div>
                <div className="flex items-center gap-1.5 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                  <Users size={12} />
                  {group?._count?.members || 1} Predictors
                </div>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-[0.95]">
                {group?.name || 'Loading Name...'}
              </h1>
              
              <p className="text-lg text-gray-500 font-medium leading-relaxed max-w-xl">
                {group?.description || 'Build your conviction profile and predict with friends.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
               <Button 
                onClick={handleCopyInvite}
                variant="outline"
                className="bg-white border-transparent hover:border-black/10 py-5 px-8"
                leftIcon={<Share2 size={18} />}
              >
                {copied ? 'Link Copied!' : 'Invite Friends'}
              </Button>
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-black text-white hover:bg-gray-800 py-5 px-8"
                leftIcon={<Plus size={18} />}
              >
                New Market
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Markets Section */}
      <div className="space-y-10">
        <div className="flex items-baseline justify-between border-b-2 border-gray-50 pb-6">
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Active Markets</h2>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {markets.length} Open Predictions
          </span>
        </div>

        {marketsLoading && !markets.length ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-3xl bg-gray-50 animate-pulse" />
            ))}
           </div>
        ) : markets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {markets.map((market) => (
              <MarketCard 
                key={market.id} 
                market={market} 
                onClick={() => router.push(`/app/markets/${market.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-100">
             <TrendingUp size={48} className="mx-auto text-gray-200 mb-6" />
             <h3 className="text-xl font-bold text-gray-900 mb-2">No active predictions</h3>
             <p className="text-gray-500 max-w-xs mx-auto mb-10 leading-relaxed font-medium">
               This group is empty. Be the one to set the first conviction call.
             </p>
             <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(true)}
              leftIcon={<Plus size={18} />}
            >
              First Market
            </Button>
          </div>
        )}
      </div>

      <CreateMarketModal 
        isOpen={isModalOpen}
        groupId={groupId}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => executeListMarkets(groupId)}
      />
    </section>
  );
}
