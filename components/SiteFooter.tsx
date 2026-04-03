'use client';

import { motion } from 'framer-motion';

export function SiteFooter() {
  return (
    <footer
      style={{
        background: '#f0f0ef',
        padding: '0 40px 24px',
        marginTop: '80px', // Added space between CTA section and footer
      }}
    >
      <div 
        style={{ 
          maxWidth: 960, 
          margin: '0 auto',
          borderTop: '1px solid rgba(0,0,0,0.07)',
          paddingTop: '24px'
        }}
      >
        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 12, color: '#aaa' }}>
            © 2026 Presight. Open source MVP.
          </span>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Twitter', 'Github', 'Telegram'].map((s) => (
              <motion.a
                key={s}
                href="#"
                whileHover={{ color: '#0a0a0a' }}
                style={{ fontSize: 12, color: '#bbb', textDecoration: 'none' }}
              >
                {s}
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
