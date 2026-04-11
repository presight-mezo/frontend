'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

function InvoicePreview() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });

  return (
    <motion.div
      ref={ref}
      initial={{ scale: 0, rotate: '-12deg', opacity: 0 }}
      animate={inView ? { scale: 1, rotate: '-6deg', opacity: 1 } : {}}
      transition={{ delay: 1.0, duration: 0.5, type: 'spring', stiffness: 350, damping: 20 }}
      whileHover={{ scale: 1.05, rotate: '-2deg' }}
      style={{
        margin: '0 auto',
        background: 'linear-gradient(135deg, #00C2A8, #16a34a)',
        color: 'white',
        borderRadius: 8,
        padding: '16px 20px',
        width: 180,
        boxShadow: '0 6px 24px rgba(0,0,0,0.2)',
        fontFamily: 'var(--font-caveat), cursive',
        transform: 'rotate(-6deg)',
        zIndex: 10,
        pointerEvents: 'auto',
      }}
    >
      <div style={{ fontSize: 18, lineHeight: 1.3, fontWeight: 600 }}>
        Yield accruing<br />
        <span style={{ fontSize: 22 }}>0.42 MUSD ↑</span>
      </div>
      <div style={{ fontSize: 18, marginTop: 4, fontWeight: 700 }}>Principal Safe! ♥</div>
    </motion.div>
  );
}

function PricingCard({
  title,
  price,
  priceStyle,
  suffix,
  buttonLabel,
  usageItems,
  featureItems,
  delay = 0,
  variant = 'green',
}: {
  title: string;
  price: string;
  priceStyle?: 'handwritten' | 'normal';
  suffix?: string;
  buttonLabel: string;
  usageItems: string[];
  featureItems: string[];
  delay?: number;
  variant?: 'green' | 'blue';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });

  const isGreen = variant === 'green';
  const bgColor = isGreen ? '#e8ede4' : '#dce8f5';
  const gridColor = isGreen ? 'rgba(100,120,80,0.15)' : 'rgba(60,100,160,0.12)';
  const pinBg = isGreen ? '#0a0a0a' : '#f97316';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isGreen ? -30 : 30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: delay + 0.3, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as any }}
      whileHover={{ y: -4, boxShadow: '0 16px 48px rgba(0,0,0,0.12)' }}
      style={{
        background: bgColor,
        borderRadius: 18,
        position: 'relative',
        flex: 1,
        border: '1px solid rgba(0,0,0,0.07)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
        display: 'flex',
        flexDirection: isGreen ? 'column' : 'column-reverse',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '52px 20px',
        gap: 24,
        overflow: 'hidden',
      }}
    >
      {/* Map grid lines */}
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <defs>
          <pattern id={`grid-price-${variant}`} width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke={gridColor} strokeWidth="0.8"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-price-${variant})`}/>
      </svg>

      {/* Gradient Fade at bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40%',
          background: `linear-gradient(to bottom, rgba(255,255,255,0) 0%, ${bgColor} 100%)`,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Clipper decoration (only for green) */}
      {isGreen && (
        <div style={{ position: 'absolute', top: 12, right: 12, opacity: 0.3, pointerEvents: 'none' }}>
          <svg width="24" height="54" viewBox="0 0 24 54" fill="none">
            <path d="M12 2 C6 2 3 8 3 14 L3 40 C3 47 7 51 12 51 C17 51 21 47 21 40 L21 16 C21 10 17 7 12 7 C7 7 5 11 5 16 L5 39 C5 44 8 47 12 47" stroke="#555" strokeWidth="2" strokeLinecap="round" fill="none"/>
          </svg>
        </div>
      )}

      {/* Decorative dot on the board */}
      <div style={{ 
        width: 28, 
        height: 28, 
        borderRadius: '50%', 
        background: isGreen ? '#22c55e' : '#3b82f6', 
        opacity: 0.15,
        flexShrink: 0,
        position: 'relative',
        zIndex: 5
      }} />


      {/* The White Pricing Card Content */}
      <div
        style={{
          background: 'white',
          borderRadius: 16,
          padding: '24px 24px',
          width: '100%',
          boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
          position: 'relative',
          zIndex: 10,
          textAlign: 'left'
        }}
      >
        <div style={{ fontSize: 11, color: '#888', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 8 }}>
          {title}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 18 }}>
          <span
            style={{
              fontSize: 34,
              fontWeight: 800,
              letterSpacing: '-0.04em',
              color: '#0a0a0a',
            }}
          >
            {price}
          </span>
          {priceStyle === 'handwritten' && (
            <span
              style={{
                fontFamily: 'var(--font-caveat), cursive',
                fontSize: 24,
                color: '#00C2A8',
                fontWeight: 700,
              }}
            >
              safe!
            </span>
          )}
          {suffix && (
            <span style={{ fontSize: 16, color: '#888', fontWeight: 500 }}>{suffix}</span>
          )}
        </div>

        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#0a0a0a',
            marginBottom: 22,
            letterSpacing: '-0.02em',
          }}
        >
          {buttonLabel}
        </div>

        {/* Usage */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0a0a0a', marginBottom: 8 }}>Usage</div>
          {usageItems.map((item) => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ color: '#22c55e', fontSize: 13, fontWeight: 700 }}>✓</span>
              <span style={{ fontSize: 13, color: '#444' }}>{item}</span>
            </div>
          ))}
        </div>

        {/* Features */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0a0a0a', marginBottom: 8 }}>Features</div>
          {featureItems.map((item) => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ color: '#22c55e', fontSize: 13, fontWeight: 700 }}>✓</span>
              <span style={{ fontSize: 13, color: '#444' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function PricingSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });

  return (
    <section
      ref={ref}
      className="relative py-24 px-6"
      style={{ background: '#f0f0ef' }}
    >
      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as any }}
        style={{
          textAlign: 'center',
          fontSize: 'clamp(28px, 4vw, 42px)',
          fontWeight: 800,
          letterSpacing: '-0.04em',
          color: '#0a0a0a',
          marginBottom: 40,
        }}
      >
        Choose how you want to play
      </motion.h2>

      <div
        style={{
          display: 'flex',
          gap: 40,
          maxWidth: 840,
          margin: '0 auto',
          position: 'relative'
        }}
      >
        <PricingCard
          title="Mode 1"
          price="Zero Risk"
          priceStyle="handwritten"
          buttonLabel="Stake Yield"
          usageItems={['Principal never at risk']}
          featureItems={[
            'Earn from Mezo Testnet',
            'Auto-accrues every block',
            'Back markets risk-free',
          ]}
          delay={0}
          variant="green"
        />
        <PricingCard
          title="Mode 2"
          price="Full Stake"
          suffix=""
          buttonLabel="Stake MUSD"
          usageItems={['High conviction staking', 'Share in the NO/YES pool']}
          featureItems={['No gas fees with Passport', 'Straight to your wallet on win']}
          delay={0.1}
          variant="blue"
        />

        {/* Floating Green Card between the two pricing cards */}
        <div
          style={{
            position: 'absolute',
            left: '46%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 20,
            pointerEvents: 'none'
          }}
        >
          <InvoicePreview />
        </div>
      </div>
    </section>
  );
}
