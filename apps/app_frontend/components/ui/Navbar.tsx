"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur border-b border-gray-800">
      <div className="max-w-7xl mx-auto flex items-center justify-center p-4">
        <div className="text-2xl md:text-3xl font-bold tracking-tight select-none font-[family-name:var(--font-brand)]">
          <span className="text-white">code</span>
          <span className="bg-gradient-to-r from-green-400 to-emerald-550 bg-clip-text text-transparent font-extrabold">Flow</span>
        </div>
      </div>
    </nav>
  );
}