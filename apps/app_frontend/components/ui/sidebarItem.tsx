import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  collapsed: boolean;
  isActive: boolean;
  href: string;
}

export function SidebarItem({
  icon: Icon,
  label,
  collapsed,
  isActive,
  href,
}: SidebarItemProps) {
  return (
    <Link href={href || "#"} className="w-full">
      <div
        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors duration-300
        ${
          isActive
            ? "bg-gray-800 text-green-500"
            : "text-gray-400 hover:bg-gray-800 hover:text-white"
        }`}
      >
        <Icon className="w-7 h-6 shrink-0" />

        <span
          className={`text-[23px] whitespace-nowrap transition-all duration-200 origin-left
          ${
            collapsed
              ? "opacity-0 scale-95 w-0 overflow-hidden"
              : "opacity-100 scale-100"
          }`}
        >
          {label}
        </span>
      </div>
    </Link>
  );
}