"use client";

import React from "react";
import Link from "next/link";

interface Group {
  id: string;
  name: string;
  members: number;
  activeMarkets: number;
  image: string;
  color: string;
}

const MOCK_GROUPS: Group[] = [
  {
    id: "1",
    name: "Mezo Alpha Chat",
    members: 124,
    activeMarkets: 8,
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=200&h=200",
    color: "bg-primary",
  },
  {
    id: "2",
    name: "Bitcoin Builders",
    members: 85,
    activeMarkets: 3,
    image: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&q=80&w=200&h=200",
    color: "bg-orange-500",
  },
  {
    id: "3",
    name: "Jakarta Prediction DAO",
    members: 240,
    activeMarkets: 12,
    image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&q=80&w=200&h=200",
    color: "bg-accent-purple",
  },
  {
    id: "4",
    name: "Office Pool",
    members: 12,
    activeMarkets: 2,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=200&h=200",
    color: "bg-accent-green",
  },
  {
    id: "create",
    name: "Create Group",
    members: 0,
    activeMarkets: 0,
    image: "",
    color: "bg-gray-100",
  },
];

const GroupsScroller = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          My Active Groups
        </h3>
        <Link href="/app/groups" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">
          View All
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-2 px-2 snap-x">
        {MOCK_GROUPS.map((group) => {
          if (group.id === "create") {
            return (
              <button
                key={group.id}
                className="flex-shrink-0 w-[180px] h-[220px] rounded-[2.5rem] bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 group hover:border-primary/30 hover:bg-white transition-all snap-start"
              >
                <div className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-2xl">add</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-black">
                  Create Group
                </span>
              </button>
            );
          }

          return (
            <Link
              key={group.id}
              href={`/app/groups/${group.id}`}
              className="flex-shrink-0 w-[180px] h-[220px] rounded-[2.5rem] bg-white border border-black/[0.05] p-5 flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1 transition-all snap-start"
            >
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-md">
                <img
                  src={group.image}
                  alt={group.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className={`absolute inset-0 ${group.color} mix-blend-overlay opacity-40`} />
              </div>

              <div className="space-y-1">
                <h4 className="font-headline font-bold text-sm text-black line-clamp-2 leading-tight">
                  {group.name}
                </h4>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                    {group.members} Members
                  </span>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
                    <span className="text-[9px] font-bold text-accent-green uppercase tracking-widest">
                      {group.activeMarkets} Markets
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                <div className="text-[9px] font-black uppercase text-primary tracking-tighter flex items-center gap-1">
                  Enter Group <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default GroupsScroller;
