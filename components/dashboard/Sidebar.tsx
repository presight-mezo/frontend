"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSiweAuth } from "@/hooks/useSiweAuth";
import { useDisconnect } from "wagmi";

const navItems = [
  { icon: "home", href: "/app/dashboard", label: "Dashboard" },
  { icon: "groups", href: "/app/groups", label: "My Groups" },
  { icon: "emoji_events", href: "/app/leaderboard", label: "Leaderboard" },
  { icon: "settings", href: "/app/settings", label: "Settings" },
];

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useSiweAuth();
  const { disconnect } = useDisconnect();

  return (
    <aside className="h-full w-full flex flex-col items-center rounded-r-[2.5rem] bg-white border-r border-black/5 font-headline tracking-tight relative">
      <div className="h-14 flex-shrink-0" />

      <div className="flex flex-col items-center gap-16 flex-1 w-full overflow-y-auto no-scrollbar">
        {/* Logo */}
        <div className="pt-2">
          <Link href="/">
            <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95">
              <span className="text-white font-black text-2xl tracking-tighter">PS</span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-10">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} title={item.label}>
                <button
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? "text-white bg-primary shadow-[0_10px_20px_rgba(59,130,246,0.25)]"
                      : "text-gray-400 hover:text-black bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-xl"
                    style={{ fontVariationSettings: isActive ? "'wght' 600" : "'wght' 400" }}
                  >
                    {item.icon}
                  </span>
                </button>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="mt-auto pb-14">
          <button
            onClick={() => {
              signOut();
              disconnect();
              router.push("/");
            }}
            title="Logout"
            className="text-red-500 hover:text-red-600 w-12 h-12 bg-red-50/50 hover:bg-red-50 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'wght' 400" }}>
              logout
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
