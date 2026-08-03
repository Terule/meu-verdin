import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export async function GET() {
  const user = await getCurrentUser()
  if (!user)
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  const expenses = await prisma.transaction.findMany({
    where: {
      financialAccount: { userId: user.id },
      kind: 'REGULAR',
      category: { type: 'EXPENSE' },
    },
    include: {
      category: { select: { name: true } },
      financialAccount: {
        include: { institution: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 8,
  })
  return NextResponse.json(
    expenses.map((expense) => ({
      account: expense.financialAccount.name,
      amount: expense.amount.toString(),
      category: expense.category?.name ?? null,
      createdAt: expense.createdAt.toISOString(),
      date: expense.date.toISOString(),
      description: expense.description,
      id: expense.id,
      institution: expense.financialAccount.institution?.name ?? null,
    })),
  )
}
