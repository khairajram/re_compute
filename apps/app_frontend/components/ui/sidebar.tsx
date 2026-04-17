"use client";

import { useState } from "react";
import { LayoutDashboard, Cpu, CreditCard, Settings, LogOut, Menu } from "lucide-react";
import { SidebarItem } from "./sidebarItem";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex">
      
      <div
        className={`bg-[#020617] border-r border-gray-800 h-screen p-3 transition-all duration-300
        ${collapsed ? "w-20" : "w-64"}`}
      >
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mb-6 text-gray-400 hover:text-white hover:cursor-pointer transition-colors"
        >
          <Menu />
        </button>


        <div className="flex items-center gap-2 mb-8">
          <div className="bg-green-800 p-2 rounded-md">⚡</div>
          {!collapsed && <span className="font-semibold text-lg">Re-Compute</span>}
        </div>

        <nav className="space-y-2">
          
          <SidebarItem icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} isactive={true} />
          <SidebarItem icon={Cpu} label="Sessions" collapsed={collapsed} isactive={false} />
          <SidebarItem icon={Cpu} label="Host Panel" collapsed={collapsed} isactive={false} />
          <SidebarItem icon={CreditCard} label="Billing" collapsed={collapsed} isactive={false} />
        </nav>

        <div className="absolute bottom-6 left-6 right-4 space-y-2">
          <SidebarItem icon={Settings} label="Settings" collapsed={collapsed} isactive={false} />
          <SidebarItem icon={LogOut} label="Sign Out" collapsed={collapsed} isactive={false} />
        </div>
      </div>
    </div>
  );
}