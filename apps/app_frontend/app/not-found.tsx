import Link from "next/link";

export default function NotFound() {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-gray-400 text-2xl mb-6">Page not found</p>

      <Link
        href="/"
        className="p-8 py-3 text-2xl bg-primary rounded-md text-white"
      >
        Go Home
      </Link>
    </div>
  );
}