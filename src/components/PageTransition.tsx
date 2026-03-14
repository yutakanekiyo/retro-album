'use client'

import { motion } from 'framer-motion'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: 'brightness(0.3)' }}
      animate={{ opacity: 1, filter: 'brightness(1)' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}
    >
      {children}
    </motion.div>
  )
}
