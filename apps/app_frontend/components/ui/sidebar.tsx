"use client";
import { usePathname } from "next/navigation";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Cpu,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  MonitorCheck,
  Server,
} from "lucide-react";
import { SidebarItem } from "./sidebarItem";
import { BASE_URL } from "@/app/config";
import router from "next/dist/shared/lib/router/router";



export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: MonitorCheck, label: "Current Sessions", href: "/sessions" },
    { icon: Server, label: "Your Machines", href: "/machines" },
    { icon: CreditCard, label: "Billing", href: "/billing" },
  ];

  useEffect(() => {
    if (!mobileOpen) return;
  
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
  
    document.addEventListener("keydown", handleEsc);
  
    // prevent background scroll
    document.body.style.overflow = "hidden";
  
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [mobileOpen]);


  return (
    <>
      <div className="md:hidden fixed top-4 left-4 z-50 ">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 bg-[#020617] border border-gray-800 rounded-md text-gray-400 hover:text-white"
        >
          <Menu />
        </button>
      </div>

      

      <div
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden
        ${mobileOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
      />

      <div
        className={`
        fixed md:relative z-50 top-0 left-0 h-screen bg-[#020617] border-r border-gray-800 p-4
        flex flex-col 

        overflow-hidden

        transition-all duration-500 ease-in-out

        ${collapsed ? "md:w-20" : "md:w-72"}

        ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className={`flex items-center gap-2 pt-4
                ${collapsed ? "md:hidden" : "block"}`}>
              <div className="bg-green-800 p-2 rounded-md">⚡</div>

              <div
                className={`text-2xl pr-2 font-semibold transition-all duration-200 whitespace-nowrap
                ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"}`}
              >
                Re Compute
              </div>
            </div>


            <button
              onClick={() =>
                window.innerWidth < 768
                  ? setMobileOpen(false)
                  : setCollapsed(!collapsed)
              }
              className="text-gray-400 hover:text-white"
            >
              <span className="md:hidden">
                <X />
              </span>
              <span className="hidden md:block pl-3 pt-4">
                <Menu />
              </span>
            </button>
          </div>

          <nav className="space-y-2">
            {navItems.map((item, index) => (
              <SidebarItem
                key={index}
                icon={item.icon}
                label={item.label}
                href={item.href}
                collapsed={collapsed}
                isActive={pathname === item.href}
              />
            ))}
          </nav>
        </div>

        <div className="space-y-2">
          <SidebarItem
            icon={Settings}
            label="Settings"
            href="#"
            collapsed={collapsed}
            isActive={false}
          />
          <div  onClick={async () => {
              await fetch(`${BASE_URL}/api/logout`, {
                method: "GET",
                credentials: "include",
              });
              window.location.href = "/";
            }} >
            <SidebarItem
              icon={LogOut}
              label="Sign Out"
              href="#"
              collapsed={collapsed}
              isActive={false}
            />
          </div>
          
        </div>
      </div>
    </>
  );
}