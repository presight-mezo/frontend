"use client";

import React from "react";
import StatsCard, { MarketsActivity } from "@/components/dashboard/StatsCard";
import LiveStakeFeed from "@/components/dashboard/Timeline";
import GroupsScroller from "@/components/dashboard/GroupsScroller";
import MandateCard from "@/components/dashboard/MandateCard";
import ResolverQueue from "@/components/dashboard/ResolverQueue";
import { usePresightApi } from "@/lib/ApiProvider";
import { 
  useProfile, 
  useTrove, 
  useMandate, 
  useYield, 
  useMarkets, 
  useResolver 
} from "@/hooks/useApi";

export default function DashboardPage() {
  const { token, address } = usePresightApi();
  const [hasMounted, setHasMounted] = React.useState(false);

  // ── Hooks ──
  const { getProfile, getGlobalProfile } = useProfile(token);
  const trove = useTrove(token);
  const { getMandate } = useMandate(token);
  const { getAccruedYield } = useYield(token);
  const { listMarkets } = useMarkets(token);
  const { getNotifications } = useResolver(token);

  // ── Local State ──
  const [globalStats, setGlobalStats] = React.useState<any>(null);
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  React.useEffect(() => {
    if (!hasMounted) return;

    // Fail-safe: Force stop loading after 5 seconds to show default "0" data
    const failSafeTimeout = setTimeout(() => {
      setIsInitialLoading(false);
    }, 5000);

    if (!token || !address) return;

    const fetchAll = async () => {
      try {
        // Parallel fetch for dashboard speed
        const [profRes, troveRes, mandateRes, yieldRes, marketsRes, notifyRes] = await Promise.all([
          getGlobalProfile.execute(address),
          trove.execute(),
          getMandate.execute(),
          getAccruedYield.execute(),
          listMarkets.execute(),
          getNotifications.execute()
        ]);

        if (profRes.data) setGlobalStats(profRes.data);
      } catch (err) {
        console.error("Dashboard data fetch failed", err);
      } finally {
        setIsInitialLoading(false);
        clearTimeout(failSafeTimeout);
      }
    };

    fetchAll();

    return () => clearTimeout(failSafeTimeout);
  }, [token, address, hasMounted]);

  // Derive visuals
  const musdBalance = trove?.data?.musdBalance ? (Number(trove.data.musdBalance) / 1e18).toFixed(2) : "0.00";
  const yieldToday = getAccruedYield?.data?.accrued ? (Number(getAccruedYield.data.accrued) / 1e18).toFixed(4) : "0.0000";
  const winRate = globalStats?.winRate ? Math.round(globalStats.winRate * 100) : 0;
  const convictionScore = globalStats?.totalConvictionScore ? Math.round(globalStats.totalConvictionScore) : 0;
  
  const mandateLimit = getMandate?.data?.limitPerMarket ? (Number(getMandate.data.limitPerMarket) / 1e18).toFixed(2) : "0.00";
  const mandateStatus = getMandate?.data ? "active" : "setup";

  if (!hasMounted) return <div className="min-h-screen bg-white" />;

  return (
    <section className="py-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">

      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-black/[0.03]">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tighter text-black uppercase">
            Overview
          </h1>
          <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">
            Your Social Bitcoin Finance Hub
          </p>
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-black/[0.05] cursor-pointer hover:bg-gray-50 transition-all shadow-sm active:scale-95">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Period:</span>
            <span className="text-xs font-bold text-black">Live</span>
            <span className="material-symbols-outlined text-sm text-gray-400" style={{ fontVariationSettings: "'wght' 400" }}>expand_more</span>
          </div>
          <button className="w-10 h-10 bg-white rounded-xl border border-black/[0.05] flex items-center justify-center hover:bg-gray-50 transition-all shadow-sm active:scale-95 text-gray-400 hover:text-black">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'wght' 400" }}>tune</span>
          </button>
        </div>
      </div>

      {/* ── Active Groups Scroller ──────────────────────────────── */}
      <GroupsScroller />

      {/* ── Bento Grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-8 items-start">
 
        {/* Left Column: Primary Dashboard Content (9 columns) */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-8">
          
          {/* Top Row: Core Financials & Identity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard
              title="MUSD Balance"
              value={musdBalance}
              unit=" MUSD"
              change={`+${yieldToday}`}
              isUp={true}
              subtext="Available for staking"
              type="sparkline"
              color="primary"
              loading={isInitialLoading}
            />

            <MandateCard 
              limit={mandateLimit}
              used={0}
              status={mandateStatus as any}
              loading={isInitialLoading}
            />

            <StatsCard
              title="Win Rate"
              value={winRate}
              unit="%"
              change={`${convictionScore} pts`}
              isUp={true}
              subtext="Conviction Score Influence"
              type="bars"
              color="purple"
              loading={isInitialLoading}
            />
          </div>

          {/* Bottom Area: Activity & Queue */}
          <div className="flex flex-col gap-8">
            <MarketsActivity 
              markets={listMarkets.data?.markets || []} 
              loading={listMarkets.loading || isInitialLoading}
            />
            <ResolverQueue 
              markets={getNotifications.data?.notifications || []}
              loading={getNotifications.loading || isInitialLoading}
            />
          </div>
        </div>
 
        {/* Right Column: Real-time Activity Sidebar (3 columns) */}
        <div className="col-span-12 lg:col-span-3 sticky top-10">
          <LiveStakeFeed />
        </div>
 
      </div>
    </section>
  );
}
