"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useGroups } from "@/hooks/useApi";
import { usePresightApi } from "@/lib/ApiProvider";
import { CreateGroupModal } from "@/components/groups/CreateGroupModal";
import { Loader2 } from "lucide-react";

// Helper to generate consistent colors and images based on group ID
const getGroupVisuals = (id: string, name: string) => {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = [
    "bg-primary",
    "bg-orange-500",
    "bg-accent-blue",
    "bg-accent-purple",
    "bg-accent-green",
    "bg-rose-500",
    "bg-indigo-500"
  ];
  
  // High quality images from Unsplash related to finance/tech/abstract
  const images = [
    "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=200&h=200",
    "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&q=80&w=200&h=200",
    "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&q=80&w=200&h=200",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=200&h=200",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=200&h=200",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=200&h=200",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=200&h=200"
  ];

  return {
    color: colors[hash % colors.length],
    image: images[hash % images.length]
  };
};

const GroupsScroller = () => {
  const { token, isAuthenticated } = usePresightApi();
  const { listGroups: { data: groupsData, execute: fetchGroups, loading } } = useGroups(token);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchGroups();
    }
  }, [isAuthenticated, token, fetchGroups]);

  const groups = (groupsData as any[]) || [];

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

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-2 px-2 snap-x min-h-[220px]">
        {/* Create Group Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex-shrink-0 w-[180px] h-[220px] rounded-[2.5rem] bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 group hover:border-primary/30 hover:bg-white transition-all snap-start"
        >
          <div className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors shadow-sm">
            <span className="material-symbols-outlined text-2xl">add</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-black">
            Create Group
          </span>
        </button>

        {loading && groups.length === 0 ? (
          <div className="flex items-center justify-center w-[180px] h-[220px]">
            <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
          </div>
        ) : (
          groups.map((group) => {
            const { color, image } = getGroupVisuals(group.id, group.name);
            return (
              <Link
                key={group.id}
                href={`/app/groups/${group.id}`}
                className="flex-shrink-0 w-[180px] h-[220px] rounded-[2.5rem] bg-white border border-black/[0.05] p-5 flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1 transition-all snap-start"
              >
                <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-md">
                  <img
                    src={image}
                    alt={group.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 ${color} mix-blend-overlay opacity-40`} />
                </div>

                <div className="space-y-1">
                  <h4 className="font-headline font-bold text-sm text-black line-clamp-2 leading-tight">
                    {group.name}
                  </h4>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                      {group._count?.members || 0} Members
                    </span>
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
                      <span className="text-[9px] font-bold text-accent-green uppercase tracking-widest">
                        {group._count?.activeMarkets || 0} Markets
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
          })
        )}
      </div>

      <CreateGroupModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => fetchGroups()}
      />
    </div>
  );
};

export default GroupsScroller;
