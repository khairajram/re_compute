import { Server, Activity, Clock, DollarSign } from "lucide-react";

function StatCard({ title, value, extra, icon: Icon }) {
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

export default function StatsSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        title="Available Machines"
        value="4"
        icon={Server}
      />
      <StatCard
        title="Active Sessions"
        value="2"
        extra="+2 today"
        icon={Activity}
      />
      <StatCard
        title="Total Hours"
        value="27.0"
        icon={Clock}
      />
      <StatCard
        title="Total Spent"
        value="$43.80"
        extra="This week"
        icon={DollarSign}
      />
    </div>
  );
}