'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

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
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  )
}
