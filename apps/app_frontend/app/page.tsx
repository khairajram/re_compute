import MachineCard from "@/components/ui/machine";
import { Filters } from "@/components/ui/machineSearch";
import StatsSection from "@/components/ui/machineStatsCard";
import Sidebar from "@/components/ui/sidebar";

export default function Home() {
  return (
    <div className="min-h-screen flex-col items-center 
    justify-center bg-[#020617] text-white p-6">
      <div className="flex">
        <div>
          <Sidebar/>
        </div>
        <div className="ml-6 flex-col w-full">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
              <p className="text-gray-400 mb-4">Welcome back, charlie! Here’s an overview of your recent activity and machine stats.</p>
            </div>
            <div>
                <div>
                <StatsSection />
                <Filters />
              </div>
              <div className="flex gap-6 mt-4">
                  <MachineCard name="regx" isActive={true} rating={4.5} price={0.45} cpu={16} ram={64} storage={500} gpu="RTX 4090" owner="charlie" />
                <MachineCard name="regx" isActive={false} rating={4.5} price={0.45} cpu={16} ram={64} storage={500} gpu="RTX 4090" owner="charlie" />
              </div>
            </div>
          
        </div>
        
      </div>
    </div>
  );
}
