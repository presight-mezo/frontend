"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { useSiweAuth } from "@/hooks/useSiweAuth";
import { useYield, useMandate, useResolver, useGroups, useProfile } from "@/hooks/useApi";
import YieldCounter from "@/components/dashboard/YieldCounter";
import { useEffect, useMemo } from "react";

const TopBar = () => {
  const pathname = usePathname();
  const { address } = useAccount();
  const { token, isAuthenticated } = useSiweAuth();

  // Data hooks
  const { getAccruedYield } = useYield(token);
  const { getMandate } = useMandate(token);
  const { getNotifications } = useResolver(token);
  const { getGroup } = useGroups(token);
  const { getProfile } = useProfile(token);

  // Extract group ID from pathname
  const groupId = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const groupsIndex = segments.indexOf("groups");
    return groupsIndex !== -1 && segments[groupsIndex + 1] ? segments[groupsIndex + 1] : null;
  }, [pathname]);

  // Fetch group details when group ID changes
  useEffect(() => {
    if (groupId) {
      getGroup.execute(groupId);
    }
  }, [groupId, getGroup.execute]);

  // Global data fetch on auth
  useEffect(() => {
    if (isAuthenticated && token) {
      getAccruedYield.execute();
      getMandate.execute();
      getNotifications.execute();
      getProfile.execute();
    }
  }, [isAuthenticated, token, getAccruedYield.execute, getMandate.execute, getNotifications.execute, getProfile.execute]);

  // Simple breadcrumb logic based on pathname
  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    // Remove 'app' from segments for cleaner breadcrumbs
    let crumbs = segments.filter((s: string) => s !== "app" && s !== "(dashboard)");

    // Replace group ID with group name
    if (groupId && getGroup.data) {
      crumbs = crumbs.map((crumb: string) =>
        crumb === groupId ? (getGroup.data as any)?.name || groupId : crumb
      );
    }

    return (
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest leading-none">
        <span className="text-gray-400">Presight</span>
        <span className="text-gray-300">/</span>
        {crumbs.map((crumb: string, i: number) => (
          <React.Fragment key={crumb}>
            <span
              className="text-black group-hover:text-primary transition-colors truncate max-w-[120px] md:max-w-[250px]"
              title={crumb}
            >
              {crumb.replace(/-/g, " ")}
            </span>
            {i < crumbs.length - 1 && <span className="text-gray-300">/</span>}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const notificationCount = (getNotifications.data as any)?.length || 0;
  const isMandateActive = !!getMandate.data;
  const accruedYield = (getAccruedYield.data as any)?.accruedAmount || 0;

  return (
    <header className="sticky top-0 flex justify-between items-center w-full !pl-[140px] !pr-[32px] h-20 bg-white/80 backdrop-blur-xl border-b border-black/[0.05] font-headline z-30">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-8 flex-1">
        <div className="group cursor-default pt-0.5">
          {getBreadcrumbs()}
        </div>

        {/* Search - More prominent and centered-ish */}
        <div className="hidden md:flex items-center flex-1 max-w-md bg-gray-50 px-5 py-2.5 rounded-2xl border border-black/[0.03] group focus-within:bg-white focus-within:border-primary/20 focus-within:ring-4 focus-within:ring-primary/5 transition-all duration-300">
          <span
            className="material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors text-lg"
            style={{ fontVariationSettings: "'wght' 500" }}
          >
            search
          </span>
          <input
            type="text"
            placeholder="Search markets, groups, or questions…"
            className="bg-transparent border-none focus:ring-0 text-sm ml-3 w-full text-black placeholder:text-gray-400 font-medium"
          />
          <div className="flex items-center gap-1 px-1.5 py-1 bg-black/[0.03] rounded-md border border-black/[0.05]">
            <span className="text-[10px] font-black text-gray-400">⌘</span>
            <span className="text-[10px] font-black text-gray-400">K</span>
          </div>
        </div>
      </div>

      {/* Right: Stats + Wallet + Avatar */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 pl-3">
          <div className="relative">
            <button className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-white hover:shadow-sm border border-black/[0.03] transition-all group">
              <span
                className="material-symbols-outlined text-xl text-gray-400 group-hover:text-black"
                style={{ fontVariationSettings: "'wght' 400" }}
              >
                notifications
              </span>
            </button>
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 w-4.5 h-4.5 rounded-full border-2 border-white text-[9px] flex items-center justify-center font-black text-white shadow-sm animate-bounce-subtle">
                {notificationCount}
              </span>
            )}
          </div>

          <Link href={`/app/profile/${address}`} className="relative group cursor-pointer">
            <div className="w-10 h-10 rounded-xl p-[1px] bg-gradient-to-tr from-primary to-accent-blue transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-white rounded-[11px] flex items-center justify-center overflow-hidden">
                <img
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  src={(getProfile.data as any)?.avatarUrl || `https://effigy.im/a/${address || '0x0000000000000000000000000000000000000000'}.png`}
                />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
