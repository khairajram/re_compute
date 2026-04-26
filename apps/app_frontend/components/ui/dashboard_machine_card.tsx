import { Star,Cpu, HardDrive, MemoryStick,LocateIcon } from "lucide-react";

export interface MachineCardProps {
  id: string | number;
  name: string;
  inUse: boolean;
  isOnline: boolean;
  review: number;
  pricePerHour: number;
  cpu: number;
  ram: number;
  storage: number;
  gpu: string;
  owner: string;
  onClick?: () => void;
}

export default function DashboardMachineCard({  name, isOnline, review, pricePerHour, cpu, ram, storage, gpu, owner,inUse, onClick }: MachineCardProps) {




  return (
    <div className="bg-[#050a14] text-white rounded-2xl p-5 w-full max-w-md shadow-lg border border-gray-800 hover:border-green-300 hover:border transition-all hover:scale-[1.005] duration-400 ease-in-out">
      
      
      <div className="flex justify-between items-start">
        <div>
            <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold flex items-center gap-2">
                {name}
                <span
                className={`w-2 h-2 rounded-full ${
                    isOnline ? "bg-green-500" : "bg-gray-500"
                }`}
                />
            </h2>

            <div className="flex items-center text-yellow-400 text-sm">
                <Star className="w-4 h-4 fill-yellow-400 mr-1" />
                {review}
            </div>
            </div>

            <p className="text-sm text-gray-400">
              <div className="flex">
                  {owner} · <LocateIcon className="w-4 h-4 mr-1" /> india
              </div>
            
            </p>
        </div>

        <div className="text-green-400 font-semibold text-lg">
            ${ pricePerHour}
            <span className="text-sm text-gray-400">/hr</span>
        </div>
      </div>

      
      <div className="grid grid-cols-3 gap-4 mt-4 text-sm text-gray-300">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4" /> <span>{cpu} cores</span>
        </div>
        <div className="flex items-center gap-2">
          <MemoryStick className="w-4 h-4" /> <span>{ram}GB</span>
        </div>
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4" /> <span>{storage}GB</span>
        </div>
      </div>

      <div className="mt-3 text-sm text-gray-300">
         GPU: <span className="text-white font-medium">{gpu}</span>
      </div>

      <button onClick={onClick} className={`mt-5 w-full bg-primary hover:cursor-pointer hover:bg-primary-hover text-xl  transition-all text-white font-semibold py-2 rounded-lg`}>
        Connect
      </button>
    </div>
  );
}