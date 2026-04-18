export default function Footer() {
  return (
    <footer className="border-t border-gray-800 mt-20">
      <div className="max-w-6xl mx-auto px-6 py-12 grid gap-8 md:grid-cols-3 text-gray-400">
        
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 text-white text-lg font-semibold mb-3">
            ⚡ Re-Compute
          </div>
          <p className="text-sm">
            Distributed computing made simple. Rent powerful machines or earn
            from your idle hardware.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-2">
          <h4 className="text-white font-medium mb-2">Product</h4>
          <a href="#" className="hover:text-white transition">Features</a>
          <a href="#" className="hover:text-white transition">Pricing</a>
          <a href="#" className="hover:text-white transition">Docs</a>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-2">
          <h4 className="text-white font-medium mb-2">Company</h4>
          <a href="#" className="hover:text-white transition">About</a>
          <a href="#" className="hover:text-white transition">Contact</a>
          <a href="#" className="hover:text-white transition">GitHub</a>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800 py-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Re-Compute. All rights reserved.
      </div>
    </footer>
  );
}