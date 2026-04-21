"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Landing from "@/components/landing/landing";


const BaseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${BaseURL}/api/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          console.log("User is authenticated");
          router.replace("/dashboard");
        } else {
          console.log("User is not authenticated");
          setLoading(false);
        }
      } catch (err) {
        console.error("Error checking auth status:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) return <p>Loading...</p>;

  return <Landing />;
}