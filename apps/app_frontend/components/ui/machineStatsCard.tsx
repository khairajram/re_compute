import { Server, Activity, Clock, DollarSign } from "lucide-react";

import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  extra?: string;
  icon: React.ElementType;
}

function StatCard({ title, value, extra, icon: Icon }: StatCardProps) {
  return (
    <div className="bg-[#0f172a] border border-gray-800 rounded-xl p-5 flex justify-between items-start w-full">
      <div>
        <p className="text-sm text-gray-400 uppercase tracking-wide">
          {title}
        </p>
        <h2 className="text-2xl font-semibold mt-2">{value}</h2>
        {extra && (
          <p className="text-sm text-green-400 mt-1">{extra}</p>
        )}
      </div>

      <Icon className="w-5 h-5 text-gray-500" />
    </div>
  );
}

interface StatsSectionProps {
  stats: {
    total: number;
    active: number;
    totalHours: number;
    totalSpent: number;
  };
}

export default function StatsSection({ stats }: StatsSectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Available Machines" value={stats.total} icon={Server} />
      <StatCard title="Active Sessions" value={stats.active} icon={Activity} />
      <StatCard title="Total Hours" value={stats.totalHours} icon={Clock} />
      <StatCard title="Total Spent" value={`$${stats.totalSpent.toFixed(2)}`} icon={DollarSign} />
    </div>
  );
}