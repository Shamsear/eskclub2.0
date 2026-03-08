import Link from "next/link";

const TwitterIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
  </svg>
);
const FacebookIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
  </svg>
);
const InstagramIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const YoutubeIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="white" />
  </svg>
);

const socialLinks = [
  { label: "Twitter", href: "#", Icon: TwitterIcon },
  { label: "Facebook", href: "#", Icon: FacebookIcon },
  { label: "Instagram", href: "#", Icon: InstagramIcon },
  { label: "YouTube", href: "#", Icon: YoutubeIcon },
];

const footerColumns = [
  {
    title: "Platform",
    links: [
      { label: "Tournaments", href: "/tournaments" },
      { label: "Matches", href: "/matches" },
      { label: "Players", href: "/players" },
      { label: "Clubs", href: "/clubs" },
      { label: "Leaderboard", href: "/leaderboard/players" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

export default function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#080808] overflow-hidden">
      {/* Top border glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF6600] to-transparent opacity-60" />

      {/* Background blobs */}
      <div
        className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-[0.04] blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #FF6600, transparent)" }}
      />
      <div
        className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-[0.03] blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #FFB700, transparent)" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">

          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3 mb-5 group">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                style={{ background: "linear-gradient(135deg, #FF6600, #CC2900)", boxShadow: "0 0 16px rgba(255,102,0,0.3)" }}
              >
                <img src="/logo.png" alt="Eskimos 2.0 Logo" className="w-full h-full object-contain p-1" />
              </div>
              <div>
                <span
                  className="block text-lg font-black font-['Outfit',sans-serif] bg-gradient-to-r from-[#FFB700] to-[#FF6600] bg-clip-text text-transparent"
                >
                  Eskimos 2.0
                </span>
                <span className="text-[10px] text-[#555] tracking-widest uppercase">eFootball Platform</span>
              </div>
            </Link>

            <p className="text-[#555] text-sm leading-relaxed mb-6 max-w-xs">
              The premium destination for eFootball Club Mode — track every tournament,
              match, and player milestone in one place.
            </p>

            {/* Socials */}
            <div className="flex gap-2.5">
              {socialLinks.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-[#555] hover:text-white transition-all duration-200 hover:scale-110 active:scale-95 border border-[#1E1E1E] hover:border-[#FF6600]/40 hover:bg-[#FF6600]/10"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-5 pb-3 border-b border-[#1A1A1A]">
                {col.title}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[#555] text-sm hover:text-[#FFB700] transition-colors duration-200 underline-grow inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter column */}
          <div>
            <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-5 pb-3 border-b border-[#1A1A1A]">
              Stay Updated
            </h3>
            <p className="text-[#555] text-sm mb-4 leading-relaxed">
              Get tournament results and platform news directly to your inbox.
            </p>
            <form className="flex flex-col gap-2.5" action="#">
              <div className="relative">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#111] border border-[#1E1E1E] text-white placeholder-[#444] text-sm focus:outline-none focus:border-[#FF6600]/50 transition-colors"
                  aria-label="Email address for newsletter"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #FF6600, #CC2900)",
                  boxShadow: "0 0 16px rgba(255,102,0,0.2)",
                }}
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="pt-8 border-t border-[#111] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[#444] text-xs">
            © {currentYear} Eskimos 2.0 Sports Platform. All rights reserved.
          </p>
          <div className="flex gap-5">
            {[
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
              { label: "Cookies", href: "/cookies" },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-[#444] hover:text-[#FFB700] text-xs transition-colors duration-200"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
