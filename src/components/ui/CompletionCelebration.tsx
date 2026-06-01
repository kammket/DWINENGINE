"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
}

const COLORS = ["#C9A84C", "#E8D47A", "#87A878", "#6B7FA3", "#FAF9F6", "#A8893A"];

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    delay: Math.random() * 0.4,
    duration: 1.2 + Math.random() * 0.8,
    size: 4 + Math.random() * 6,
  }));
}

interface CompletionCelebrationProps {
  show: boolean;
  title?: string;
  subtitle?: string;
  onDone?: () => void;
}

export function CompletionCelebration({
  show,
  title = "All 5 calculators complete!",
  subtitle = "You now have a full picture of your life sustainability.",
  onDone,
}: CompletionCelebrationProps) {
  const [particles] = useState(() => generateParticles(40));
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const t = setTimeout(() => {
        setVisible(false);
        onDone?.();
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [show, onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] pointer-events-none"
          aria-hidden="true"
        >
          {/* Confetti particles */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0, scale: 1 }}
              animate={{ y: "105vh", opacity: [1, 1, 0], rotate: 360 * 3, scale: [1, 1.2, 0.8] }}
              transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
              className="absolute top-0 rounded-sm"
              style={{
                width: p.size,
                height: p.size * 0.6,
                backgroundColor: p.color,
              }}
            />
          ))}

          {/* Central banner */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 22 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 text-center px-8 py-5 rounded-2xl shadow-premium-lg pointer-events-auto"
            style={{ backgroundColor: "var(--card-bg)", border: "1px solid rgba(201,168,76,0.4)" }}
          >
            <p className="text-2xl mb-1">🗺️</p>
            <p className="font-serif font-bold text-base mb-1" style={{ color: "var(--page-text)" }}>
              {title}
            </p>
            <p className="text-xs text-slate-calm">{subtitle}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
