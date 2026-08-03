import { describe, expect, it } from 'vitest'

import {
  calculateBalance,
  requiresInstitution,
  transactionImpact,
} from '@/lib/financial'

describe('financial accounts', () => {
  it('requires an institution except for cash', () => {
    expect(requiresInstitution('CHECKING')).toBe(true)
    expect(requiresInstitution('FOOD_BENEFIT')).toBe(true)
    expect(requiresInstitution('CASH')).toBe(false)
  })

  it('calculates balances from adjustments, income and expenses', () => {
    expect(
      calculateBalance([
        { kind: 'BALANCE_ADJUSTMENT', amount: BigInt(10_000) },
        { kind: 'REGULAR', categoryType: 'INCOME', amount: BigInt(2_500) },
        { kind: 'REGULAR', categoryType: 'EXPENSE', amount: BigInt(3_000) },
      ]),
    ).toBe(BigInt(9_500))
    expect(
      transactionImpact({ kind: 'BALANCE_ADJUSTMENT', amount: BigInt(-500) }),
    ).toBe(BigInt(-500))
  })
})
