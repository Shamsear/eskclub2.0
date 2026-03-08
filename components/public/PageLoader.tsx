'use client';

import { motion } from 'framer-motion';

/**
 * PageLoader — full section centered spinner.
 * Replaces skeleton loading across all public listing pages.
 */
export function PageLoader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6" role="status" aria-label={label}>
      {/* Outer ring */}
      <div className="relative w-16 h-16">
        {/* Static dim ring */}
        <div
          className="absolute inset-0 rounded-full border-2 border-[#1E1E1E]"
        />
        {/* Spinning orange arc */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{
            borderTopColor: '#FF6600',
            borderRightColor: 'rgba(255,102,0,0.3)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, ease: 'linear', repeat: Infinity }}
        />
        {/* Inner glow dot */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity }}
        >
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: 'linear-gradient(135deg,#FF6600,#FFB700)', boxShadow: '0 0 10px rgba(255,102,0,0.8)' }}
          />
        </motion.div>
        {/* Glow ring behind */}
        <motion.div
          className="absolute inset-[-4px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle,#FF6600,transparent 70%)' }}
          animate={{ opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity }}
        />
      </div>

      {/* Label */}
      <motion.p
        className="text-sm text-[#444] font-medium tracking-widest uppercase"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity }}
      >
        {label}
      </motion.p>
    </div>
  );
}

/**
 * CardGridLoader — compact spinner for inside card grid containers.
 * Used as drop-in for the old per-card skeleton arrays.
 */
export function CardGridLoader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="col-span-full">
      <PageLoader label={label} />
    </div>
  );
}

/**
 * InlineLoader — tiny inline spinner (e.g. inside a match list).
 */
export function InlineLoader() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-[#1E1E1E]" />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{ borderTopColor: '#FF6600' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.85, ease: 'linear', repeat: Infinity }}
        />
      </div>
    </div>
  );
}
