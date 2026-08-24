"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return true;
    const savedTheme = window.localStorage.getItem("theme");
    if (savedTheme === "dark") return true;
    if (savedTheme === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  if (!session) return null;

  const isActive = (path: string) => pathname === path;

  return (
    <nav
      className={`sticky top-0 z-40 border-b backdrop-blur transition-colors ${
        isDark
          ? "border-[#1f2937] bg-[#050814]/95"
          : "border-[#e5e7eb] bg-white/95"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
        {/* Left: Logo & Nav Links */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-bold uppercase tracking-[0.15em] transition ${
              isDark
                ? "text-[#f9fafb] hover:text-[#6b7280]"
                : "text-[#1f2937] hover:text-[#6b7280]"
            }`}
          >
            Hotel Transylvania
          </Link>

          <div className="hidden items-center gap-2 sm:flex">
            <Link
              href="/"
              className={`inline-flex h-8 items-center rounded-lg px-3 text-xs font-semibold transition ${
                isActive("/")
                  ? isDark
                    ? "bg-[#1f2937] text-[#f9fafb]"
                    : "bg-[#f3f4f6] text-[#1f2937]"
                  : isDark
                    ? "text-[#6b7280] hover:bg-[#1f2937]/50 hover:text-[#f9fafb]"
                    : "text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#1f2937]"
              }`}
            >
              Home
            </Link>
            <Link
              href="/products"
              className={`inline-flex h-8 items-center rounded-lg px-3 text-xs font-semibold transition ${
                isActive("/products")
                  ? isDark
                    ? "bg-[#1f2937] text-[#f9fafb]"
                    : "bg-[#f3f4f6] text-[#1f2937]"
                  : isDark
                    ? "text-[#6b7280] hover:bg-[#1f2937]/50 hover:text-[#f9fafb]"
                    : "text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#1f2937]"
              }`}
            >
              Products
            </Link>
            <Link
              href="/entries"
              className={`inline-flex h-8 items-center rounded-lg px-3 text-xs font-semibold transition ${
                isActive("/entries")
                  ? isDark
                    ? "bg-[#1f2937] text-[#f9fafb]"
                    : "bg-[#f3f4f6] text-[#1f2937]"
                  : isDark
                    ? "text-[#6b7280] hover:bg-[#1f2937]/50 hover:text-[#f9fafb]"
                    : "text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#1f2937]"
              }`}
            >
              Entries
            </Link>
          </div>
        </div>

        {/* Right: User & Sign Out */}
        <div className="flex items-center gap-3">
          {session.user?.email && (
            <span
              className={`hidden text-xs sm:inline ${isDark ? "text-[#6b7280]" : "text-[#6b7280]"}`}
            >
              {session.user.email}
            </span>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition ${
              isDark
                ? "border-[#1f2937] bg-[#101522] text-[#6b7280] hover:bg-[#1f2937] hover:text-[#f9fafb]"
                : "border-[#e5e7eb] bg-white text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#1f2937]"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
