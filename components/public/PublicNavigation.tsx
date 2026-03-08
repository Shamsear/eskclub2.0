"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavigationManager } from "@/lib/navigation/NavigationManager";

export default function PublicNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsLeaderboardOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  const navLinks = [
    {
      href: "/tournaments",
      label: "Tournaments",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      desc: "View all tournaments & results",
    },
    {
      href: "/matches",
      label: "Matches",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      desc: "Browse match history & scores",
    },
    {
      href: "/players",
      label: "Players",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
      desc: "Explore player profiles & stats",
    },
    {
      href: "/clubs",
      label: "Clubs",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      desc: "Discover clubs & achievements",
    },
  ];

  const leaderboardLinks = [
    { href: "/leaderboard/players", label: "Players Leaderboard", icon: "👥", desc: "Top scoring players" },
    { href: "/leaderboard/teams",   label: "Teams Leaderboard",   icon: "🏆", desc: "Best performing teams" },
  ];

  const isActive = (href: string) => pathname?.startsWith(href);

  return (
    <>
      <NavigationManager />
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 bg-[#0D0D0D] ${scrolled
          ? "backdrop-blur-xl border-b border-[#1E1E1E] shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
          : "border-b border-[#1A1A1A]"
        }`}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF6600] to-transparent opacity-80" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* ── Logo ── */}
            <Link href="/" id="nav-logo" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0">
                <div
                  className="absolute inset-0 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #FF6600 0%, #CC2900 100%)", boxShadow: "0 0 15px rgba(255,102,0,0.4)" }}
                >
                  <img src="/logo.png" alt="Eskimos 2.0 Logo" className="w-full h-full object-contain p-1" />
                </div>
              </div>
              <div className="hidden xs:block leading-none">
                <span className="text-base sm:text-lg font-black font-['Outfit',sans-serif] bg-gradient-to-r from-[#FFB700] via-[#FF6600] to-[#FFB700] bg-clip-text text-transparent">
                  Eskimos 2.0
                </span>
                <p className="text-[9px] sm:text-[10px] text-[#555] tracking-widest uppercase -mt-0.5">Club Mode</p>
              </div>
            </Link>

            {/* ── Desktop nav links ── */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  id={`nav-${link.label.toLowerCase()}`}
                  className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(link.href)
                    ? "text-[#FFB700] bg-[#FFB700]/8"
                    : "text-[#A0A0A0] hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full bg-[#FF6600]" />
                  )}
                </Link>
              ))}

              {/* Leaderboard dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsLeaderboardOpen(true)}
                onMouseLeave={() => setIsLeaderboardOpen(false)}
              >
                <button
                  id="nav-leaderboard"
                  onClick={() => setIsLeaderboardOpen((v) => !v)}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${pathname?.startsWith("/leaderboard")
                    ? "text-[#FFB700] bg-[#FFB700]/8"
                    : "text-[#A0A0A0] hover:text-white hover:bg-white/5"
                  }`}
                >
                  Leaderboard
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${isLeaderboardOpen ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                  {pathname?.startsWith("/leaderboard") && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full bg-[#FF6600]" />
                  )}
                </button>

                <div className="absolute top-full left-0 w-56 pt-2">
                  <div
                    className={`rounded-xl overflow-hidden transition-all duration-200 origin-top ${isLeaderboardOpen
                      ? "opacity-100 scale-100 translate-y-0"
                      : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                    }`}
                    style={{
                      background: "rgba(18,18,18,0.97)",
                      border: "1px solid rgba(255,183,0,0.2)",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
                      backdropFilter: "blur(20px)",
                    }}
                  >
                    <div className="p-1.5">
                      {leaderboardLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsLeaderboardOpen(false)}
                          className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg hover:bg-[#FF6600]/10 transition-colors text-sm font-medium text-[#A0A0A0] hover:text-white"
                        >
                          <span className="text-base">{link.icon}</span>
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right actions ── */}
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                id="nav-signin"
                className="hidden sm:inline-flex items-center justify-center h-9 px-5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #FF6600, #CC2900)",
                  boxShadow: "0 0 16px rgba(255,102,0,0.3)",
                }}
              >
                Sign In
              </Link>

              {/* Hamburger */}
              <button
                id="nav-mobile-menu-btn"
                onClick={() => setIsMobileMenuOpen((v) => !v)}
                className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 active:scale-95"
                style={{ background: isMobileMenuOpen ? "rgba(255,102,0,0.15)" : "transparent", border: isMobileMenuOpen ? "1px solid rgba(255,102,0,0.3)" : "1px solid transparent" }}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
              >
                <div className="w-5 h-4 flex flex-col justify-between">
                  <span className={`block h-0.5 rounded-full bg-[#FF6600] transition-all duration-300 origin-center ${isMobileMenuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
                  <span className={`block h-0.5 rounded-full bg-white transition-all duration-300 ${isMobileMenuOpen ? "opacity-0 scale-x-0" : ""}`} />
                  <span className={`block h-0.5 rounded-full bg-[#FF6600] transition-all duration-300 origin-center ${isMobileMenuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Full-screen mobile menu overlay ── */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Slide-in drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 md:hidden w-[85vw] max-w-sm flex flex-col transition-transform duration-300 ease-out ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{ background: "#0D0D0D", borderLeft: "1px solid #1E1E1E" }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1A1A1A]">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#FF6600,#CC2900)", boxShadow: "0 0 12px rgba(255,102,0,0.4)" }}
            >
              <img src="/logo.png" alt="Eskimos 2.0" className="w-full h-full object-contain p-1" />
            </div>
            <div className="leading-none">
              <span className="text-sm font-black font-['Outfit',sans-serif] bg-gradient-to-r from-[#FFB700] to-[#FF6600] bg-clip-text text-transparent">
                Eskimos 2.0
              </span>
              <p className="text-[9px] text-[#555] tracking-widest uppercase">Club Mode</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#555] hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto py-3 px-3">
          {/* Main links */}
          <div className="space-y-1 mb-4">
            {navLinks.map((link, i) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`group flex items-center gap-3 px-3 py-3.5 rounded-xl transition-all duration-200 ${active
                    ? "text-white"
                    : "text-[#A0A0A0] hover:text-white hover:bg-white/5"
                  }`}
                  style={active ? {
                    background: "linear-gradient(135deg,rgba(255,102,0,0.15),rgba(255,183,0,0.05))",
                    border: "1px solid rgba(255,102,0,0.2)",
                  } : {
                    animationDelay: `${i * 40}ms`,
                  }}
                >
                  {/* Icon bubble */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${active ? "text-[#FF6600]" : "text-[#555] group-hover:text-[#FF6600]"}`}
                    style={{ background: active ? "rgba(255,102,0,0.12)" : "rgba(255,255,255,0.04)" }}
                  >
                    {link.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-black ${active ? "text-white" : ""}`}>{link.label}</div>
                    <div className="text-[11px] text-[#444] mt-0.5 truncate">{link.desc}</div>
                  </div>
                  {active && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF6600] flex-shrink-0" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Leaderboard section */}
          <div className="pt-3 border-t border-[#1A1A1A]">
            <p className="px-3 pb-2 text-[10px] font-black tracking-widest uppercase text-[#444]">Leaderboard</p>
            <div className="space-y-1">
              {leaderboardLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${active
                      ? "text-white"
                      : "text-[#A0A0A0] hover:text-white hover:bg-white/5"
                    }`}
                    style={active ? {
                      background: "linear-gradient(135deg,rgba(255,102,0,0.15),rgba(255,183,0,0.05))",
                      border: "1px solid rgba(255,102,0,0.2)",
                    } : {}}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                      style={{ background: active ? "rgba(255,102,0,0.12)" : "rgba(255,255,255,0.04)" }}
                    >
                      {link.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-black">{link.label}</div>
                      <div className="text-[11px] text-[#444] truncate">{link.desc}</div>
                    </div>
                    {active && <div className="w-1.5 h-1.5 rounded-full bg-[#FF6600] flex-shrink-0" />}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Sign In */}
        <div className="px-4 py-4 border-t border-[#1A1A1A]">
          <Link
            href="/login"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-black text-white transition-all duration-200 active:scale-95"
            style={{
              background: "linear-gradient(135deg,#FF6600,#CC2900)",
              boxShadow: "0 0 24px rgba(255,102,0,0.3)",
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Sign In
          </Link>
          <p className="text-center text-[10px] text-[#333] mt-2 tracking-widest uppercase">eFootball Club Mode Platform</p>
        </div>
      </div>
    </>
  );
}
