"use client";

import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";

const BaseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleGoogleLogin = () => {
    if (loading) return;
    setLoading(true);
    window.location.href = `${BaseURL}/api/auth/google`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString();

    // 🔍 Basic validation
    if (!name || !email || !password) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BaseURL}/api/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Signup failed");
      }

      setSuccess("Account created successfully! Redirecting...");
      
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);

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
            <h1 className="text-2xl font-semibold tracking-tight">Sign up</h1>
            <p className="text-xl text-zinc-400 mt-1">
              Create your Re-Compute account
            </p>
          </div>

          {/* 🔴 Error Message */}
          {error && (
            <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded-lg text-center">
              {error}
            </div>
          )}

          {/* 🟢 Success Message */}
          {success && (
            <div className="mb-4 text-sm text-green-400 bg-green-500/10 border border-green-500/20 p-2 rounded-lg text-center">
              {success}
            </div>
          )}

          {/* Google Button */}
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

            <input
              name="name"
              type="text"
              required
              placeholder="Name"
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-800/60 border border-zinc-700 focus:ring-2 focus:ring-primary/40"
            />

            <input
              name="email"
              type="email"
              required
              placeholder="Email"
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-800/60 border border-zinc-700 focus:ring-2 focus:ring-primary/40"
            />

            <input
              name="password"
              type="password"
              required
              placeholder="Password"
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-800/60 border border-zinc-700 focus:ring-2 focus:ring-primary/40"
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-medium py-2.5 rounded-xl hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Signing up..." : "Sign up"}
            </button>
          </form>

          <p className="text-sm text-zinc-500 mt-6 text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}