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
    <div className="bg-card hover:bg-card-hover text-card-foreground border border-card-border hover:border-card-border-hover rounded-lg p-6  transition ">
      <div className="flex gap-2 text-2xl">
          <Icon className="w-7 h-7 text-green-400 mb-4" />
          <h3 className=" font-semibold mb-2">{title}</h3>
      </div>
      
      <p className="text-gray-400">{description}</p>
    </div>
  );
}