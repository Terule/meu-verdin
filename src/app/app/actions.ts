'use server'

import { randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { requiresInstitution } from '@/lib/financial'
import { parseCurrencyToCents } from '@/lib/locale'
import prisma from '@/lib/prisma'
import { requireUser } from '@/lib/session'

const accountTypes = [
  'CHECKING',
  'PAYMENT',
  'SAVINGS',
  'INVESTMENT',
  'CREDIT_CARD',
  'FOOD_BENEFIT',
  'MEAL_BENEFIT',
  'FLEX_BENEFIT',
  'CASH',
  'OTHER',
] as const

const accountSchema = z.object({
  name: z.string().trim().min(2).max(60),
  type: z.enum(accountTypes),
  institutionId: z.string().uuid().optional().or(z.literal('')),
  customInstitutionName: z.string().trim().max(80).optional(),
  openingBalance: z.string().trim().optional(),
})
const accountUpdateSchema = accountSchema
  .pick({ name: true, type: true })
  .extend({
    accountId: z.string().uuid(),
  })
const transactionSchema = z.object({
  financialAccountId: z.string().uuid(),
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

function hasValue(value?: string) {
  return Boolean(value?.trim())
}

export async function createFinancialAccount(formData: FormData) {
  const user = await requireUser()
  const input = accountSchema.safeParse(Object.fromEntries(formData))
  if (!input.success) fail('Preencha uma conta válida.')

  const openingBalanceText = input.data.openingBalance ?? ''
  const customInstitutionName = input.data.customInstitutionName ?? ''
  const openingBalance = hasValue(openingBalanceText)
    ? parseCurrencyToCents(openingBalanceText)
    : BigInt(0)

  await prisma.$transaction(async (tx) => {
    let institutionId: string | null = null
    if (
      input.data.type === 'CASH' &&
      !input.data.institutionId &&
      !hasValue(customInstitutionName)
    ) {
      const institutionAccountCount = await tx.financialAccount.count({
        where: { userId: user.id, institutionId: { not: null } },
      })
      if (!institutionAccountCount) {
        fail(
          'Cadastre uma instituição e uma conta antes de adicionar dinheiro em espécie.',
        )
      }
    } else if (hasValue(customInstitutionName)) {
      institutionId = (
        await tx.institution.create({
          data: {
            name: customInstitutionName.trim(),
            slug: `privada-${user.id}-${randomUUID()}`,
            kind: 'OTHER',
            icon: 'building-2',
            userId: user.id,
          },
        })
      ).id
    } else {
      if (!requiresInstitution(input.data.type)) {
        fail('Selecione uma instituição ou use dinheiro em espécie.')
      }
      if (!input.data.institutionId)
        fail('Selecione uma instituição para esta conta.')
      const institution = await tx.institution.findFirst({
        where: {
          id: input.data.institutionId,
          OR: [{ userId: null }, { userId: user.id }],
        },
      })
      if (!institution) fail('Instituição não encontrada.')
      institutionId = institution.id
    }

    const account = await tx.financialAccount.create({
      data: {
        name: input.data.name,
        type: input.data.type,
        userId: user.id,
        institutionId,
      },
    })
    if (openingBalance !== BigInt(0)) {
      await tx.transaction.create({
        data: {
          financialAccountId: account.id,
          kind: 'BALANCE_ADJUSTMENT',
          amount: openingBalance,
          date: new Date(),
          description: 'Ajuste de saldo',
        },
      })
    }
  })
  revalidatePath('/app')
}

export async function updateFinancialAccount(formData: FormData) {
  const user = await requireUser()
  const input = accountUpdateSchema.safeParse(Object.fromEntries(formData))
  if (!input.success) fail('Preencha uma conta válida.')
  const account = await prisma.financialAccount.findFirst({
    where: { id: input.data.accountId, userId: user.id },
  })
  if (!account) fail('Conta não encontrada.')
  if (!account.institutionId && input.data.type !== 'CASH')
    fail('Dinheiro em espécie deve permanecer como esse tipo.')
  await prisma.financialAccount.update({
    where: { id: account.id },
    data: { name: input.data.name, type: input.data.type },
  })
  revalidatePath('/app')
}

export async function deleteFinancialAccount(formData: FormData) {
  const user = await requireUser()
  const accountId = z.string().uuid().safeParse(formData.get('accountId'))
  if (!accountId.success) fail('Conta inválida.')
  const account = await prisma.financialAccount.findFirst({
    where: { id: accountId.data, userId: user.id },
  })
  if (!account) fail('Conta não encontrada.')
  const [transactionCount, institutionAccountCount] = await Promise.all([
    prisma.transaction.count({ where: { financialAccountId: account.id } }),
    prisma.financialAccount.count({
      where: { userId: user.id, institutionId: { not: null } },
    }),
  ])
  if (transactionCount)
    fail('Não é possível excluir uma conta com lançamentos.')
  if (account.institutionId && institutionAccountCount <= 1)
    fail('Mantenha ao menos uma conta vinculada a uma instituição.')
  await prisma.financialAccount.delete({ where: { id: account.id } })
  revalidatePath('/app')
}

export async function updatePrivateInstitution(formData: FormData) {
  const user = await requireUser()
  const input = z
    .object({
      institutionId: z.string().uuid(),
      name: z.string().trim().min(2).max(80),
    })
    .safeParse(Object.fromEntries(formData))
  if (!input.success) fail('Instituição inválida.')
  const institution = await prisma.institution.findFirst({
    where: { id: input.data.institutionId, userId: user.id },
  })
  if (!institution) fail('Apenas instituições privadas podem ser editadas.')
  await prisma.institution.update({
    where: { id: institution.id },
    data: { name: input.data.name },
  })
  revalidatePath('/app')
}

export async function deletePrivateInstitution(formData: FormData) {
  const user = await requireUser()
  const institutionId = z
    .string()
    .uuid()
    .safeParse(formData.get('institutionId'))
  if (!institutionId.success) fail('Instituição inválida.')
  const institution = await prisma.institution.findFirst({
    where: { id: institutionId.data, userId: user.id },
    include: { _count: { select: { accounts: true } } },
  })
  if (!institution) fail('Apenas instituições privadas podem ser excluídas.')
  if (institution._count.accounts)
    fail('Exclua as contas desta instituição antes de removê-la.')
  await prisma.institution.delete({ where: { id: institution.id } })
  revalidatePath('/app')
}

export async function createTransaction(formData: FormData) {
  const user = await requireUser()
  const input = transactionSchema.safeParse(Object.fromEntries(formData))
  if (!input.success) fail('Preencha uma transação válida.')
  const [account, category] = await Promise.all([
    prisma.financialAccount.findFirst({
      where: { id: input.data.financialAccountId, userId: user.id },
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
      financialAccountId: account.id,
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
