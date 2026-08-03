import {
  ArrowDownRight,
  ArrowUpRight,
  Landmark,
  ReceiptText,
} from 'lucide-react'
import Link from 'next/link'

import { calculateBalance } from '@/lib/financial'
import { formatCurrency, getMonthRange } from '@/lib/locale'
import prisma from '@/lib/prisma'
import { requireUser } from '@/lib/session'

import { AnimatedNumber } from '@/components/animated-number'
import { RecentExpenses } from '@/components/recent-expenses'

export default async function DashboardPage() {
  const user = await requireUser()
  const period = getMonthRange()
  const [accounts, monthTransactions, recentExpenses, budgets] =
    await Promise.all([
      prisma.financialAccount.findMany({
        where: { userId: user.id },
        include: {
          institution: true,
          transactions: { include: { category: true } },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.transaction.findMany({
        where: {
          financialAccount: { userId: user.id },
          kind: 'REGULAR',
          date: { gte: period.start, lt: period.end },
        },
        include: { category: true },
      }),
      prisma.transaction.findMany({
        where: {
          financialAccount: { userId: user.id },
          kind: 'REGULAR',
          category: { type: 'EXPENSE' },
        },
        include: {
          category: true,
          financialAccount: { include: { institution: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      prisma.budget.findMany({
        where: { userId: user.id, month: period.month, year: period.year },
      }),
    ])
  const balances = accounts.map((account) => ({
    account,
    balance: calculateBalance(
      account.transactions.map((transaction) => ({
        amount: transaction.amount,
        kind: transaction.kind,
        categoryType: transaction.category?.type,
      })),
    ),
  }))
  const totalBalance = balances.reduce(
    (sum, item) => sum + item.balance,
    BigInt(0),
  )
  const income = monthTransactions
    .filter((item) => item.category?.type === 'INCOME')
    .reduce((sum, item) => sum + item.amount, BigInt(0))
  const expenses = monthTransactions
    .filter((item) => item.category?.type === 'EXPENSE')
    .reduce((sum, item) => sum + item.amount, BigInt(0))
  const budgetTotal = budgets.reduce(
    (sum, item) => sum + item.amount,
    BigInt(0),
  )
  const monthLabel = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date())
  const grouped = new Map<string, { name: string; balance: bigint }>()
  for (const item of balances) {
    const key = item.account.institutionId ?? 'cash'
    const existing = grouped.get(key)
    grouped.set(key, {
      name: item.account.institution?.name ?? 'Dinheiro em espécie',
      balance: (existing?.balance ?? BigInt(0)) + item.balance,
    })
  }

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <header className="mb-8">
        <p className="text-sm text-muted-foreground">
          Olá, {user.name.split(' ')[0]}
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold">Visão geral</h1>
        <p className="mt-1 capitalize text-sm text-muted-foreground">
          {monthLabel}
        </p>
      </header>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Saldo total"
          value={<AnimatedNumber value={totalBalance} />}
        />
        <Metric
          icon={<ArrowUpRight className="size-4" />}
          label="Receitas do mês"
          tone="positive"
          value={formatCurrency(income)}
        />
        <Metric
          icon={<ArrowDownRight className="size-4" />}
          label="Despesas do mês"
          tone="negative"
          value={formatCurrency(expenses)}
        />
        <Metric label="Orçado no mês" value={formatCurrency(budgetTotal)} />
      </section>
      <section className="mt-7 grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
        <div className="glass-card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Patrimônio disponível
              </p>
              <h2 className="font-display text-xl font-bold">
                Contas e instituições
              </h2>
            </div>
            <Link
              className="text-sm font-semibold text-primary"
              href="/app/contas"
            >
              Gerenciar
            </Link>
          </div>
          {grouped.size ? (
            <div className="mt-5 divide-y divide-border/60">
              {[...grouped.values()].map((item) => (
                <div
                  className="flex items-center justify-between py-3"
                  key={item.name}
                >
                  <span className="font-medium">{item.name}</span>
                  <strong>{formatCurrency(item.balance)}</strong>
                </div>
              ))}
            </div>
          ) : (
            <Empty label="Cadastre sua primeira conta para acompanhar seus saldos." />
          )}
        </div>
        <div className="glass-card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Adicionadas recentemente
              </p>
              <h2 className="font-display text-xl font-bold">
                Últimas despesas
              </h2>
            </div>
            <ReceiptText className="size-6 text-primary" />
          </div>
          <RecentExpenses
            initialData={recentExpenses.map((expense) => ({
              account: expense.financialAccount.name,
              amount: expense.amount.toString(),
              category: expense.category?.name ?? null,
              createdAt: expense.createdAt.toISOString(),
              date: expense.date.toISOString(),
              description: expense.description,
              id: expense.id,
              institution: expense.financialAccount.institution?.name ?? null,
            }))}
            userId={user.id}
          />
        </div>
      </section>
      <section className="mt-7 grid gap-4 sm:grid-cols-2">
        <Link
          className="glass-card flex items-center gap-4 p-5 transition hover:-translate-y-0.5"
          href="/app/lancamentos"
        >
          <span className="grid size-11 place-items-center rounded-2xl bg-primary/15 text-primary">
            <ReceiptText className="size-5" />
          </span>
          <span>
            <strong className="block">Adicionar lançamento</strong>
            <small className="text-muted-foreground">
              Registre uma receita ou despesa
            </small>
          </span>
        </Link>
        <Link
          className="glass-card flex items-center gap-4 p-5 transition hover:-translate-y-0.5"
          href="/app/contas"
        >
          <span className="grid size-11 place-items-center rounded-2xl bg-primary/15 text-primary">
            <Landmark className="size-5" />
          </span>
          <span>
            <strong className="block">Gerenciar contas</strong>
            <small className="text-muted-foreground">
              Instituições, benefícios e saldos
            </small>
          </span>
        </Link>
      </section>
    </div>
  )
}

function Metric({
  icon,
  label,
  tone,
  value,
}: {
  icon?: React.ReactNode
  label: string
  tone?: 'negative' | 'positive'
  value: React.ReactNode
}) {
  return (
    <div className="glass-card p-5">
      <p className="flex items-center gap-1 text-sm text-muted-foreground">
        {icon}
        {label}
      </p>
      <p
        className={`mt-3 font-display text-2xl font-bold ${tone === 'positive' ? 'text-primary' : tone === 'negative' ? 'text-destructive' : ''}`}
      >
        {value}
      </p>
    </div>
  )
}
function Empty({ label }: { label: string }) {
  return (
    <p className="mt-5 rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground">
      {label}
    </p>
  )
}
