"use client";

import { useState } from "react";
import { Header } from "@/components/shared/header";
import { Sidebar } from "@/components/shared/sidebar";
import { EmployeeWidget } from "@/components/dashboard/employee-widget";

export default function Dashboard() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#050713] text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white">
      <Header
        title="Gmail AI Workspace"
        onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
        isSidebarCollapsed={isSidebarCollapsed}
      />
      <div className="flex flex-1 relative">
        <Sidebar isCollapsed={isSidebarCollapsed} />
        <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-950/20 via-[#050713] to-[#050713]">
          <div className="max-w-5xl mx-auto space-y-4">
            <EmployeeWidget />
          </div>
        </main>
      </div>
    </div>
  );
}

