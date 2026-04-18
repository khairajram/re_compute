export default function StatsSection() {
  const stats = [
    { value: "10K+", label: "Machines" },
    { value: "5K+", label: "Users" },
    { value: "1M+", label: "Compute Hours" },
    { value: "99.9%", label: "Uptime" },
  ];

  return (
    <section className="py-10 border-t border-gray-800">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-semibold text-center mb-12">
          Trusted by Builders Worldwide
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="p-6 rounded-lg border border-gray-800 bg-[#020617]
              hover:bg-gray-900 transition-all duration-300 ease-in-out text-center  hover:shadow-[0_0_20px_rgba(20,150,94,0.3)]"
            >
              <h3 className="text-3xl font-bold text-white mb-2">
                {stat.value}
              </h3>
              <p className="text-gray-400 text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}