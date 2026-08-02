'use client'

import { animate, motion, useMotionValue, useTransform } from 'motion/react'
import { useEffect } from 'react'

import { formatCurrency } from '@/lib/locale'

export function AnimatedNumber({ value }: { value: bigint }) {
  const amount = useMotionValue(0)
  const rendered = useTransform(amount, (current) =>
    formatCurrency(Math.round(current)),
  )

  useEffect(() => {
    const controls = animate(amount, Number(value), {
      type: 'spring',
      stiffness: 110,
      damping: 22,
    })
    return controls.stop
  }, [amount, value])

  return <motion.span>{rendered}</motion.span>
}
