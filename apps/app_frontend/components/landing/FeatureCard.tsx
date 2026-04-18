import { LucideIcon } from "lucide-react";

export default function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="border border-gray-800 rounded-lg p-6 hover:bg-gray-900 transition hover:border-green-500/40">
      <div className="flex gap-2 text-2xl">
          <Icon className="w-7 h-7 text-green-400 mb-4" />
          <h3 className=" font-semibold mb-2">{title}</h3>
      </div>
      
      <p className="text-gray-400">{description}</p>
    </div>
  );
}