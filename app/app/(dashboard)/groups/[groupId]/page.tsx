'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useGroups, useMarkets } from '@/hooks/useApi';
import { useSiweAuth } from '@/hooks/useSiweAuth';
import { MarketCard } from '@/components/markets/MarketCard';
import { CreateMarketModal } from '@/components/markets/CreateMarketModal';
import { GroupSettingsModal } from '@/components/groups/GroupSettingsModal';
import { Plus, Users, Share2, ArrowLeft, Loader2, Info, TrendingUp, Trophy, Settings, LogOut, UserMinus, Check, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { SCORE_BANDS, getBand, fmt } from '@/app/app/(dashboard)/leaderboard/page';

export default function GroupLandingPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = use(params);
  const router = useRouter();
  const { token } = useSiweAuth();

  const { getGroup: { data: group, execute: executeGetGroup, loading: groupLoading, error: groupError }, getLeaderboard, leaveGroup, kickMember } = useGroups(token || undefined);
  const { listMarkets: { data: marketsData, execute: executeListMarkets, loading: marketsLoading } } = useMarkets(token || undefined);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    executeGetGroup(groupId);
    executeListMarkets(groupId);
    getLeaderboard.execute(groupId);
  }, [groupId, executeGetGroup, executeListMarkets, getLeaderboard.execute]);

  const markets = (marketsData as any[]) || [];
  const activeGroup = group as any;

  const handleCopyInvite = () => {
    const url = `${window.location.origin}/group/${groupId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const { address } = useSiweAuth();
  const isAdmin = (activeGroup?.adminAddress as string | undefined)?.toLowerCase() === address?.toLowerCase();
  
  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave this group?')) return;
    const res = await leaveGroup.execute(groupId);
    if (!res.error) router.push('/app/groups');
  };

  const handleKick = async (memberAddress: string) => {
    if (!confirm('Are you sure you want to kick this member?')) return;
    const res = await kickMember.execute(groupId, memberAddress);
    if (!res.error) executeGetGroup(groupId);
  };

  if (groupLoading && !group && !activeGroup) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 bg-transparent">
        <Loader2 className="h-10 w-10 animate-spin mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest">Entering Group...</p>
      </div>
    );
  }

  if (groupError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-transparent">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-6">
          <Info size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Group access denied</h2>
        <p className="text-gray-500 max-w-sm mb-8">{groupError}</p>
        <button className="btn-primary" onClick={() => router.push('/app/groups')}>Back to Groups</button>
      </div>
    );
  }

  /* ── Framer motion variants (mirrors HeroSection stagger) ─── */
  const staggerContainer = {
    hidden: {},
    show: { transition: { staggerChildren: 0.11, delayChildren: 0.18 } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.58, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
  };
  const fadeScale = {
    hidden: { opacity: 0, scale: 0.90 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.52, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
  };

  return (
    <motion.section
      className="py-10 space-y-10 bg-transparent font-sans overflow-hidden"
      initial="hidden"
      animate="show"
      variants={staggerContainer}
    >
      {/* ── Header Banner ───────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="relative overflow-visible mt-4">
        {/* Glass card content */}
        <div className="glass-card p-10 md:p-14 relative z-10 mx-auto">
          <button
            onClick={() => router.push('/app/groups')}
            className="flex items-center gap-2 text-[11px] font-bold text-gray-500 hover:text-black uppercase tracking-[0.2em] transition-colors mb-10 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to my list
          </button>

          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-10">
            <motion.div className="max-w-2xl" variants={staggerContainer}>
              <motion.div className="flex items-center gap-3 mb-6" variants={fadeUp}>
                <motion.div
                  className={`${activeGroup?.isPrivate ? 'bg-amber-100 text-amber-900' : 'bg-[#0a0a0a] text-white'} px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest`}
                  whileHover={{ scale: 1.06 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  {activeGroup?.isPrivate ? 'Private Group' : 'Public Group'}
                </motion.div>
                <div className="flex items-center gap-1.5 text-gray-500 font-bold text-[11px] uppercase tracking-widest bg-white/60 px-3 py-1.5 rounded-full border border-white/80">
                  <Users size={14} className="text-gray-400" />
                  {activeGroup?.memberCount as number || 1} Predictors
                </div>
              </motion.div>

              <motion.h1
                className="text-[40px] md:text-[54px] font-bold text-gray-900 mb-4 tracking-tight leading-[1.05]"
                variants={fadeUp}
              >
                {activeGroup?.name as string || 'Loading Name...'}
              </motion.h1>

              <motion.p className="text-[16px] text-gray-500 font-medium leading-relaxed max-w-xl" variants={fadeUp}>
                {activeGroup?.description as string || 'Build your conviction profile and predict with friends.'}
              </motion.p>
            </motion.div>

            <motion.div className="flex flex-col sm:flex-row gap-4 shrink-0 mt-2" variants={fadeUp}>
              {isAdmin ? (
                <motion.button
                  onClick={() => setIsSettingsOpen(true)}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:text-black hover:border-gray-400 transition-all shadow-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Settings size={20} />
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleLeave}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-gray-200 text-red-500 hover:bg-red-50 transition-all shadow-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Leave Group"
                >
                  <LogOut size={20} />
                </motion.button>
              )}
              <motion.button
                onClick={handleCopyInvite}
                className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-gray-400 text-gray-700 py-3.5 px-6 rounded-full font-bold text-[14px] transition-all shadow-sm"
                whileHover={{ scale: 1.04, boxShadow: '0 4px 20px rgba(0,0,0,0.10)' }}
                whileTap={{ scale: 0.97 }}
              >
                {copied ? <Check size={16} className="text-emerald-500" /> : <Share2 size={16} />}
                {copied ? 'Link Copied!' : 'Invite Friends'}
              </motion.button>
              <motion.button
                onClick={() => setIsModalOpen(true)}
                className="btn-primary shadow-lg shadow-black/10 py-3.5 px-8"
                whileHover={{ scale: 1.05, boxShadow: '0 8px 32px rgba(0,0,0,0.22)' }}
                whileTap={{ scale: 0.97 }}
              >
                <Plus size={16} className="mr-2" />
                New Market
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ── Active Markets ──────────────────────────────────────── */}
      <motion.div className="space-y-8 relative z-10" variants={fadeUp}>
        {/* Section header */}
        <div className="flex items-center justify-between border-b border-black/5 pb-5 px-1">
          <motion.h2
            className="text-[24px] font-bold text-gray-900 tracking-tight"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Active Markets
          </motion.h2>
          <motion.span
            className="text-[12px] font-bold text-gray-400 uppercase tracking-widest bg-white/60 px-3 py-1 rounded-full border border-white/80"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.62, duration: 0.45 }}
          >
            {markets.length} Open
          </motion.span>
        </div>

        {/* Market cards grid */}
        {marketsLoading && !markets.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[0, 1].map(i => (
              <motion.div
                key={i}
                className="h-64 rounded-[24px] bg-white/45 border border-white/50"
                animate={{ opacity: [0.4, 0.75, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
              />
            ))}
          </div>
        ) : markets.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={staggerContainer}
          >
            {markets.map((market) => (
              <motion.div
                key={market.id as string}
                variants={fadeScale}
                whileHover={{
                  y: -8,
                  transition: { type: 'spring', stiffness: 300, damping: 20 },
                }}
              >
                <MarketCard
                  market={market as any}
                  onClick={() => router.push(`/app/markets/${market.id}`)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            className="py-24 text-center glass-card border border-white/50"
            variants={fadeScale}
          >
            <TrendingUp size={48} className="mx-auto text-gray-300 mb-6" />
            <h3 className="text-[20px] font-bold text-gray-900 mb-2">No active predictions</h3>
            <p className="text-gray-500 max-w-xs mx-auto mb-10 leading-relaxed font-medium">
              This group is empty. Be the first to call it.
            </p>
            <motion.button
              className="btn-primary"
              onClick={() => setIsModalOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              <Plus size={16} className="mr-2" />
              First Market
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      {/* Group Leaderboard Section */}
      <div className="space-y-6 pt-4">
        <div className="flex items-baseline justify-between border-b border-black/5 pb-5 px-1">
          <motion.h2 className="text-[24px] font-bold text-gray-900 tracking-tight">Group Leaderboard</motion.h2>
          <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest bg-white/60 px-3 py-1 rounded-full border border-white/80">
            {activeGroup?.memberCount as number || 0} Members
          </span>
        </div>

        {getLeaderboard.loading && (!getLeaderboard.data) ? (
          <div className="py-20 flex flex-col items-center justify-center bg-white rounded-[32px] border border-gray-100">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Compiling group scores...</div>
          </div>
        ) : (
          <div className="bg-white rounded-[32px] border border-gray-100 p-6 sm:p-8 shadow-sm">
            {/* Header row */}
            <div className="grid gap-2 px-4 py-3 mb-2 bg-gray-50 rounded-2xl border border-gray-100"
              style={{ gridTemplateColumns: isAdmin ? '40px 44px 1fr 80px 80px 100px 32px' : '40px 44px 1fr 80px 80px 100px' }}>
              {['', '', 'PREDICTOR', 'WIN RATE', 'W / TOTAL', 'SCORE'].map((h, i) => (
                <div key={i} className={`text-[10px] font-bold text-gray-400 uppercase tracking-widest ${i >= 3 ? 'text-center' : 'text-left'}`}>
                  {h}
                </div>
              ))}
              {isAdmin && <div></div>}
            </div>

            <div className="space-y-2">
              {((getLeaderboard.data as any)?.entries || []).map((entry: any) => {
                const band = getBand(entry.convictionScore);
                const pct = Math.min((entry.convictionScore / 1600) * 100, 100);
                const showMedal = entry.rank <= 3;
                const medalColor = entry.rank === 1 ? 'text-yellow-500' : entry.rank === 2 ? 'text-gray-400' : 'text-orange-500';
                const isCurrentUser = entry.address.toLowerCase() === address?.toLowerCase();
                const isGroupAdmin = entry.address.toLowerCase() === activeGroup?.adminAddress?.toLowerCase();

                let rankComponent = <span className={`text-xs font-bold ${isCurrentUser ? 'text-blue-700' : 'text-gray-400'}`}>#{entry.rank}</span>;
                if (showMedal && !isCurrentUser) {
                   rankComponent = <Award size={20} className={`mx-auto ${medalColor}`} />;
                }

                return (
                  <div
                    key={entry.rank}
                    className={`group grid gap-2 items-center px-4 py-3 rounded-2xl transition-all duration-200 hover:bg-gray-50 border ${
                      isCurrentUser 
                        ? 'bg-blue-50/50 border-blue-100 relative overflow-hidden' 
                        : 'bg-white border-transparent hover:border-gray-100'
                    }`}
                    style={{ gridTemplateColumns: isAdmin ? '40px 44px 1fr 80px 80px 100px 32px' : '40px 44px 1fr 80px 80px 100px' }}
                  >
                    {isCurrentUser && (
                      <div className="absolute top-0 left-0 bottom-0 w-1" style={{ background: band.accent }} />
                    )}

                    {/* Rank */}
                    <div className="text-center">{rankComponent}</div>
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 border border-gray-100 overflow-hidden">
                      <img 
                        src={entry.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${entry.address}`} 
                        alt="avatar" 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Name + bar */}
                    <div className="pl-2 pr-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold font-mono truncate ${isCurrentUser ? 'text-blue-900' : 'text-gray-900'}`}>
                          {entry.username || fmt(entry.address)}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[9px] font-bold tracking-wider text-white bg-blue-500 rounded-lg px-2 py-0.5 shrink-0">YOU</span>
                        )}
                        {isGroupAdmin && !isCurrentUser && (
                          <span className="text-[9px] font-bold tracking-wider text-white bg-black rounded-lg px-2 py-0.5 shrink-0">ADMIN</span>
                        )}
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden w-full max-w-[200px]">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${pct}%`, background: band.accent }}
                        />
                      </div>
                    </div>

                    {/* Win rate */}
                    <div className="text-center">
                      <div className={`text-base font-bold ${isCurrentUser ? 'text-blue-900' : 'text-gray-900'}`}>{entry.winRate}%</div>
                    </div>

                    {/* W / Total */}
                    <div className="text-center">
                      <div className={`text-sm font-bold ${isCurrentUser ? 'text-blue-700/80' : 'text-gray-500'}`}>
                        {Math.floor((entry.winRate / 100) * entry.marketsPlayed)}/{entry.marketsPlayed}
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right sm:text-center">
                      <div className={`text-lg font-bold tracking-tight ${isCurrentUser ? 'text-blue-900' : 'text-gray-900'}`}>
                        {entry.convictionScore.toLocaleString()}
                      </div>
                      <span className={`inline-flex mt-1 items-center gap-1 text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-lg border uppercase ${band.badgeBg} ${band.badgeText} ${band.border}`}>
                         <band.icon size={10} /> {band.label}
                      </span>
                    </div>

                    {/* Admin Kick Button */}
                    {isAdmin && (
                      <div className="text-right">
                         {!isGroupAdmin && (
                           <button
                             onClick={() => handleKick(entry.address)}
                             className="w-8 h-8 flex shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                             title="Kick Member"
                           >
                             <UserMinus size={14} />
                           </button>
                         )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Predictors Member Directory */}
      <div className="space-y-10 pt-10">
        <div className="flex items-baseline justify-between border-b border-black/5 pb-6">
          <h2 className="text-[24px] font-bold text-gray-900 tracking-tight">Predictors</h2>
          <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest bg-white/60 px-3 py-1 rounded-full border border-white/80">
            {activeGroup?.memberCount as number || 0} Members
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeGroup?.members && (activeGroup.members as any[]).map((member: any, idx: number) => (
            <motion.div
              key={member.address}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group flex items-center gap-4 bg-white p-5 rounded-3xl border border-gray-100 hover:border-black/5 transition-colors shadow-sm"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-50 flex-shrink-0 relative border border-gray-100">
                <img 
                  src={member.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${member.address}`} 
                  alt="avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900 truncate">
                    {member.username || fmt(member.address)}
                  </span>
                  {member.address.toLowerCase() === activeGroup?.adminAddress?.toLowerCase() && (
                    <span className="bg-black text-white px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter">
                      Admin
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <div className="flex items-center gap-1 text-emerald-600">
                    <Trophy size={10} />
                    {member.convictionScore} pts
                  </div>
                  <div className="w-1 h-1 rounded-full bg-gray-200" />
                  <div className="flex items-center gap-1">
                    Joined {new Date(member.joinedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>
              {isAdmin && member.address.toLowerCase() !== activeGroup?.adminAddress?.toLowerCase() && (
                <button
                  onClick={() => handleKick(member.address)}
                  className="w-8 h-8 flex shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                  title="Kick Member"
                >
                  <UserMinus size={14} />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <CreateMarketModal
        isOpen={isModalOpen}
        groupId={groupId}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => executeListMarkets(groupId)}
      />

      {activeGroup && (
        <GroupSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          groupId={groupId}
          initialName={activeGroup.name}
          initialDescription={activeGroup.description}
          initialIsPrivate={activeGroup.isPrivate}
          onSuccess={() => executeGetGroup(groupId)}
        />
      )}
    </motion.section>
  );
}
