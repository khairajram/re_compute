import { Search } from "lucide-react";

export function Filters({
  search,
  setSearch,
  status,
  setStatus,
  sortRam,
  setSortRam,
}: {
  search: string;
  setSearch: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  sortRam: string;
  setSortRam: (value: string) => void;
}) {
  return (
    <div className="flex flex-col md:flex-row gap-3 mt-6">
      
      {/* Search */}
      <div className="flex items-center bg-[#0f172a] border border-gray-800 rounded-lg px-3 py-2 w-full md:w-1/2">
        <Search className="w-4 h-4 text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search machines..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent outline-none text-sm text-white w-full"
        />
      </div>

      {/* Status */}
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="bg-[#0f172a] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-400"
      >
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="offline">Offline</option>
      </select>

      {/* RAM */}
      <select
        value={sortRam}
        onChange={(e) => setSortRam(e.target.value)}
        className="bg-[#0f172a] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-400"
      >
        <option value="none">RAM</option>
        <option value="high">High → Low</option>
        <option value="low">Low → High</option>
      </select>
    </div>
  );
}