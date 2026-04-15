'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Key, ShieldCheck, Gavel, Zap } from 'lucide-react';

const features = [
  {
    id: 'gasless',
    icon: <Key size={18} className="text-blue-500" />,
    title: 'Gasless staking via Mezo Passport',
    items: ['Create Mandate', 'Sign Once', 'Stake with Zero Gas', 'Auto-renew Limits', 'Revoke Anytime'],
    colors: ['#00C2A8', '#F7931A', '#3b82f6', '#a855f7', '#ef4444'],
  },
  {
    id: 'yield',
    icon: <ShieldCheck size={18} className="text-teal-500" />,
    title: 'Zero Risk Yield Staking',
    preview: 'market',
  },
  {
    id: 'resolver',
    icon: <Gavel size={18} className="text-orange-500" />,
    title: 'Trusted Resolution',
    preview: 'market',
  },
  {
    id: 'feed',
    icon: <Zap size={18} className="text-yellow-500" />,
    title: 'Real-time Stake Feed',
    preview: 'ping',
  },
];

function PaymentMethodList({ items, colors }: { items: string[]; colors: string[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
      {items.map((item, i) => (
        <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#666' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors[i] ?? '#ccc', flexShrink: 0 }} />
          {item}
        </div>
      ))}
    </div>
  );
}

function MarketPreviewMini() {
  return (
    <div
      style={{
        background: 'white',
        border: '1px solid rgba(0,0,0,0.07)',
        borderRadius: 10,
        padding: '12px',
        marginTop: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ fontSize: 9, color: '#bbb', letterSpacing: '0.05em', marginBottom: 8 }}>PREDICTION MARKET</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #F7931A, #f59e0b)' }} />
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#111' }}>BTC &gt; $80k Target</div>
          <div style={{ fontSize: 9, color: '#aaa' }}>Closes: April 30, 2026</div>
        </div>
      </div>
      <div style={{ height: 1, background: '#f0f0f0', margin: '6px 0' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#333' }}>
        <span>Total Pool</span>
        <span style={{ fontWeight: 700 }}>14,200 MUSD</span>
      </div>
      <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>
        <div style={{ width: '60%', height: 4, borderRadius: 2, background: '#F7931A' }} />
        <div style={{ width: '40%', height: 4, borderRadius: 2, background: '#00C2A8' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#bbb', marginTop: 4 }}>
        <span>60% YES</span>
        <span>40% NO</span>
      </div>
      <motion.button
        whileHover={{ scale: 1.03 }}
        style={{
          marginTop: 8,
          width: '100%',
          background: '#0a0a0a',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          padding: '6px 0',
          fontSize: 10,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        Stake via Passport
      </motion.button>
    </div>
  );
}

function PingNotification() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 1, duration: 0.5, type: 'spring' }}
      style={{
        background: '#dcfce7',
        border: '1px solid #86efac',
        borderRadius: 10,
        padding: '10px 12px',
        marginTop: 12,
        fontSize: 11,
        color: '#166534',
        fontWeight: 500,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6 }}><Zap size={14} /> Stake placed!</div>
      <div>Maya backed YES with 500 MUSD on BTC &gt; $80k...</div>
    </motion.div>
  );
}

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });

  return (
    <section
      ref={ref}
      className="py-24 px-6"
      style={{ background: '#f0f0ef' }}
    >
      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as any }}
        style={{
          textAlign: 'center',
          fontSize: 'clamp(24px, 3.5vw, 40px)',
          fontWeight: 800,
          letterSpacing: '-0.04em',
          color: '#0a0a0a',
          marginBottom: 40,
          maxWidth: 500,
          margin: '0 auto 40px',
        }}
      >
        What makes for the world&apos;s best prediction market?
      </motion.h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 14,
          maxWidth: 960,
          margin: '0 auto',
        }}
      >
        {features.map((feat, i) => (
          <motion.div
            key={feat.id}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.08, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as any }}
            whileHover={{ y: -4 }}
            style={{
              background: 'white',
              borderRadius: 16,
              padding: '18px 16px',
              border: '1px solid rgba(0,0,0,0.07)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              minHeight: 240,
            }}
          >
            <div style={{ marginBottom: 12 }}>
              {feat.icon}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0a0a0a', lineHeight: 1.3, marginBottom: 4 }}>
              {feat.title}
            </div>

            {feat.items && feat.colors && (
              <PaymentMethodList items={feat.items} colors={feat.colors} />
            )}
            {feat.preview === 'market' && <MarketPreviewMini />}
            {feat.preview === 'ping' && <PingNotification />}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.5, duration: 0.5 }}
        style={{ textAlign: 'center', marginTop: 36 }}
      >
        <motion.a
          href="#"
          whileHover={{ scale: 1.05, boxShadow: '0 8px 32px rgba(0,0,0,0.24)' }}
          whileTap={{ scale: 0.97 }}
          className="btn-primary"
          style={{ textDecoration: 'none' }}
        >
          View the code
        </motion.a>
      </motion.div>
    </section>
  );
}
