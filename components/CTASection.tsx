'use client';

import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';

const floaters = [
  { id: 'f1', type: 'pin', top: '10%', left: '8%', rotate: -15, delay: 0.1 },
  { id: 'f2', type: 'card-left', bottom: '15%', left: '5%', rotate: -6, delay: 0.3 },
  { id: 'f3', type: 'tether', top: '25%', right: '8%', rotate: 15, delay: 0.2 },
  { id: 'f4', type: 'card-right', bottom: '25%', right: '6%', rotate: 8, delay: 0.4 },
  { id: 'f5', type: 'eth', top: '55%', left: '12%', rotate: 20, delay: 0.5 },
  { id: 'f6', type: 'usdc', bottom: '10%', right: '22%', rotate: -10, delay: 0.6 },
];

function FloatingIcon({ type }: { type: string }) {
  if (type === 'usdc') {
    return (
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#2775CA] to-[#1a5a9c] shadow-2xl shadow-blue-500/20 border border-white/40 text-white font-bold text-2xl">
        $
      </div>
    );
  }
  if (type === 'eth') {
    return (
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[#627EEA] to-[#4a5fb4] shadow-2xl shadow-indigo-500/20 border border-white/40 text-white">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.999 0L11.83 0.57V16.336L11.999 16.505L19.5 12.072L11.999 0Z" fill="white" opacity="0.8"/>
          <path d="M12.001 0L4.5 12.072L12.001 16.505V9.458V0Z" fill="white"/>
          <path d="M11.999 17.818L11.866 17.98V23.778L11.999 24L19.505 13.386L11.999 17.818Z" fill="white" opacity="0.8"/>
          <path d="M12.001 24V17.818L4.50494 13.386L12.001 24Z" fill="white"/>
        </svg>
      </div>
    );
  }
  if (type === 'tether') {
    return (
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#26A17B] to-[#1c785b] shadow-2xl shadow-emerald-500/20 border border-white/40 text-white font-bold text-2xl">
        ₮
      </div>
    );
  }
  if (type === 'card-left') {
    return (
      <div className="bg-white p-4 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 flex items-center gap-3 w-48">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#2775CA] font-bold text-[10px]">USDC</div>
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-2 w-full bg-gray-200 rounded-full"></div>
          <div className="h-2 w-2/3 bg-gray-100 rounded-full"></div>
        </div>
      </div>
    );
  }
  if (type === 'card-right') {
    return (
      <div className="bg-white p-4 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 flex items-center gap-3 w-48">
        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 font-bold text-xl">₿</div>
        <div className="flex flex-col gap-2 flex-1">
           <div className="h-2 w-5/6 bg-gray-200 rounded-full"></div>
           <div className="h-2 w-1/2 bg-gray-100 rounded-full"></div>
        </div>
      </div>
    );
  }
  if (type === 'pin') {
    return (
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#FF4C4C] to-[#C90000] shadow-2xl shadow-red-500/20 text-white border border-white/40">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11V5H18V3H6V5H8V11L6 14V16H11V22H13V16H18V14L16 11Z"/></svg>
      </div>
    );
  }
  return null;
}

import { useBubbleTransition } from './TransitionLink';

export function CTASection() {
  const { morphTo } = useBubbleTransition();
  const ref = useRef<HTMLDivElement>(null);
  // Set once: false so the icons "pop out" (disappear) when you scroll away, 
  // and trigger again when scrolled back into view
  const inView = useInView(ref, { once: false, margin: '-10%' });
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const scale = useTransform(scrollYProgress, [0, 0.6], [0.85, 1]);

  return (
    <section
      ref={ref}
      className="relative px-6 py-16 lg:py-24 overflow-hidden"
      style={{ background: '#f0f0ef' }}
    >
      {/* Floating Background Elements */}
      {floaters.map((item) => (
        <motion.div
          key={item.id}
          // Changed y from 40 to 150 so they literally pop UP from below when scrolling
          initial={{ opacity: 0, scale: 0.2, y: 150, rotate: item.rotate - 30 }}
          animate={inView ? { opacity: 1, scale: 1, y: 0, rotate: item.rotate } : {}}
          transition={{
            type: 'spring',
            stiffness: 150,
            damping: 12,
            delay: 0.1 + item.delay
          }}
          className="absolute hidden md:flex pointer-events-none z-10"
          style={{
            top: item.top,
            bottom: item.bottom,
            left: item.left,
            right: item.right,
          }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: item.delay }}
          >
            <FloatingIcon type={item.type} />
          </motion.div>
        </motion.div>
      ))}

      <motion.div
        style={{ scale }}
        className="relative overflow-hidden z-20"
      >
        <div
          style={{
            borderRadius: 24,
            background: 'linear-gradient(160deg, #0c1e3d 0%, #0a0a0a 50%, #1a1a2e 100%)',
            padding: '80px 48px',
            maxWidth: 900,
            margin: '0 auto',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Stars/dots decoration */}
          {Array.from({ length: 28 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.22 }}
              style={{
                position: 'absolute',
                width: i % 5 === 0 ? 3 : 2,
                height: i % 5 === 0 ? 3 : 2,
                borderRadius: '50%',
                background: 'white',
                top: `${10 + (i * 73 + 31) % 80}%`,
                left: `${5 + (i * 47 + 19) % 90}%`,
                pointerEvents: 'none',
              }}
            />
          ))}

          {/* Letter */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.7 }}
            style={{
              background: 'rgba(255,255,255,0.96)',
              borderRadius: 16,
              padding: '32px 40px',
              maxWidth: 520,
              margin: '0 auto 48px',
              textAlign: 'left',
              boxShadow: '0 12px 48px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{ fontSize: 15, color: '#444', lineHeight: 1.3, marginBottom: 12 }}>
              Dear Users,
            </div>
            <div
              style={{
                fontSize: 14,
                color: '#555',
                lineHeight: 1.7,
              }}
            >
              Prediction markets have always been powerful — but never this fun. Meet Presight. A social space to predict with friends, earn together, and explore endless possibilities.
              <br /><br />
              Simple. Social. Limitless.
            </div>
            <div
              style={{
                fontFamily: 'var(--font-caveat), cursive',
                fontSize: 22,
                marginTop: 16,
                color: '#0a0a0a',
                fontWeight: 700,
              }}
            >
              — The Presight Team
            </div>
          </motion.div>

          {/* CTA text */}
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.7 }}
            style={{
              fontSize: 'clamp(36px, 6vw, 72px)',
              fontWeight: 800,
              letterSpacing: '-0.05em',
              lineHeight: 1.0,
              color: 'white',
              marginBottom: 32,
            }}
          >
            Predict with<br />conviction
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.55, duration: 0.5 }}
          >
            <Link 
              href="/app/onboarding" 
              onClick={(e: any) => morphTo(e, '/app/onboarding', '#0a0a0a')}
              style={{ textDecoration: 'none' }}
              className="inline-flex"
            >
              <motion.div
                whileHover={{ scale: 1.05, background: '#f0f0ef', color: '#0a0a0a' }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#ffffff',
                  color: '#0a0a0a',
                  borderRadius: 100,
                  padding: '16px 36px',
                  fontSize: 17,
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Start predicting
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
