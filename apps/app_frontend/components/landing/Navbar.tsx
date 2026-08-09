"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur border-b border-gray-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        <div className="text-2xl md:text-3xl font-bold tracking-tight select-none font-[family-name:var(--font-brand)]">
          <span className="text-white">code</span>
          <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent font-extrabold">Flow</span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="bg-secondary hover:bg-secondary-hover px-4 py-2 rounded-md text-primary-secondary text-sm">
            Login
          </Link>
          <Link
            href="/signup"
            className="bg-primary hover:bg-primary-hover px-4 py-2 rounded-md text-primary-foreground text-sm"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}