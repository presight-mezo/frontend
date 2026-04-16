import React from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-screen w-24 z-40 pointer-events-none">
        <div className="pointer-events-auto h-full w-full">
          <Sidebar />
        </div>
      </div>
      {/* Main */}
      <main className="flex flex-col min-h-screen relative">
        <TopBar />
        <div className="flex-1 w-full relative transition-all duration-500">
          <div className="pl-[120px] pr-6 md:pl-[140px] md:pr-10 max-w-[1600px] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
