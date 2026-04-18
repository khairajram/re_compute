"use client"

import { Check } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="pt-32 pb-12 text-center">
      <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
        Run Heavy Tasks Anywhere <br className="hidden md:block" />
        or Earn From Your Idle PC
      </h1>

      <p className="text-gray-400 max-w-2xl mx-auto mb-8 text-lg md:text-xl">
        Offload demanding workloads like AI processing, video rendering, and simulations
        to powerful remote machines — or monetize your unused CPU/GPU securely and effortlessly.
      </p>

      <div className="flex justify-center gap-4 flex-wrap">
        <button className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-md font-medium cursor-pointer">
          Start Running Tasks
        </button>

        <button className="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-md font-medium cursor-pointer">
          Share Your Machine
        </button>

        <button  className="border border-gray-700 px-6 py-3 rounded-md text-gray-300 hover:text-white cursor-pointer"
          onClick={() => {
            document
              .getElementById("how-it-works")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          See How It Works
        </button>
      </div>

      {/* Trust / Value Props */}
      <div className="mt-12 text-gray-400 text-sm md:text-base flex flex-col md:flex-row items-center justify-center gap-4 md:gap-10">
        
        <div className="flex items-center gap-2">
          <Check className="text-green-500" />
          <span>Secure & Isolated Sessions</span>
        </div>

        <div className="flex items-center gap-2">
          <Check className="text-green-500" />
          <span>Pay Only for What You Use</span>
        </div>

        <div className="flex items-center gap-2">
          <Check className="text-green-500" />
          <span>Real-Time Performance Monitoring</span>
        </div>

        <div className="flex items-center gap-2">
          <Check className="text-green-500" />
          <span>CPU & GPU Powered Machines</span>
        </div>
      </div>

      {/* Optional micro use-cases */}
      <div className="mt-10 text-gray-500 text-xl max-w-2xl mx-auto">
        Ideal for developers, creators, and researchers — run Blender renders, train ML models,
        compile large projects, or process data without upgrading your hardware.
      </div>
    </section>
  );
}