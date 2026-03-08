import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LoginForm from "@/components/LoginForm";
import { Suspense } from "react";
import Link from "next/link";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0D0D0D]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-[#FF6600] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-[#707070] text-sm">Loading…</p>
        </div>
      </div>
    }>
      <div className="min-h-screen flex flex-col lg:flex-row bg-[#0D0D0D]">

        {/* ── Left branding panel ── */}
        <div className="lg:w-1/2 relative overflow-hidden p-8 lg:p-14 flex flex-col justify-between min-h-[50vh] lg:min-h-screen"
          style={{ background: "linear-gradient(135deg,#0D0D0D 0%,#1A0800 50%,#0D0D0D 100%)" }}
        >
          {/* Dot grid */}
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(255,183,0,0.1) 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
          {/* Glow blobs */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle,#FF6600,transparent)" }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle,#FFB700,transparent)" }} />
          {/* Right border */}
          <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#FF6600]/30 to-transparent hidden lg:block" />

          <div className="relative z-10">
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-3 mb-12 group">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 overflow-hidden p-1.5"
                style={{ background: "linear-gradient(135deg,#FF6600,#CC2900)", boxShadow: "0 0 20px rgba(255,102,0,0.4)" }}
              >
                <img src="/logo.png" alt="Eskimos Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="block text-xl font-black font-['Outfit',sans-serif]" style={{ background: "linear-gradient(135deg,#FFB700,#FF6600)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Eskimos Club</span>
                <span className="text-[10px] text-[#555] tracking-widest uppercase">Admin Portal</span>
              </div>
            </Link>

            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-5 leading-tight font-['Outfit',sans-serif]">
              Manage Your<br />
              <span style={{ background: "linear-gradient(135deg,#FFB700,#FF6600)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Sports Club
              </span>
            </h1>
            <p className="text-[#707070] text-base leading-relaxed mb-10 max-w-sm">
              Streamline tournaments, track members, and organise matches — all in one powerful platform.
            </p>

            {/* Feature list */}
            <div className="space-y-4">
              {[
                { icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z", text: "Member Management" },
                { icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", text: "Tournament Organisation" },
                { icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", text: "Real-time Analytics" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border border-[#FF6600]/20 group-hover:border-[#FF6600]/50 transition-colors" style={{ background: "rgba(255,102,0,0.1)" }}>
                    <svg className="w-4 h-4 text-[#FF6600]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                    </svg>
                  </div>
                  <span className="text-[#A0A0A0] text-sm group-hover:text-white transition-colors">{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 mt-8 lg:mt-0">
            <p className="text-[#333] text-xs">© {new Date().getFullYear()} Eskimos Club. All rights reserved.</p>
          </div>
        </div>

        {/* ── Right login form ── */}
        <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-10 bg-[#0D0D0D] min-h-[50vh] lg:min-h-screen">
          <div className="w-full max-w-md">
            {/* Card */}
            <div className="rounded-2xl border border-[#1E1E1E] p-8 sm:p-10" style={{ background: "#111" }}>
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase text-[#FFB700] border border-[#FFB700]/25 mb-5" style={{ background: "rgba(255,183,0,0.08)" }}>
                  Admin Access
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 font-['Outfit',sans-serif]">Welcome Back</h2>
                <p className="text-[#555] text-sm">Sign in to access your dashboard</p>
              </div>

              <LoginForm />

              <div className="mt-8 pt-6 border-t border-[#1A1A1A]">
                <p className="text-center text-xs text-[#444]">
                  Need help?{" "}
                  <a href="#" className="text-[#FF6600] hover:text-[#FFB700] transition-colors font-medium">
                    Contact Support
                  </a>
                </p>
              </div>
            </div>

            <p className="mt-5 text-center text-xs text-[#333]">
              Secure login protected by industry‑standard encryption
            </p>
          </div>
        </div>

      </div>
    </Suspense>
  );
}
