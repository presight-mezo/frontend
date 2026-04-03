'use client';

import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

function TypewriterText({ text, delayStart = 0, style }: { text: string; delayStart?: number, style?: React.CSSProperties }) {
  const letters = Array.from(text);
  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-10%' }}
      variants={{
        visible: { transition: { staggerChildren: 0.05, delayChildren: delayStart } },
        hidden: {},
      }}
      style={style}
    >
      {letters.map((char, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}

export function InvoiceSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section
      ref={ref}
      className="relative py-16 pb-32 px-6 overflow-hidden flex flex-col items-center w-full"
      style={{ background: '#f0f0ef' }}
    >
      {/* Testimonial */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.3, duration: 0.7 }}
        className="relative max-w-2xl mx-auto text-center px-8 z-10"
        style={{ marginTop: 80 }}
      >
        <blockquote
          style={{
            fontSize: 'clamp(14px, 1.6vw, 17px)',
            color: '#444',
            lineHeight: 1.7,
            fontStyle: 'italic',
            marginBottom: 16,
            textAlign: 'center',
          }}
        >
          &ldquo;I used to hate losing money on prediction markets. With Zero Risk mode, I just stake my Mezo yield. If I&apos;m right, I win the prize pool. If I&apos;m wrong, I keep my original 500 MUSD. I no longer hate my life.&rdquo;
        </blockquote>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <TypewriterText text="Maya" delayStart={1.0} style={{ fontSize: 14, fontWeight: 600, color: '#0a0a0a' }} />
          <div
            style={{
              fontSize: 13,
              color: '#777',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <TypewriterText text="Web3 Degen" delayStart={1.4} style={{
              fontFamily: 'var(--font-caveat), cursive',
              fontSize: 18,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #0a0a0a, #444)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }} />
          </div>
        </div>

        {/* Big quote marks */}
        <div
          style={{
            position: 'absolute',
            right: '10%',
            bottom: '8%',
            fontSize: 100,
            color: 'rgba(0,0,0,0.05)',
            fontFamily: 'Georgia, serif',
            lineHeight: 0.8,
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          &rdquo;
        </div>
      </motion.div>
    </section>
  );
}
