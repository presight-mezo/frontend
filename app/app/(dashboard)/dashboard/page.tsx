"use client";

import React from "react";
import StatsCard, { MarketsActivity } from "@/components/dashboard/StatsCard";
import LiveStakeFeed from "@/components/dashboard/Timeline";
import GroupsScroller from "@/components/dashboard/GroupsScroller";
import MandateCard from "@/components/dashboard/MandateCard";
import ResolverQueue from "@/components/dashboard/ResolverQueue";

const MOCK_PROFILE = {
  musdBalance: "248.72",
  yieldToday: "+1.84 MUSD",
  winRate: "68",
  convictionDelta: "+4.2 pts",
  convictionIsUp: true,
  mandateLimit: "100.00",
  mandateUsed: "35.50",
};

export default function DashboardPage() {
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
            <span className="text-xs font-bold text-black">7d</span>
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
      <div className="grid grid-cols-12 gap-6">

        {/* Top Row: Core Financials & Identity */}
        <div className="col-span-12 xl:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="MUSD Balance"
            value={MOCK_PROFILE.musdBalance}
            unit=" MUSD"
            change={MOCK_PROFILE.yieldToday}
            isUp={true}
            subtext="Available for staking"
            type="sparkline"
            color="primary"
          />

          <MandateCard 
            limit={MOCK_PROFILE.mandateLimit}
            used={MOCK_PROFILE.mandateUsed}
            status="active"
          />

          <StatsCard
            title="Win Rate"
            value={MOCK_PROFILE.winRate}
            unit="%"
            change={MOCK_PROFILE.convictionDelta}
            isUp={MOCK_PROFILE.convictionIsUp}
            subtext="Conviction Score Influence"
            type="bars"
            color="purple"
          />
        </div>

        {/* Markets Activity & Resolver Queue Column */}
        <div className="col-span-12 xl:col-span-8 space-y-6">
          <MarketsActivity />
          <ResolverQueue />
        </div>

        {/* Right Sidebar: Real-time Activity */}
        <div className="col-span-12 xl:col-span-4 h-full">
          <LiveStakeFeed />
        </div>

      </div>
    </section>
  );
}
