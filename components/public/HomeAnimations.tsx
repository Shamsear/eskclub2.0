'use client';

import { motion } from 'framer-motion';

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Stagger-animates hero content (badge, h1, subtitle, CTAs, stats) */
export function HeroContent({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08, delayChildren: 0 } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function HeroItem({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

/** Animates a single stat pill on scroll-enter */
export function StatPill({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3, margin: "0px 0px -100px 0px" }}
      transition={{ duration: 0.4, delay: index * 0.05, ease }}
    >
      {children}
    </motion.div>
  );
}

/** Animates a feature card on scroll-enter */
export function FeatureCardWrapper({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -50px 0px" }}
      transition={{ duration: 0.4, delay: index * 0.05, ease }}
    >
      {children}
    </motion.div>
  );
}

/** Animates the live stats band numbers on scroll-enter */
export function StatBandItem({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3, margin: "0px 0px -100px 0px" }}
      transition={{ duration: 0.4, delay: index * 0.06, ease }}
      className="text-center group"
    >
      {children}
    </motion.div>
  );
}

/** Section wrapper — slides up when it enters the viewport */
export function SectionReveal({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -50px 0px" }}
      transition={{ duration: 0.5, ease }}
    >
      {children}
    </motion.div>
  );
}
