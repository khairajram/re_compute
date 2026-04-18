"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#020617]/80 backdrop-blur border-b border-gray-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        <div className="text-xl font-semibold flex items-center gap-2">
          ⚡ <span>Re-Compute</span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-gray-400 hover:text-white">
            Login
          </Link>
          <Link
            href="/signup"
            className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-md text-white"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}