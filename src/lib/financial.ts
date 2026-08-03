export type LedgerTransaction = {
  amount: bigint
  kind: 'REGULAR' | 'BALANCE_ADJUSTMENT'
  categoryType?: string | null
}

export function requiresInstitution(accountType: string) {
  return accountType !== 'CASH'
}

export function transactionImpact(transaction: LedgerTransaction) {
  if (transaction.kind === 'BALANCE_ADJUSTMENT') return transaction.amount
  return transaction.categoryType === 'INCOME'
    ? transaction.amount
    : -transaction.amount
}

export function calculateBalance(transactions: LedgerTransaction[]) {
  return transactions.reduce(
    (sum, transaction) => sum + transactionImpact(transaction),
    BigInt(0),
  )
}
