import { describe, expect, it } from 'vitest'

import { formatCurrency, parseCurrencyToCents } from '@/lib/locale'

describe('currency utilities', () => {
  it('formats cents in Brazilian Real', () => {
    expect(formatCurrency(BigInt(123456))).toBe('R$ 1.234,56')
  })

  it('parses Brazilian decimal input into cents', () => {
    expect(parseCurrencyToCents('1.234,56')).toBe(BigInt(123456))
  })
})
