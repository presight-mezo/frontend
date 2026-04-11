'use client';

import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 40));

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as any }}
    >
      <motion.nav
        animate={{
          backgroundColor: scrolled ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.6)',
          boxShadow: scrolled
            ? '0 4px 32px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.06)'
            : '0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
        }}
        transition={{ duration: 0.3 }}
        style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: 100 }}
        className="flex items-center gap-2 px-4 py-2.5 w-full max-w-2xl"
      >
        {/* Logo */}
        <div className="flex items-center gap-1.5 mr-auto">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="2" width="9" height="9" rx="2.5" fill="#0a0a0a"/>
            <rect x="13" y="2" width="9" height="9" rx="2.5" fill="#0a0a0a" opacity="0.4"/>
            <rect x="2" y="13" width="9" height="9" rx="2.5" fill="#0a0a0a" opacity="0.4"/>
            <rect x="13" y="13" width="9" height="9" rx="2.5" fill="#0a0a0a"/>
          </svg>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.03em', color: '#0a0a0a' }}>
            Acctual
          </span>
        </div>

        {/* Center links */}
        {['Teams', 'About', 'Blog', 'Guides'].map((link) => (
          <motion.a
            key={link}
            href="#"
            whileHover={{ color: '#0a0a0a' }}
            className="px-3 py-1.5 text-sm font-medium rounded-full transition-colors"
            style={{ color: '#666', textDecoration: 'none' }}
          >
            {link}
          </motion.a>
        ))}

        {/* Right actions */}
        <div className="flex items-center gap-1.5 ml-auto">
          <motion.a
            href="#"
            whileHover={{ color: '#0a0a0a' }}
            className="px-3 py-1.5 text-sm font-medium"
            style={{ color: '#555', textDecoration: 'none' }}
          >
            Log in
          </motion.a>
          <motion.a
            href="#"
            whileHover={{ scale: 1.04, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}
            whileTap={{ scale: 0.97 }}
            className="px-4 py-2 text-sm font-semibold text-white rounded-full"
            style={{ background: '#0a0a0a', textDecoration: 'none' }}
          >
            Sign up for free
          </motion.a>
        </div>
      </motion.nav>
    </motion.header>
  );
}
