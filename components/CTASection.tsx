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
  { id: 'f6', type: 'usdc', bottom: '10%', right: '15%', rotate: -10, delay: 0.6 },
];

function FloatingIcon({ type }: { type: string }) {
  if (type === 'usdc') {
    return (
      <img src="/255f26d8-2fc5-4467-ad3d-66162077432a.png" alt="USDC" className="w-32 h-32 object-contain drop-shadow-2xl" />
    );
  }
  if (type === 'eth') {
    return (
      <img src="/34a7a0c6-edfd-4eb7-870a-272b0ab91e8a.png" alt="ETH" className="w-28 h-28 object-contain drop-shadow-2xl" />
    );
  }
  if (type === 'tether') {
    return (
      <img src="/0e18aa64-f55b-4a9f-aa47-2c7350e95110.png" alt="Tron" className="w-32 h-32 object-contain drop-shadow-2xl" />
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
      <img src="/986e7952-91f0-49c7-a6e1-32d9c46714be.png" alt="BNB" className="w-28 h-28 object-contain drop-shadow-2xl" />
    );
  }
  return null;
}

import { useBubbleTransition } from './TransitionLink';
import { useGetStartedUrl } from '@/hooks/useGetStartedUrl';

export function CTASection() {
  const { morphTo } = useBubbleTransition();
  const getStartedUrl = useGetStartedUrl();
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
              href={getStartedUrl} 
              onClick={(e: any) => morphTo(e, getStartedUrl, '#0a0a0a')}
              style={{ textDecoration: 'none' }}
              className="inline-flex group"
            >
              <motion.div
                whileHover={{ scale: 1.035, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
                whileTap={{ scale: 0.97 }}
                className="relative overflow-hidden inline-flex items-center gap-2 rounded-full px-9 py-4 text-[17px] font-bold tracking-tight bg-white text-[#0a0a0a] shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-all duration-300 border border-white/20"
              >
                <span className="absolute inset-0 bg-[#0a0a0a] pointer-events-none -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]" />
                <span className="relative z-10 transition-colors duration-500 group-hover:text-white flex items-center gap-2">
                  {getStartedUrl === '/app/dashboard' ? 'Continue predicting' : 'Start predicting'}
                </span>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
