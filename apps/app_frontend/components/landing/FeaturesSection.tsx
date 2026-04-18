import { Cpu, Zap, Shield } from "lucide-react";
import FeatureCard from "./FeatureCard";

export default function FeaturesSection() {
  return (
    <section className="py-10 max-w-6xl mx-auto px-6">
      <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Powerful Features
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Everything you need to deploy, manage, and scale high-performance
            compute resources effortlessly.
          </p>
        </div>

      <div className="grid md:grid-cols-3 gap-6">
        <FeatureCard
          icon={Cpu}
          title="High Performance"
          description="Run workloads on powerful machines with top-tier GPUs."
        />
        <FeatureCard
          icon={Zap}
          title="Instant Deployment"
          description="Launch machines in seconds with zero setup."
        />
        <FeatureCard
          icon={Shield}
          title="Secure & Reliable"
          description="Your workloads are safe with enterprise-grade security."
        />
      </div>
    </section>
  );
}

