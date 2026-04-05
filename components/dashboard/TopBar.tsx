"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import WalletBadge from "@/components/dashboard/WalletBadge";
import Image from "next/image";

const navItems = [
  { icon: "candlestick_chart", label: "Markets", href: "/app/dashboard" },
  { icon: "groups", label: "Groups", href: "/app/groups" },
  { icon: "person", label: "Profile", href: "/app/settings" },
];

const MOCK_ADDRESS = "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b";

const TopBar = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 flex justify-between items-center w-full !pl-[140px] !pr-[32px] h-20 bg-white/80 backdrop-blur-xl border-b border-black/[0.05] font-headline z-30">
      {/* Left: Nav + Search */}
      <div className="flex items-center gap-4 flex-1">
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <button
                  className={`!px-4 !py-2.5 rounded-full flex items-center gap-2 transition-all font-bold text-sm uppercase tracking-wide ${
                    isActive
                      ? "bg-black text-white shadow-md hover:scale-105 active:scale-95"
                      : "text-gray-500 hover:text-black hover:bg-gray-100"
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-lg"
                    style={{ fontVariationSettings: isActive ? "'wght' 600" : "'wght' 400" }}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              </Link>
            );
          })}
        </nav>

        {/* Search */}
        <div className="hidden md:flex items-center flex-1 max-w-sm bg-gray-100 px-4 py-2 rounded-full border border-black/[0.05] group focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10 transition-all">
          <span
            className="material-symbols-outlined text-gray-400 group-focus-within:text-black transition-colors text-lg"
            style={{ fontVariationSettings: "'wght' 400" }}
          >
            search
          </span>
          <input
            type="text"
            placeholder="Search markets, groups, or questions…"
            className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full text-black placeholder:text-gray-400 font-medium"
          />
        </div>
      </div>

      {/* Right: Mandate + Wallet + Avatar */}
      <div className="flex items-center gap-3">
        {/* Mandate Status Pill */}
        <Link href="/app/onboard" className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-accent-green/10 border border-accent-green/20 rounded-full hover:bg-accent-green/20 transition-all cursor-pointer group">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-accent-green group-hover:text-accent-green/80">
            Mandate Active
          </span>
        </Link>

        <WalletBadge address={MOCK_ADDRESS} />

        <div className="flex items-center gap-3 pl-2 border-l border-black/[0.05]">
          <div className="relative">
            <button className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all">
              <span
                className="material-symbols-outlined text-lg text-gray-600"
                style={{ fontVariationSettings: "'wght' 400" }}
              >
                notifications
              </span>
            </button>
            <span className="absolute -top-0.5 -right-0.5 bg-orange-500 w-4 h-4 rounded-full border-2 border-white text-[8px] flex items-center justify-center font-bold text-white shadow-sm">
              2
            </span>
          </div>

          <div className="relative">
            <Image
              alt="Connected wallet avatar"
              className="w-9 h-9 rounded-full object-cover border border-black/[0.05] shadow-sm"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDg5fES_R_2V9UqspaCkvla2sCXCJnkFNvtmkHZK9pQFGkKOWZlk8CtZZGwgHG1y8XukZekYKaUs0s2kD3lB9FvsihZI9yvZD6-fdMKux8eJBBxJL-1pSIYfHO3PK5LEa9-Ch_NDQQOqdsm-v5r9JkVfW5tg_ZAH7PzaT6D2_gJNYpnFMwKz8qIBi4OVyLJpsYmEK0qhT9y6l4ilvVVLhdkiUSSjnHj78R6Fh5wSkK8xW-RRei4erTn16TNViI3oQXLBiw_bAGP2PTm"
              width={36}
              height={36}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
