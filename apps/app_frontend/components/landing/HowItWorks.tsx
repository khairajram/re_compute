import { Cpu, Zap, Server, DollarSign } from "lucide-react";

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-[#020617] text-center">
      <h2 className="text-4xl font-bold mb-4">How It Works</h2>
      <p className="text-gray-400 max-w-2xl mx-auto mb-12">
        Run heavy tasks on powerful remote machines or earn by sharing your unused computing power.
        Our platform connects users with hosts for fast, efficient, and affordable compute access.
      </p>

      <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto px-6">

        <div>
          <h3 className="text-2xl font-semibold mb-4">1. Get Started</h3>
          <p className="text-gray-400">
            Sign up as a <span className="text-white">User</span> to run tasks, or as a <span className="text-white">Host</span> to share your machine.
            Setup takes just a few minutes.
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-semibold mb-4">2. Run or Share Compute Power</h3>
          <p className="text-gray-400">
            Users can send heavy workloads like AI processing, rendering, or simulations to powerful remote systems.
            Hosts make their idle CPU/GPU available securely and control when and how it's used.
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-semibold mb-4">3. Track, Optimize & Earn</h3>
          <p className="text-gray-400">
            Users monitor task progress and performance in real-time.
            Hosts earn based on compute usage, with transparent tracking and easy payouts.
          </p>
        </div>

      </div>

      <WhatYouCanDo/>
    </section>
  );
}


function WhatYouCanDo() {
  const features = [
    {
      icon: Cpu,
      text: "Run heavy applications without upgrading your hardware",
    },
    {
      icon: Zap,
      text: "Offload CPU/GPU intensive tasks instantly",
    },
    {
      icon: Server,
      text: "Access high-performance machines on demand",
    },
    {
      icon: DollarSign,
      text: "Earn passive income by sharing unused resources",
    },
  ];

  return (
    <div className="mt-20 max-w-5xl mx-auto px-6">
      <h3 className="text-3xl font-semibold mb-10 text-center">
        What You Can Do
      </h3>

      <div className="grid sm:grid-cols-2 gap-6">
        {features.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="flex items-start gap-4 p-5 border border-gray-800 rounded-lg
              bg-[#020617] hover:bg-gray-900 transition duration-200 hover:border-green-500/50 hover:scale-[1.02]"
            >
              <div className="bg-green-800/20 p-2 rounded-md">
                <Icon className="w-5 h-5 text-green-400" />
              </div>

              <p className="text-gray-300 leading-relaxed">
                {item.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}