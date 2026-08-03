'use client'

import { Moon, Sun } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const reduceMotion = useReducedMotion()

  useEffect(() => setMounted(true), [])
  if (!mounted) return <span className="size-10" />

  const isDark = resolvedTheme === 'dark'
  return (
    <button
      aria-label={isDark ? 'Usar tema claro' : 'Usar tema escuro'}
      className="glass-button grid size-10 place-items-center"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      type="button"
    >
      <span className="relative grid size-4 place-items-center overflow-hidden">
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            className="absolute"
            exit={{ opacity: 0, rotate: isDark ? 80 : -80, scale: 0.6 }}
            initial={{ opacity: 0, rotate: isDark ? -80 : 80, scale: 0.6 }}
            key={isDark ? 'sun' : 'moon'}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.24, ease: [0.22, 1, 0.36, 1] }
            }
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  )
}
