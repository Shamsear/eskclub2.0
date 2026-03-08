import PlayerListingClient from "@/components/public/PlayerListingClient";
import { HeroText } from "@/components/ui/HeroText";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Players — Eskimos 2.0",
  description: "Explore player profiles with detailed statistics, match history and performance analytics.",
};

export default function PlayersPage() {
  return (
    <>
      {/* ── Page Hero ── */}
      <section className="relative overflow-hidden py-14 sm:py-20" style={{ background: "linear-gradient(180deg,#0D0D0D 0%,#110800 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(255,183,0,0.12) 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #FF6600, transparent)" }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #FFB700, transparent)" }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF6600] to-transparent opacity-60" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <HeroText delay={0}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5 border border-[#FFB700]/25 text-xs font-bold tracking-widest uppercase text-[#FFB700]" style={{ background: "rgba(255,183,0,0.08)" }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
              Player Profiles
            </div>
          </HeroText>
          <HeroText delay={0.1}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 font-['Outfit',sans-serif]">
              Discover{" "}
              <span style={{ background: "linear-gradient(135deg,#FFB700,#FF6600,#FFB700)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Players
              </span>
            </h1>
          </HeroText>
          <HeroText delay={0.2}>
            <p className="text-[#707070] text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              Explore player profiles with detailed statistics, match history, and performance analytics.
            </p>
          </HeroText>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="bg-[#0D0D0D] py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PlayerListingClient />
        </div>
      </section>
    </>
  );
}
