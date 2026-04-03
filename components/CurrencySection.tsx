'use client';

import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

function UnderlineWord({ children }: { children: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    if (inView) {
      const t = setTimeout(() => setDrawn(true), 200);
      return () => clearTimeout(t);
    }
  }, [inView]);

  return (
    <span
      ref={ref}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      {children}
      <motion.span
        initial={{ scaleX: 0 }}
        animate={drawn ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: 'absolute',
          bottom: -6,
          left: 0,
          right: 0,
          height: 5,
          background: '#00C2A8',
          borderRadius: 3,
          transformOrigin: 'left center',
          display: 'block',
        }}
      />
    </span>
  );
}

const marqueeItems = [
  'Backed YES with 50 MUSD 📈',
  'Claimed 100 MUSD Yield 💰',
  'Resolved Market: BTC > 70k ✅',
  'Yield auto-accrued (+1.2 MUSD) 🛡️',
  'Ranked #1 on Leaderboard 🏆',
  'Backed NO with 25 MUSD 📉',
  'Passport mandate approved 🔑',
  'Prize pool distributed 💸',
  'Win rate increased to 80% 🔥',
];

export function CurrencySection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-8%' });
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const mapY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section
      ref={ref}
      className="relative"
      style={{ background: '#f0f0ef', overflow: 'hidden' }}
    >
      {/* Currency headline */}
      <div className="text-center" style={{ padding: '80px 24px' }}>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            fontSize: 'clamp(28px, 4.5vw, 52px)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.1,
            color: '#0a0a0a',
            maxWidth: 700,
            margin: '0 auto',
          }}
        >
          Zero Risk, Full Stake...{' '}
          <br />
          we <UnderlineWord>do it all</UnderlineWord> and we{' '}
          <UnderlineWord>do it gasless.</UnderlineWord>
        </motion.h2>
      </div>
    </section>
  );
}
