'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { parseCurrencyToCents } from '@/lib/locale'
import prisma from '@/lib/prisma'
import { requireUser } from '@/lib/session'

const accountSchema = z.object({
  name: z.string().trim().min(2).max(60),
  type: z.enum(['WALLET', 'BANK', 'CREDIT_CARD']),
  balance: z.string().min(1),
})
const transactionSchema = z.object({
  bankAccountId: z.string().uuid(),
  categoryId: z.string().uuid(),
  amount: z.string().min(1),
  date: z.string().date(),
  description: z.string().trim().max(160).optional(),
})
const budgetSchema = z.object({
  categoryId: z.string().uuid(),
  amount: z.string().min(1),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2024).max(2100),
})

function fail(message: string): never {
  throw new Error(message)
}

export async function createAccount(formData: FormData) {
  const user = await requireUser()
  const input = accountSchema.safeParse(Object.fromEntries(formData))
  if (!input.success) fail('Preencha uma conta válida.')
  await prisma.bankAccount.create({
    data: {
      ...input.data,
      balance: parseCurrencyToCents(input.data.balance),
      userId: user.id,
    },
  })
  revalidatePath('/app')
}

export async function createTransaction(formData: FormData) {
  const user = await requireUser()
  const input = transactionSchema.safeParse(Object.fromEntries(formData))
  if (!input.success) fail('Preencha uma transação válida.')
  const [account, category] = await Promise.all([
    prisma.bankAccount.findFirst({
      where: { id: input.data.bankAccountId, userId: user.id },
    }),
    prisma.category.findFirst({
      where: {
        id: input.data.categoryId,
        OR: [{ userId: user.id }, { userId: null }],
      },
    }),
  ])
  if (!(account && category)) fail('Conta ou categoria não encontrada.')
  await prisma.transaction.create({
    data: {
      bankAccountId: account.id,
      categoryId: category.id,
      amount: parseCurrencyToCents(input.data.amount),
      date: new Date(`${input.data.date}T12:00:00.000Z`),
      description: input.data.description || null,
    },
  })
  revalidatePath('/app')
}

export async function createBudget(formData: FormData) {
  const user = await requireUser()
  const input = budgetSchema.safeParse(Object.fromEntries(formData))
  if (!input.success) fail('Preencha um orçamento válido.')
  const category = await prisma.category.findFirst({
    where: {
      id: input.data.categoryId,
      OR: [{ userId: user.id }, { userId: null }],
    },
  })
  if (!category) fail('Categoria não encontrada.')
  await prisma.budget.upsert({
    where: {
      userId_categoryId_month_year: {
        userId: user.id,
        categoryId: category.id,
        month: input.data.month,
        year: input.data.year,
      },
    },
    create: {
      ...input.data,
      amount: parseCurrencyToCents(input.data.amount),
      userId: user.id,
    },
    update: { amount: parseCurrencyToCents(input.data.amount) },
  })
  revalidatePath('/app')
}
