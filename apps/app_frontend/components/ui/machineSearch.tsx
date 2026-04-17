import { Search, ChevronDown } from "lucide-react";

export function Filters() {
  return (
    <div className="flex flex-col md:flex-row gap-3 mt-6">
      
      {/* Search */}
      <div className="flex items-center bg-[#0f172a] border border-gray-800 rounded-lg px-3 py-2 w-full md:w-1/2">
        <Search className="w-4 h-4 text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search machines..."
          className="bg-transparent outline-none text-sm text-white w-full"
        />
      </div>

      {/* Status Filter */}
      <div className="flex items-center bg-[#0f172a] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-400 cursor-pointer">
        All Status
        <ChevronDown className="w-4 h-4 ml-2" />
      </div>

      {/* RAM Filter */}
      <div className="flex items-center bg-[#0f172a] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-400 cursor-pointer">
        RAM: High →
        <ChevronDown className="w-4 h-4 ml-2" />
      </div>
    </div>
  );
}