"use client";
const BaseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = () => {
    if (loading) return;
    setLoading(true);
    window.location.href = `${BaseURL}/api/auth/google`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const email = formData.get("email")?.toString().trim();
      const password = formData.get("password")?.toString();

      // 🔍 Basic validation
      if (!email || !password) {
        setError("Email and password are required");
        setLoading(false);
        return;
      }

      const res = await fetch(`${BaseURL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // ✅ Success → redirect
      window.location.href = "/dashboard";

    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground px-4 relative overflow-hidden">

      <Navbar />

      <div className="flex w-full items-center justify-center">
        
        <div className="relative w-full max-w-md border bg-card text-card-foreground border-card-border rounded-2xl p-8 shadow-xl">

          <div className="mb-6 flex flex-col items-center text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-xl text-zinc-400 mt-1">
              Login to your Re-Compute account
            </p>
          </div>

          {/* 🔴 Error Message */}
          {error && (
            <div className="mb-4 text-sm text-red-400 bg-red-900 border border-red-500/20 p-2 rounded-lg text-center">
              {error}
            </div>
          )}

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white/10 text-white border border-white/20 font-medium py-2.5 rounded-xl hover:bg-white/20 transition disabled:opacity-50"
          >
            <FcGoogle size={20} />
            {loading ? "Please wait..." : "Continue with Google"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-zinc-700" />
            <span className="text-xs text-zinc-400">OR</span>
            <div className="flex-1 h-px bg-zinc-700" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="text-sm text-zinc-400">Email</label>
              <input
                name="email"
                type="email"
                required
                disabled={loading}
                className="mt-1 w-full px-3 py-2.5 rounded-xl bg-zinc-800/60 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition disabled:opacity-50"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400">Password</label>
              <input
                name="password"
                type="password"
                required
                disabled={loading}
                className="mt-1 w-full px-3 py-2.5 rounded-xl bg-zinc-800/60 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-medium py-2.5 rounded-xl hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-sm text-zinc-500 mt-6 text-center">
            Don’t have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}