'use client';

import { use, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGroups } from '@/hooks/useApi';
import { useSiweAuth } from '@/hooks/useSiweAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Loader2 } from 'lucide-react';

/* ─── Per-screen accent colours (Limoncello palette) ────────── */
const SCREEN_COLORS = [
  '#F7C948', // Screen 1 — sunflower yellow
  '#4FC3F7', // Screen 2 — sky blue
  '#52A791', // Screen 3 — teal green
  '#F97316', // Screen 4 — amber orange
  '#EF476F', // Screen 5 — strawberry pink
];

/* ─── Floating Tags Background ───────────────────────────────── */
const BG_TAGS = [
  { text: 'FRONTEND', color: 0 },
  { text: 'UX', color: 1 },
  { text: 'VIBE CHECK', color: 2 },
  { text: 'CLEAN CODE', color: 1 },
  { text: 'CREATIVE', color: 0 },
  { text: 'MOTION', color: 2 },
  { text: 'TASTE', color: 2 },
  { text: 'TYPE SYSTEMS', color: 1 },
  { text: 'KEYFRAMES', color: 0 },
  { text: 'BUILDS', color: 1 },
  { text: 'CASE STUDIES', color: 0 },
  { text: 'SCROLL LOVE', color: 2 },
  { text: 'TORONTO CORE', color: 1 },
  { text: 'STUDIO VIBES', color: 0 },
  { text: 'GSAP FANBOY', color: 2 },
  { text: 'NO FILLER', color: 1 },
  { text: 'LIVE SITES', color: 0 },
  { text: 'CANADA MODE', color: 2 },
  { text: 'UI NERD', color: 0 },
  { text: 'QUIETLY BOLD', color: 1 },
  { text: 'SHIPPED', color: 0 },
  { text: 'BITCOIN', color: 2 },
  { text: 'MUSD', color: 1 },
  { text: 'PREDICTIONS', color: 0 },
  { text: 'ZERO RISK', color: 2 },
  { text: 'SOCIAL', color: 1 },
  { text: 'COMMUNITY', color: 0 },
  { text: 'MEZO', color: 2 },
  { text: 'GASLESS', color: 1 },
  { text: 'YIELD', color: 0 },
  { text: 'STAKE', color: 2 },
  { text: 'WALLET', color: 1 },
  { text: 'ON-CHAIN', color: 0 },
  { text: 'MARKETS', color: 2 },
  { text: 'PRESIGHT', color: 1 },
  { text: 'DARK MODE', color: 0 },
  { text: 'WEB3', color: 2 },
];

const TAG_COLORS = [
  { bg: '#f9c8c8', border: 'rgba(139,58,58,0.18)', text: '#8b3a3a' },  // soft pink
  { bg: '#c8d9f9', border: 'rgba(42,74,139,0.18)', text: '#2a4a8b' },  // soft blue
  { bg: '#f9e8c8', border: 'rgba(139,90,42,0.18)', text: '#8b5a2a' },  // soft amber
];

function FloatingTagsBackground({ continueSignal }: { continueSignal: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const speedBoostRef = useRef(false);
  const speedRef = useRef(1);
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) { isFirstMount.current = false; return; }
    speedBoostRef.current = true;
    const t = setTimeout(() => { speedBoostRef.current = false; }, 2200);
    return () => clearTimeout(t);
  }, [continueSignal]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let W = window.innerWidth;
    let H = window.innerHeight;

    type TagObj = { x: number; y: number; vx: number; vy: number; layer: number; el: HTMLSpanElement };

    const tags: TagObj[] = BG_TAGS.map((tag, i) => {
      const el = document.createElement('span');
      const c = TAG_COLORS[tag.color];
      el.textContent = tag.text;
      el.style.cssText = [
        'position:absolute', 'top:0', 'left:0', 'font-size:11px', 'font-weight:700',
        'letter-spacing:0.07em', 'text-transform:uppercase', `background:${c.bg}`, `color:${c.text}`,
        `border:1.5px solid ${c.border}`, 'border-radius:100px', 'padding:5px 13px', 'white-space:nowrap',
        'pointer-events:none', 'user-select:none', 'will-change:transform', 'font-family:inherit',
      ].join(';');
      container.appendChild(el);

      const layer = i % 3;
      const x = Math.random() * W;
      const y = Math.random() * H;
      const baseSpd = 0.06 + layer * 0.035;
      const vx = baseSpd * (0.5 + Math.random() * 0.5);
      const vy = (Math.random() - 0.5) * baseSpd * 0.6;

      return { x, y, vx, vy, layer, el };
    });

    const mouse = { x: W / 2, y: H / 2 };
    const onMouseMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    const onResize = () => { W = window.innerWidth; H = window.innerHeight; };
    window.addEventListener('resize', onResize);

    let rafId: number;
    let prev = performance.now();
    const animate = (now: number) => {
      const dt = Math.min((now - prev) / 16.67, 4);
      prev = now;
      const targetSpeed = speedBoostRef.current ? 3.5 : 1;
      speedRef.current += (targetSpeed - speedRef.current) * 0.04 * dt;
      const s = speedRef.current;
      const cx = mouse.x - W / 2;
      const cy = mouse.y - H / 2;

      tags.forEach(tag => {
        tag.x += tag.vx * dt * s;
        tag.y += tag.vy * dt * s;
        const elW = tag.el.offsetWidth || 90;
        const elH = tag.el.offsetHeight || 28;
        if (tag.x > W + elW) tag.x = -elW;
        if (tag.x < -elW) tag.x = W + elW;
        if (tag.y > H + elH) tag.y = -elH;
        if (tag.y < -elH) tag.y = H + elH;
        const depth = (tag.layer - 1) * 0.018;
        const px = cx * depth;
        const py = cy * depth;
        tag.el.style.transform = `translate3d(${tag.x + px}px,${tag.y + py}px,0)`;
      });
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      tags.forEach(t => t.el.remove());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none',
        zIndex: 0, background: 'white',
      }}
    />
  );
}

function LimonCard({ accent, title, desc, delay = 0 }: { accent: string; title: string; desc?: string; delay?: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 14,
        borderBottom: `1px solid rgba(0,0,0,0.08)`, borderLeft: `4px solid ${accent}`,
        padding: '18px 20px', overflow: 'hidden', cursor: 'default',
        transition: 'background 0.35s cubic-bezier(0.25,0.1,0.25,1)',
        background: hovered ? accent : '#f8f8f7',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.02em', color: '#0a0a0a', marginBottom: desc ? 3 : 0 }}>
          {title}
        </div>
        {desc && <div style={{ fontSize: 13, lineHeight: 1.55, color: hovered ? 'rgba(0,0,0,0.65)' : '#666' }}>{desc}</div>}
      </div>
      <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: '50%', border: `1.5px solid ${hovered ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.18)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#555', alignSelf: 'center', marginLeft: 8 }}>
        ↗
      </div>
    </motion.div>
  );
}

function SlideButton({ onClick, disabled = false, accent, children, delay = 0 }: { onClick?: () => void; disabled?: boolean; accent: string; children: React.ReactNode; delay?: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileTap={disabled ? {} : { scale: 0.97 }}
      style={{
        position: 'relative', overflow: 'hidden', background: disabled ? 'rgba(0,0,0,0.10)' : accent,
        color: disabled ? 'rgba(0,0,0,0.3)' : hovered ? '#fff' : '#0a0a0a',
        border: 'none', borderRadius: 16, padding: '15px 28px', fontSize: 15, fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer', letterSpacing: '-0.01em', width: '100%',
        transition: 'color 0.45s cubic-bezier(0.19,1,0.22,1)',
      }}
    >
      <span style={{ position: 'absolute', inset: 0, background: '#0a0a0a', transform: hovered && !disabled ? 'translateX(0)' : 'translateX(-101%)', transition: 'transform 0.5s cubic-bezier(0.19,1,0.22,1)', pointerEvents: 'none', zIndex: 0 }} />
      <span style={{ position: 'relative', zIndex: 10 }}>{children}</span>
    </motion.button>
  );
}

export default function GroupInvitePage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = use(params);
  const router = useRouter();
  const { token, isAuthenticated } = useSiweAuth();
  const { getGroup, joinGroup } = useGroups(token || undefined);
  const [isJoining, setIsJoining] = useState(false);
  const accent = SCREEN_COLORS[0];

  useEffect(() => {
    getGroup.execute(groupId);
  }, [groupId]);

  const group = getGroup.data;

  const handleJoin = async () => {
    if (!isAuthenticated) {
      const inviter = group?.adminAddress || '';
      const name = group?.name || 'this group';
      router.push(`/app/onboarding?groupId=${groupId}&group=${encodeURIComponent(name)}&inviter=${inviter}`);
      return;
    }

    setIsJoining(true);
    const result = await joinGroup.execute(groupId);
    if (!result.error) {
      router.push(`/app/groups/${groupId}`);
    }
    setIsJoining(false);
  };

  if (getGroup.loading && !group) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-gray-200" />
      </div>
    );
  }

  const values = [
    { title: 'Zero Risk Staking', desc: 'Your Bitcoin principal stays safe. Only the yield is ever at stake.' },
    { title: 'High Conviction', desc: 'Earn more based on the strength of your belief and timing.' },
    { title: 'Smarter Together', desc: 'Private prediction groups for friends, communities, and DAOs.' },
  ];

  return (
    <>
      <FloatingTagsBackground continueSignal={0} />
      <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: 660 }}>
          <div style={{ borderRadius: 24, position: 'relative', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 8px 48px rgba(0,0,0,0.07), 0 2px 12px rgba(0,0,0,0.03)', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px', gap: 16 }}>
            <motion.div animate={{ backgroundColor: accent }} style={{ position: 'absolute', inset: 0, opacity: 0.12, pointerEvents: 'none', zIndex: 0 }} />
            <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.3, color: accent }}>
              <defs><pattern id="grid-invite" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="1" /></pattern></defs>
              <rect width="100%" height="100%" fill="url(#grid-invite)" />
            </svg>
            <div style={{ background: 'white', borderRadius: 20, padding: 'clamp(20px,5vw,36px)', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.04)', position: 'relative', zIndex: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${accent}18`, border: `1px solid ${accent}55`, borderRadius: 100, padding: '6px 14px', alignSelf: 'flex-start' }}>
                   <Users size={14} style={{ color: '#0a0a0a' }} />
                   <span style={{ fontSize: 13, fontWeight: 600, color: '#0a0a0a' }}>{group?.memberCount || 0} Predictors Active</span>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <h1 style={{ fontSize: 'clamp(32px,6vw,48px)', fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1, color: '#0a0a0a', marginBottom: 12 }}>
                    Join {group?.name || 'this group'}
                  </h1>
                  <p style={{ fontSize: 16, color: '#666', lineHeight: 1.6, maxWidth: 600 }}>
                    Welcome to Presight. Predict with your circle, earn MUSD yield, and bring your group chat with you.
                  </p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid rgba(0,0,0,0.08)', overflow: 'hidden', borderRadius: 16 }}>
                  {values.map((v, i) => <LimonCard key={i} accent={accent} title={v.title} desc={v.desc} delay={0.3 + i * 0.07} />)}
                </motion.div>
                <SlideButton onClick={handleJoin} accent={accent} disabled={isJoining} delay={0.5}>
                  {isJoining ? 'Joining...' : isAuthenticated ? 'Join Satoshi Circle →' : 'Join Satoshi Circle →'}
                </SlideButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
