'use client';

import { motion, useInView } from 'framer-motion';
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
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] as any }}
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

export function ValuePropSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });

  return (
    <section
      ref={ref}
      className="relative py-28 px-6 text-center flex flex-col items-center w-full"
      style={{ background: '#f0f0ef' }}
    >
      <div className="max-w-2xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as any }}
          style={{
            fontSize: 'clamp(30px, 4.5vw, 48px)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.1,
            color: '#0a0a0a',
            marginBottom: 20,
            textAlign: 'center',
          }}
        >
          Presight <UnderlineWord>redefines</UnderlineWord> prediction markets
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as any }}
          style={{ textAlign: 'center' }}
        >
          <p style={{ fontSize: 15, color: '#666', lineHeight: 1.6, marginBottom: 6 }}>
            making them{' '}
            <span
              style={{
                borderBottom: '2px solid #FF3366',
                paddingBottom: 2,
                color: '#FF3366',
                fontStyle: 'italic',
                fontWeight: 600,
              }}
            >
              fun
            </span>
            ,{' '}
            <span
              style={{
                borderBottom: '2px solid #22c55e',
                paddingBottom: 2,
                color: '#22c55e',
                fontStyle: 'italic',
                fontWeight: 600,
              }}
            >
              profitable
            </span>
            , and{' '}
            <span
              style={{
                borderBottom: '2px solid #8b5cf6',
                paddingBottom: 2,
                color: '#8b5cf6',
                fontStyle: 'italic',
                fontWeight: 600,
              }}
            >
              zero risk
            </span>
            .
          </p>
          <p style={{ fontSize: 15, color: '#444', lineHeight: 1.6, marginBottom: 6 }}>
            A new way to predict, earn, and play together.
          </p>
        </motion.div>

      </div>
    </section>
  );
}
