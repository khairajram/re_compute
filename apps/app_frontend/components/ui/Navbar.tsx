"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur border-b border-gray-800">
      <div className="max-w-7xl mx-auto flex items-center justify-center p-4">
        <div className="text-xl font-semibold flex items-center gap-2">
          ⚡ <span>Re-Compute</span>
        </div>
      </div>
    </nav>
  );
}