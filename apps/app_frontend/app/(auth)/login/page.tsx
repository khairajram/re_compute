"use client";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import Image from "next/image";
import  Link  from "next/link"
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


export default function LoginPage() {
  const [loading, setLoading] = useState(false);


  const handleGoogleLogin = async () => {
    setLoading(true);
    window.location.href = "/api/auth/google";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email");
    const password = formData.get("password");

    console.log(BASE_URL);

    const response = await fetch(`${BASE_URL}/api/login`, {
      method: "POST",
      headers: {  "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }); 

    console.log("Login response:", response);



    // TODO: call backend API
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent)] pointer-events-none" />

      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl backdrop-blur">

        <div className="mb-6 flex flex-col items-center justify-center text-center">
        <Image
            src="/logo.jpg"
            alt="Re-Compute Logo"
            width={50}
            height={50}
            className="mb-4"
          />

          <h1 className="text-2xl font-semibold">Welcome back</h1>

          <p className="text-sm text-zinc-400 mt-1">
            Login to your Re-Compute account
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white text-black font-medium py-2.5 rounded-lg hover:bg-zinc-200 transition"
        >
          <FcGoogle size={20} />
          Continue with Google
        </button>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-zinc-700" />
          <span className="text-xs text-zinc-400">OR</span>
          <div className="flex-1 h-px bg-zinc-700" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="text-sm text-zinc-400">Email</label>
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-white/20"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400">Password</label>
            <input
              name="password"
              type="password"
              required
              className="mt-1 w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-white/20"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-medium py-2.5 rounded-lg hover:bg-zinc-200 transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>


        <p className="text-sm text-zinc-500 mt-6 text-center">
          Don’t have an account?{" "}
          <Link
            href="/signup"
            className="text-white hover:underline text-sm"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}