"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Layout/Sidebar";
import "./globals.css";

// Pages that don't need sidebar/layout
const PUBLIC_PATHS = ["/auth/login"];

export default function RootLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check auth
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");

      if (!token && !PUBLIC_PATHS.includes(pathname)) {
        router.push("/auth/login");
      } else {
        setIsAuthorized(true);
      }
    }
  }, [pathname, router]);

  const isPublicPage = PUBLIC_PATHS.includes(pathname);

  // If redirected, show nothing briefly to avoid flash
  if (!isPublicPage && !isAuthorized) {
    return (
      <html lang="en"><body></body></html>
    );
  }

  return (
    <html lang="en">
      <body className="antialiased text-gray-900 bg-gray-50">
        <div className="flex min-h-screen">
          {!isPublicPage && <Sidebar />}

          <main className={!isPublicPage ? "flex-1 p-8 ml-64" : "flex-1"}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
