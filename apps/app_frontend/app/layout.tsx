import type { Metadata } from "next";
import "./globals.css";
import { Inter, Poppins, Outfit } from "next/font/google";
import { SocketProvider } from "./providers/SocketProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400","600"], variable: "--font-heading" });
const outfit = Outfit({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-brand" });


export const metadata: Metadata = {
  title: "CodeFlow | Distributed Compute Cloud IDE",
  description: "Securely rent remote machines and run workloads using Monaco Editor and live terminals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="font-sans min-h-full flex flex-col bg-background text-foreground" >
        <SocketProvider>
          {children}
        </SocketProvider>
      </body>
    </html>
  );
}
