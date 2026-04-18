export default function CTASection() {
  return (
    <section className="py-10 px-6">
      <div className="max-w-4xl mx-auto text-center border border-gray-800 rounded-2xl p-10 bg-linear-to-b from-[#020617] to-gray-900 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]">
        
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Start building today
        </h2>

        <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
          Deploy or start your session on high-performance machines in minutes.
          No setup. No hassle. Just compute power when you need it.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          <button className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-md font-medium transition">
            Get Started
          </button>

          <button className="border border-gray-700 px-6 py-3 rounded-md text-gray-300 hover:text-white hover:border-gray-500 transition">
            Learn More
          </button>
        </div>

      </div>
    </section>
  );
}