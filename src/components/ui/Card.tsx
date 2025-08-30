import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export function Card({ children, className = '', hoverable = false }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hoverable ? { scale: 1.02, y: -5 } : {}}
      className={`bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl ${className}`}
    >
      {children}
    </motion.div>
  );
}