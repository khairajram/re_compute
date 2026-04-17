import { LucideIcon } from "lucide-react";

export function SidebarItem({ icon: Icon, label, collapsed, isactive } : { icon: LucideIcon; label: string; collapsed: boolean; isactive: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer
      ${isactive ? "bg-gray-800 text-green-400" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}
    >
      <Icon className="w-5 h-5" />
      {!collapsed && <span className="text-sm">{label}</span>}
    </div>
  );
}