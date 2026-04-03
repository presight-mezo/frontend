'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';

/* ─── Floating Object Components ─────────────────────────────── */

function NotePad() {
  return (
    <div style={{ position: 'relative', width: 88, height: 110 }}>
      {/* shadow */}
      <div style={{ position: 'absolute', bottom: -6, left: 4, right: 4, height: 12, background: 'rgba(0,0,0,0.15)', filter: 'blur(8px)', borderRadius: '50%' }} />
      {/* pages stack */}
      <div style={{ position: 'absolute', inset: 0, background: '#fff', borderRadius: 6, border: '1px solid #e0e0e0', transform: 'rotate(3deg)' }} />
      <div style={{ position: 'absolute', inset: 0, background: '#fff', borderRadius: 6, border: '1px solid #e0e0e0', transform: 'rotate(1deg)' }} />
      {/* main cover */}
      <div style={{
        position: 'absolute', inset: 0, background: 'linear-gradient(145deg, #8B4513 0%, #6B3410 100%)',
        borderRadius: 6, boxShadow: '2px 4px 12px rgba(0,0,0,0.25)',
        display: 'flex', flexDirection: 'column', padding: '10px 8px', gap: 4,
      }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ height: 2, background: 'rgba(255,255,255,0.15)', borderRadius: 1 }} />
        ))}
        {/* Pencil */}
        <div style={{
          position: 'absolute', top: -18, right: 12,
          width: 6, height: 60, borderRadius: '2px 2px 0 0',
          background: 'linear-gradient(to bottom, #f5c842 0%, #f5c842 80%, #ffa07a 80%, #ffa07a 90%, #888 90%, #888 100%)',
          transform: 'rotate(15deg)',
          boxShadow: '1px 1px 4px rgba(0,0,0,0.2)',
        }} />
      </div>
    </div>
  );
}

function CryptoToken({ color1, color2, symbol, size = 72 }: { color1: string; color2: string; symbol: string; size?: number }) {
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <div style={{ position: 'absolute', bottom: -4, left: '10%', right: '10%', height: 10, background: 'rgba(0,0,0,0.12)', filter: 'blur(6px)', borderRadius: '50%' }} />
      <svg width={size} height={size} viewBox="0 0 72 72">
        <defs>
          <radialGradient id={`tg${symbol}`} cx="38%" cy="28%" r="65%">
            <stop offset="0%" stopColor={color1} />
            <stop offset="100%" stopColor={color2} />
          </radialGradient>
          <radialGradient id={`tgl${symbol}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        <circle cx="36" cy="36" r="34" fill={`url(#tg${symbol})`} />
        <circle cx="36" cy="36" r="28" fill={`url(#tgl${symbol})`} opacity="0.6" />
        <text x="36" y="43" textAnchor="middle" fontSize="20" fontWeight="bold" fill="rgba(255,255,255,0.95)">{symbol}</text>
      </svg>
    </div>
  );
}

function DollarBills() {
  return (
    <div style={{ position: 'relative', width: 120, height: 72 }}>
      <div style={{ position: 'absolute', bottom: -4, left: '5%', right: '5%', height: 8, background: 'rgba(0,0,0,0.10)', filter: 'blur(6px)', borderRadius: '50%' }} />
      {/* Stacked bills */}
      {[12, 6, 0].map((rot, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: i * 3,
          left: i * 2,
          width: 114,
          height: 56,
          background: 'linear-gradient(135deg, #6aaf5c 0%, #3a8a2d 50%, #4e9e40 100%)',
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          transform: `rotate(${rot - 6}deg)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: '80%', height: '70%',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>$100</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function InvoiceFloat() {
  return (
    <div style={{
      width: 160,
      background: 'white',
      borderRadius: 10,
      padding: '12px 14px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
      border: '1px solid rgba(0,0,0,0.06)',
    }}>
      <div style={{ fontSize: 8, color: '#bbb', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 8 }}>INVOICE · INV-093</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)' }} />
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#111' }}>Marble Studio</div>
          <div style={{ fontSize: 9, color: '#aaa' }}>billing@marble.studio</div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#555' }}>
          <span>Development</span>
          <span style={{ fontWeight: 700 }}>$15,000</span>
        </div>
      </div>
      <div style={{ marginTop: 6, height: 4, borderRadius: 2, background: '#dcfce7' }}>
        <div style={{ width: '65%', height: '100%', borderRadius: 2, background: '#22c55e' }} />
      </div>
    </div>
  );
}

function PaymentCard() {
  return (
    <div style={{
      width: 148,
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      borderRadius: 12,
      padding: '14px 14px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
      color: 'white',
    }}>
      <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', marginBottom: 6 }}>PAYMENT OPTIONS</div>
      {[
        { label: 'Full Stake', icon: '🔥', sub: 'MUSD' },
        { label: 'Zero Risk', icon: '🛡️', sub: 'Yield' },
        { label: 'Passport', icon: '🔑', sub: 'Gasless' },
      ].map((item) => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 10 }}>{item.icon}</span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)' }}>{item.label}</span>
          </div>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>{item.sub}</span>
        </div>
      ))}
    </div>
  );
}

function NotificationBubble() {
  return (
    <div style={{
      width: 200,
      background: 'white',
      borderRadius: 12,
      padding: '10px 12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      border: '1px solid rgba(0,0,0,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #f97316, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 12 }}>👤</span>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#111' }}>Christian K.</div>
          <div style={{ fontSize: 9, color: '#888' }}>billing</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
        </div>
      </div>
      <div style={{ fontSize: 10, color: '#555', lineHeight: 1.4 }}>
        Hey squad, I just claimed my winnings. Wow, that was cool! 🎉
      </div>
      <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#00C2A8' }} />
        <span style={{ fontSize: 9, color: '#00C2A8', fontWeight: 600 }}>MUSD · Mezo</span>
      </div>
    </div>
  );
}

function AppPreviewStrip() {
  const cards = [
    { bg: '#f0f7ff', title: 'Backed YES', sub: '500 MUSD', color: '#3b82f6' },
    { bg: '#f0fff4', title: 'Zero Risk', sub: 'Yield Staking', color: '#22c55e' },
    { bg: '#fdf4ff', title: 'Win Rate', sub: '80% Streak', color: '#a855f7' },
    { bg: '#fff7f0', title: 'Conviction', sub: 'Score +145', color: '#f97316' },
    { bg: '#f0f7ff', title: 'Market Won', sub: '+8,400 MUSD', color: '#3b82f6' },
  ];

  return (
    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', overflow: 'hidden', maxWidth: 780, margin: '0 auto' }}>
      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ x: 60, y: 60, opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: 1 }}
          transition={{ delay: 1.0 + i * 0.08, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            flex: '0 0 140px',
            background: card.bg,
            borderRadius: 14,
            padding: '16px 14px',
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
          }}
        >
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: card.color, marginBottom: 10, opacity: 0.15 }} />
          <div style={{ fontSize: 12, fontWeight: 700, color: '#111', marginBottom: 3 }}>{card.title}</div>
          <div style={{ fontSize: 10, color: '#888' }}>{card.sub}</div>
        </motion.div>
      ))}
    </div>
  );
}

const companyLogos = ['Mezo Testnet', 'Bitcoin', 'Zero Risk', 'Full Stake', 'Gasless', 'Yield'];

/* ─── LEFT side floating objects ─────────────────────────────── */
const leftObjects = [
  { id: 'notepad', top: '4%', el: <NotePad />, anim: 'float-1', rotate: '-8deg' },
  { id: 'bnb', top: '32%', el: <CryptoToken color1="#f5c842" color2="#d4a017" symbol="₿" size={64} />, anim: 'float-3', rotate: '-6deg' },
  { id: 'inv', top: '58%', el: <InvoiceFloat />, anim: 'float-2', rotate: '3deg' },
  { id: 'tron', top: '82%', el: <CryptoToken color1="#e84142" color2="#b01d1e" symbol="T" size={56} />, anim: 'float-4', rotate: '10deg' },
];

/* ─── RIGHT side floating objects ────────────────────────────── */
const rightObjects = [
  { id: 'eth', top: '6%', el: <CryptoToken color1="#a18fff" color2="#6244d9" symbol="Ξ" size={68} />, anim: 'float-2', rotate: '10deg' },
  { id: 'bills', top: '26%', el: <DollarBills />, anim: 'float-1', rotate: '-5deg' },
  { id: 'card', top: '52%', el: <PaymentCard />, anim: 'float-5', rotate: '4deg' },
  { id: 'usdc', top: '74%', el: <CryptoToken color1="#2775ca" color2="#1557a0" symbol="$" size={52} />, anim: 'float-3', rotate: '-8deg' },
  { id: 'notif', top: '86%', el: <NotificationBubble />, anim: 'float-4', rotate: '-3deg' },
];

import { useBubbleTransition } from './TransitionLink';

/* ─── Hero ────────────────────────────────────────────────────── */
export function HeroSection() {
  const { morphTo } = useBubbleTransition();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  // Vertical parallax
  const yLeft = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const yRight = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const yCenter = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacityContent = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Horizontal parallax moving outwards
  const xLeft = useTransform(scrollYProgress, [0, 1], [0, -250]);
  const xRight = useTransform(scrollYProgress, [0, 1], [0, 250]);

  // Hero text parallax moving downwards slighly faster than center
  const yText = useTransform(scrollYProgress, [0, 1], [0, 150]);

  // Strip parallax moving upwards quickly
  const yStrip = useTransform(scrollYProgress, [0, 1], [0, -600]);

  return (
    <section
      ref={ref}
      style={{
        position: 'relative',
        minHeight: '100svh',
        background: '#f0f0ef',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── LEFT COLUMN ─────────────────────────────────── */}
      <motion.div
        style={{ y: yLeft, x: xLeft, position: 'absolute', left: '-24px', top: 0, bottom: 0, width: '22%', pointerEvents: 'none' }}
      >
        {leftObjects.map((obj) => (
          <div
            key={obj.id}
            className={obj.anim}
            style={{
              position: 'absolute',
              top: obj.top,
              left: 20,
              transform: `rotate(${obj.rotate})`,
              ['--rotate' as string]: obj.rotate,
              filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.12))',
            }}
          >
            {obj.el}
          </div>
        ))}
      </motion.div>

      {/* ── RIGHT COLUMN ────────────────────────────────── */}
      <motion.div
        style={{ y: yRight, x: xRight, position: 'absolute', right: '-24px', top: 0, bottom: 0, width: '24%', pointerEvents: 'none' }}
      >
        {rightObjects.map((obj) => (
          <div
            key={obj.id}
            className={obj.anim}
            style={{
              position: 'absolute',
              top: obj.top,
              right: 20,
              transform: `rotate(${obj.rotate})`,
              ['--rotate' as string]: obj.rotate,
              filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.12))',
            }}
          >
            {obj.el}
          </div>
        ))}
      </motion.div>

      {/* ── CENTER CONTENT ──────────────────────────────── */}
      <motion.div
        style={{ y: yCenter, opacity: opacityContent, flex: 1 }}
        className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-24 pb-12"
      >
        {/* Stacked social proof toasts */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ position: 'relative', marginBottom: 32, height: 130, width: '100%', maxWidth: 360, marginInline: 'auto' }}
        >
          {[
            {
              id: 1,
              name: 'Damini Ogulu', flag: '🇳🇬', text: '', time: '',
              avatarBg: '#dbeafe', emoji: '👲🏽',
              top: 0, left: '56%', rotate: '-6deg', zIndex: 1, width: 220
            },
            {
              id: 2,
              name: 'Sidi Mansour', flag: '🇦🇪', text: 'Staking 100 MUSD of yield', time: '',
              avatarBg: '#fce7f3', emoji: '👳🏽‍♂️',
              top: 36, left: '46%', rotate: '-3deg', zIndex: 2, width: 260
            },
            {
              id: 3,
              name: 'Simone Perele', flag: '🇺🇸', text: 'Backed YES on BTC closing > $70k', time: 'now',
              avatarBg: '#fef3c7', emoji: '👩🏽',
              top: 76, left: '50%', rotate: '2deg', zIndex: 3, width: 340
            }
          ].map(t => (
            <div
              key={t.id}
              style={{
                position: 'absolute', top: t.top, left: t.left,
                transform: `translateX(-50%) rotate(${t.rotate})`, zIndex: t.zIndex,
                width: t.width, background: '#ffffff',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.05)', borderRadius: 16,
                padding: '8px 14px', display: 'flex', gap: 12, alignItems: 'center'
              }}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: t.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  {t.emoji}
                </div>
              </div>
              <div style={{ flex: 1, textAlign: 'left', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: t.text ? 4 : 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>
                    {t.name}
                  </div>
                  {t.time && <span style={{ fontSize: 11, color: '#999', fontWeight: 500 }}>{t.time}</span>}
                </div>
                {t.text && (
                  <div style={{ fontSize: 13, color: '#444', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>
                    {t.text}
                  </div>
                )}
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div style={{ y: yText, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              fontSize: 'clamp(48px, 7vw, 78px)',
              fontWeight: 800,
              letterSpacing: '-0.045em',
              lineHeight: 1.05,
              color: '#0a0a0a',
              marginBottom: 18,
              maxWidth: 620,
            }}
          >
            Social-first<br />prediction markets.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.54, duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ fontSize: 16, color: '#666', marginBottom: 26, lineHeight: 1.55, maxWidth: 380 }}
          >
            Feels like a group chat with financial stakes.<br />Staking exclusively in MUSD on Mezo.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.66, duration: 0.5 }}
          >
            <Link 
              href="/app/dashboard" 
              passHref 
              legacyBehavior
            >
              <motion.a
                onClick={(e: any) => morphTo(e, '/app/dashboard', '#0a0a0a')}
                whileHover={{ scale: 1.05, boxShadow: '0 8px 32px rgba(0,0,0,0.28)' }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#0a0a0a',
                  color: 'white',
                  borderRadius: 100,
                  padding: '14px 28px',
                  fontSize: 15,
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  textDecoration: 'none',
                }}
              >
                Let's get started
              </motion.a>
            </Link>
          </motion.div>

          {/* Social proof count */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85, duration: 0.6 }}
            style={{ marginTop: 22, fontSize: 13, color: '#999', letterSpacing: '-0.01em' }}
          >
            Built for the Mezo Hackathon · Chain ID 31611
          </motion.div>
          {/* Company logos */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            style={{
              marginTop: 18,
              width: '100%',
              maxWidth: 900,
              overflow: 'hidden',
              maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
            }}
          >
            <div className="marquee-track" style={{ gap: 48, alignItems: 'center', animationDuration: '25s' }}>
              {[...companyLogos, ...companyLogos, ...companyLogos, ...companyLogos].map((logo, i) => (
                <span
                  key={`${logo}-${i}`}
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'rgba(0,0,0,0.7)',
                    letterSpacing: '-0.01em',
                    textTransform: 'uppercase' as const,
                    userSelect: 'none' as const,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {logo}
                </span>
              ))}
            </div>
          </motion.div>

        </motion.div>

        {/* App preview strip */}
        <motion.div style={{ y: yStrip, marginTop: 40, width: '100%', maxWidth: 780 }}>
          <AppPreviewStrip />
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 100,
          background: 'linear-gradient(to bottom, transparent, #f0f0ef)',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      />
      {/* Thin line with small width separator */}
      <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 60, height: 1, background: 'rgba(0,0,0,0.15)' }} />
    </section>
  );
}
