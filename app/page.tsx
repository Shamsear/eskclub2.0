import Link from "next/link";
import PublicNavigation from "@/components/public/PublicNavigation";
import PublicFooter from "@/components/public/PublicFooter";
import { HeroItem, StatPill, FeatureCardWrapper, StatBandItem, SectionReveal } from "@/components/public/HomeAnimations";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Eskimos 2.0 Club — eFootball Club Mode Platform",
  description:
    "Join the Eskimos 2.0 Club community. Track tournaments, player stats, and club achievements in our premium eFootball Club Mode platform.",
};

export const revalidate = 600;

async function getStats() {
  try {
    const [tournamentsCount, matchesCount, playersCount, clubsCount] =
      await Promise.all([
        prisma.tournament.count(),
        prisma.match.count(),
        prisma.player.count(),
        prisma.club.count(),
      ]);
    return {
      tournaments: tournamentsCount,
      matches: matchesCount,
      players: playersCount,
      clubs: clubsCount,
    };
  } catch {
    return { tournaments: 0, matches: 0, players: 0, clubs: 0 };
  }
}

/* ── small inline SVG icons ── */
const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <path d="M6 9H4a2 2 0 01-2-2V5a2 2 0 012-2h2" />
    <path d="M18 9h2a2 2 0 002-2V5a2 2 0 00-2-2h-2" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 006 6v0a6 6 0 006-6V2z" />
  </svg>
);

const BoltIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const UserGroupIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const ChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const ArrowRight = ({ cls = "" }: { cls?: string }) => (
  <svg className={`w-4 h-4 ${cls}`} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

/* ── features data ── */
const features = [
  {
    href: "/tournaments",
    icon: <TrophyIcon />,
    label: "Tournaments",
    tagline: "Live Standings",
    description: "Follow bracket progress, group stages, and knockout rounds with live standings updated in real-time.",
    accent: "#FF6600",
  },
  {
    href: "/matches",
    icon: <BoltIcon />,
    label: "Matches",
    tagline: "Match Center",
    description: "Dive deep into every match — scorelines, goal sequences, player ratings, and post-match analytics.",
    accent: "#FFB700",
  },
  {
    href: "/players",
    icon: <UserGroupIcon />,
    label: "Players",
    tagline: "Player Stats",
    description: "Comprehensive player profiles with career statistics, performance trends, and head-to-head records.",
    accent: "#FF6600",
  },
  {
    href: "/clubs",
    icon: <ShieldIcon />,
    label: "Clubs",
    tagline: "Club Profiles",
    description: "Explore club rosters, squad depth charts, win rates, and season-by-season performance history.",
    accent: "#FFB700",
  },
  {
    href: "/leaderboard/players",
    icon: <ChartIcon />,
    label: "Leaderboard",
    tagline: "Rankings",
    description: "See who's dominating the competition — ranked by points, wins, goals scored, and custom metrics.",
    accent: "#FF6600",
  },
];

/* ─────────────────────────────────────────────────
   PAGE COMPONENT
───────────────────────────────────────────────── */
export default async function Home() {
  const stats = await getStats();

  const statItems = [
    { label: "Tournaments", value: stats.tournaments, suffix: "+" },
    { label: "Matches Played", value: stats.matches, suffix: "+" },
    { label: "Active Players", value: stats.players, suffix: "+" },
    { label: "Clubs", value: stats.clubs, suffix: "+" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0D0D0D]">
      <PublicNavigation />

      <main className="flex-1">
        {/* ══════════════════════════════════════
            HERO SECTION
        ══════════════════════════════════════ */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden mesh-bg">
          {/* Animated blob lights */}
          <div
            className="absolute top-[-10%] left-[-5%] w-[45rem] h-[45rem] rounded-full opacity-15 blur-2xl pointer-events-none"
            style={{
              background: "radial-gradient(circle, #FF6600 0%, transparent 70%)",
              animation: "hero-blob-1 12s ease-in-out infinite",
              willChange: "transform",
            }}
          />
          <div
            className="absolute bottom-[-10%] right-[-5%] w-[40rem] h-[40rem] rounded-full opacity-12 blur-2xl pointer-events-none"
            style={{
              background: "radial-gradient(circle, #FFB700 0%, transparent 70%)",
              animation: "hero-blob-2 14s ease-in-out infinite",
              willChange: "transform",
            }}
          />

          {/* Dot grid */}
          <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />

          {/* Horizontal lines accent */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-px"
                style={{
                  top: `${15 + i * 14}%`,
                  background: "linear-gradient(90deg, transparent, rgba(255,183,0,0.06), transparent)",
                }}
              />
            ))}
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            {/* Eyebrow badge */}
            <HeroItem delay={0}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 glass border border-[#FFB700]/30 text-xs sm:text-sm font-semibold text-[#FFB700] tracking-widest uppercase">
                <span className="w-2 h-2 rounded-full bg-[#FF6600] animate-pulse inline-block" />
                eFootball Club Mode Platform
              </div>
            </HeroItem>

            {/* Main heading */}
            <HeroItem delay={0.1}>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight mb-6 font-['Outfit',sans-serif]">
                <span className="block text-white mb-2">Welcome to</span>
                <span className="gradient-text-brand text-glow block">Eskimos&nbsp;2.0</span>
              </h1>
            </HeroItem>

            <HeroItem delay={0.2}>
              <p className="text-base sm:text-lg md:text-xl text-[#A0A0A0] mb-10 max-w-2xl mx-auto leading-relaxed font-light">
                The ultimate destination to track tournaments, analyse player performance,
                and dominate eFootball competition — all in one premium platform.
              </p>
            </HeroItem>

            {/* CTA buttons */}
            <HeroItem delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                <Link
                  href="/tournaments"
                  id="hero-cta-primary"
                  className="group relative inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-sm sm:text-base text-white overflow-hidden sheen transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #FF6600 0%, #CC2900 100%)",
                    boxShadow: "0 0 30px rgba(255,102,0,0.35), 0 4px 20px rgba(0,0,0,0.4)",
                  }}
                >
                  <span className="w-5 h-5 flex-shrink-0"><TrophyIcon /></span>
                  View Tournaments
                  <ArrowRight cls="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/players"
                  id="hero-cta-secondary"
                  className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-semibold text-sm sm:text-base text-white transition-all duration-300 hover:scale-105 active:scale-95 glass border border-[#FFB700]/40 hover:border-[#FFB700]/80 hover:bg-white/10"
                >
                  Browse Players
                  <ArrowRight cls="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </HeroItem>

            {/* Stat pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
              {statItems.map((s, i) => (
                <StatPill key={i} index={i}>
                  <div className="relative rounded-2xl p-4 sm:p-5 glass border border-[#FFB700]/20 hover:border-[#FFB700]/50 transition-all duration-300 hover:-translate-y-1 group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FF6600]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                    <div className="stat-number text-3xl sm:text-4xl font-black mb-1 font-['Outfit',sans-serif]">
                      {s.value}{s.suffix}
                    </div>
                    <div className="text-[#707070] text-xs sm:text-sm font-medium">{s.label}</div>
                  </div>
                </StatPill>
              ))}
            </div>
          </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0D0D0D] to-transparent pointer-events-none" />
        </section>

        {/* ══════════════════════════════════════
            FEATURES GRID
        ══════════════════════════════════════ */}
        <section className="py-16 sm:py-24 lg:py-32 bg-[#0D0D0D] relative overflow-hidden">
          {/* Background accent */}
          <div className="absolute inset-0 dot-grid opacity-10 pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section header */}
            <div className="text-center mb-12 sm:mb-16">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase text-[#FFB700] bg-[#FFB700]/10 border border-[#FFB700]/20 mb-4">
                Platform
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 font-['Outfit',sans-serif]">
                Everything You Need
              </h2>
              <p className="text-[#707070] text-base sm:text-lg max-w-xl mx-auto">
                Five powerful sections designed to give you the full picture of your club&apos;s journey.
              </p>
            </div>

            {/* Cards grid — first 4 in 2×2, last one full width centred */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
              {features.slice(0, 4).map((f, i) => (
                <FeatureCardWrapper key={i} index={i}>
                  <FeatureCard feature={f} index={i} />
                </FeatureCardWrapper>
              ))}
            </div>
            <div className="flex justify-center">
              <div className="w-full sm:w-1/2 lg:w-1/4">
                <FeatureCardWrapper index={4}>
                  <FeatureCard feature={features[4]} index={4} />
                </FeatureCardWrapper>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            LIVE STATS BAND
        ══════════════════════════════════════ */}
        <section className="relative py-14 sm:py-20 overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0F0F0F 0%, #1A0A00 50%, #0F0F0F 100%)" }}
        >
          {/* Orange glow line top */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF6600] to-transparent opacity-60" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FFB700] to-transparent opacity-40" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
              {[
                { value: stats.tournaments, label: "Tournaments", suffix: "", gradient: "from-[#FFB700] to-[#FF6600]" },
                { value: stats.matches, label: "Matches", suffix: "", gradient: "from-[#FF6600] to-[#CC2900]" },
                { value: stats.players, label: "Players", suffix: "", gradient: "from-[#FFB700] to-[#FF9900]" },
                { value: stats.clubs, label: "Clubs", suffix: "", gradient: "from-[#FF6600] to-[#FFB700]" },
              ].map((s, i) => (
                <StatBandItem key={i} index={i}>
                  <div
                    className={`text-4xl sm:text-5xl lg:text-6xl font-black mb-2 bg-gradient-to-br ${s.gradient} bg-clip-text text-transparent font-['Outfit',sans-serif] group-hover:scale-110 transition-transform duration-300`}
                  >
                    {s.value}{s.suffix}
                  </div>
                  <div className="text-[#707070] text-sm sm:text-base font-medium tracking-wide uppercase">{s.label}</div>
                  <div className="mt-3 mx-auto w-10 h-0.5 rounded-full bg-gradient-to-r from-[#FF6600] to-[#FFB700] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </StatBandItem>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            WHY SECTION
        ══════════════════════════════════════ */}
        <section className="py-16 sm:py-24 lg:py-32 bg-[#111111] relative overflow-hidden">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-8 blur-2xl pointer-events-none"
            style={{ background: "radial-gradient(circle, #FF6600, transparent)" }} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left copy */}
              <div>
                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase text-[#FFB700] bg-[#FFB700]/10 border border-[#FFB700]/20 mb-5">
                  Why Eskimos 2.0?
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6 leading-tight font-['Outfit',sans-serif]">
                  Built for Serious <span className="gradient-text-brand">Competitors</span>
                </h2>
                <p className="text-[#707070] text-base sm:text-lg leading-relaxed mb-8">
                  Whether you&apos;re organising a major eFootball tournament or tracking your personal
                  progress through the club ladder, Eskimos 2.0 gives you the data, structure, and
                  community you need to stay ahead.
                </p>

                <div className="space-y-4">
                  {[
                    { title: "Real-time data", body: "Stats and standings refresh automatically so you never miss a result." },
                    { title: "Deep analytics", body: "Head-to-head records, form guides, and player heatmaps." },
                    { title: "Community-driven", body: "Built around club culture — every result, every rivalry, every moment." },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 group">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#FF6600]/15 border border-[#FF6600]/30 flex items-center justify-center group-hover:bg-[#FF6600]/25 transition-colors mt-0.5">
                        <svg className="w-4 h-4 text-[#FF6600]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm mb-0.5">{item.title}</p>
                        <p className="text-[#707070] text-sm">{item.body}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-10 flex flex-wrap gap-4">
                  <Link
                    href="/tournaments"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:scale-105 active:scale-95"
                    style={{ background: "linear-gradient(135deg, #FF6600, #CC2900)", boxShadow: "0 0 20px rgba(255,102,0,0.3)" }}
                  >
                    Explore Tournaments <ArrowRight />
                  </Link>
                  <Link
                    href="/clubs"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-[#FFB700] border border-[#FFB700]/30 hover:border-[#FFB700]/60 hover:bg-[#FFB700]/5 transition-all duration-300"
                  >
                    Browse Clubs <ArrowRight />
                  </Link>
                </div>
              </div>

              {/* Right visual — floating stat cards */}
              <div className="relative h-96 hidden lg:block">
                {/* Large card */}
                <div className="absolute top-6 left-0 w-64 glass border border-[#FFB700]/20 rounded-2xl p-5 shadow-2xl"
                  style={{ animation: "float 6s ease-in-out infinite", willChange: "transform" }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FF6600]/20 border border-[#FF6600]/30 flex items-center justify-center">
                      <div className="w-5 h-5 text-[#FF6600]"><TrophyIcon /></div>
                    </div>
                    <div>
                      <div className="text-white text-sm font-bold">Active Tournament</div>
                      <div className="text-[#707070] text-xs">Group Stage</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#FFB700] font-black text-2xl">{stats.matches}</span>
                    <span className="text-xs text-[#707070] bg-[#FF6600]/10 px-2 py-1 rounded-lg">Matches</span>
                  </div>
                </div>

                {/* Stat card */}
                <div className="absolute top-36 right-8 w-52 glass border border-[#FF6600]/25 rounded-2xl p-4 shadow-2xl"
                  style={{ animation: "float 8s ease-in-out infinite", animationDelay: "-2s", willChange: "transform" }}>
                  <div className="text-[#707070] text-xs uppercase tracking-widest mb-1">Top Scorer</div>
                  <div className="text-white font-bold text-sm mb-2">Club Mode Player</div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 rounded-full" style={{ background: "linear-gradient(90deg, #FF6600, #FFB700)" }} />
                  </div>
                </div>

                {/* Mini pill */}
                <div className="absolute bottom-16 left-8 glass border border-[#FFB700]/30 rounded-full px-5 py-2.5 flex items-center gap-2 shadow-xl"
                  style={{ animation: "float 7s ease-in-out infinite", animationDelay: "-4s", willChange: "transform" }}>
                  <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                  <span className="text-white text-xs font-semibold">Platform Live</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            CTA SECTION
        ══════════════════════════════════════ */}
        <section className="relative py-16 sm:py-24 lg:py-32 overflow-hidden bg-[#0D0D0D]">
          {/* Full bleed gradient card */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="relative rounded-3xl overflow-hidden py-16 sm:py-20 px-8 sm:px-16 text-center"
              style={{
                background: "linear-gradient(135deg, #1A0800 0%, #2B1200 40%, #1A0500 100%)",
                boxShadow: "0 0 80px rgba(255,102,0,0.2)",
              }}
            >
              {/* Dot grid inside */}
              <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />
              {/* Glow orbs */}
              <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full blur-2xl opacity-20 pointer-events-none"
                style={{ background: "radial-gradient(circle, #FF6600, transparent)" }} />
              <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full blur-2xl opacity-15 pointer-events-none"
                style={{ background: "radial-gradient(circle, #FFB700, transparent)" }} />
              {/* Border glow top */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF6600] to-transparent" />

              <div className="relative z-10">
                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase text-[#FFB700] bg-[#FFB700]/10 border border-[#FFB700]/25 mb-6">
                  Get Started Today
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-5 font-['Outfit',sans-serif] leading-tight">
                  Ready to{" "}
                  <span className="gradient-text-brand">Dominate</span>?
                </h2>
                <p className="text-[#A0A0A0] text-base sm:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                  Start tracking your eFootball journey with Eskimos 2.0 and take your game to the next level.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link
                    href="/tournaments"
                    id="cta-primary"
                    className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-white text-sm sm:text-base transition-all duration-300 hover:scale-105 active:scale-95"
                    style={{
                      background: "linear-gradient(135deg, #FF6600, #CC2900)",
                      boxShadow: "0 0 30px rgba(255,102,0,0.4)",
                    }}
                  >
                    Get Started
                    <ArrowRight cls="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/clubs"
                    id="cta-secondary"
                    className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-semibold text-white text-sm sm:text-base transition-all duration-300 hover:scale-105 active:scale-95 glass border border-white/20 hover:border-white/40 hover:bg-white/10"
                  >
                    Explore Clubs
                    <ArrowRight cls="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

/* ─── Feature Card sub-component ─────────────────────────────────── */
function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  return (
    <Link
      href={feature.href}
      className="group relative rounded-2xl overflow-hidden border border-[#1E1E1E] bg-[#111111] hover:border-[#FF6600]/40 transition-all duration-400 card-lift block"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${feature.accent}, transparent)` }}
      />

      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${feature.accent}08 0%, transparent 70%)` }}
      />

      <div className="relative p-6 sm:p-7">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl mb-5 flex items-center justify-center border transition-all duration-300 group-hover:scale-110"
          style={{
            background: `${feature.accent}15`,
            borderColor: `${feature.accent}30`,
            color: feature.accent,
          }}
        >
          <div className="w-6 h-6" style={{ color: feature.accent }}>
            {feature.icon}
          </div>
        </div>

        {/* Label + tagline */}
        <div className="flex items-baseline gap-2 mb-2">
          <h3 className="text-white font-bold text-lg group-hover:text-[#FFB700] transition-colors duration-200 font-['Outfit',sans-serif]">
            {feature.label}
          </h3>
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{ background: `${feature.accent}18`, color: feature.accent }}
          >
            {feature.tagline}
          </span>
        </div>

        <p className="text-[#707070] text-sm leading-relaxed mb-5">{feature.description}</p>

        {/* CTA row */}
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest" style={{ color: feature.accent }}>
          <span>Explore</span>
          <ArrowRight cls="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
