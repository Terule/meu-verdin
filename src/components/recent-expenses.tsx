'use client'

import { useQuery } from '@tanstack/react-query'

import { formatCurrency, formatDate } from '@/lib/locale'

type Expense = {
  account: string
  amount: string
  category: string | null
  createdAt: string
  date: string
  description: string | null
  id: string
  institution: string | null
}

async function fetchRecentExpenses() {
  const response = await fetch('/api/dashboard/recent-expenses')
  if (!response.ok) throw new Error('Não foi possível atualizar as despesas.')
  return response.json() as Promise<Expense[]>
}

export function RecentExpenses({
  initialData,
  userId,
}: {
  initialData: Expense[]
  userId: string
}) {
  const { data: expenses = initialData } = useQuery({
    queryKey: ['recent-expenses', userId],
    queryFn: fetchRecentExpenses,
    initialData,
  })
  if (!expenses.length)
    return (
      <p className="mt-5 rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground">
        Suas despesas adicionadas aparecerão aqui.
      </p>
    )
  return (
    <div className="mt-5 divide-y divide-border/60">
      {expenses.map((expense) => (
        <div
          className="flex items-center justify-between gap-4 py-3"
          key={expense.id}
        >
          <div className="min-w-0">
            <p className="truncate font-medium">
              {expense.description || expense.category}
            </p>
            <p className="text-sm text-muted-foreground">
              {expense.institution ? `${expense.institution} › ` : ''}
              {expense.account} · {formatDate(new Date(expense.date))}
            </p>
          </div>
          <strong>{formatCurrency(BigInt(expense.amount))}</strong>
        </div>
      ))}
    </div>
  )
}
