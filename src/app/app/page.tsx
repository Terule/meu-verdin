import { Plus, WalletCards } from 'lucide-react'

import { formatCurrency, formatDate, getMonthRange } from '@/lib/locale'
import prisma from '@/lib/prisma'
import { requireUser } from '@/lib/session'

import {
  createAccount,
  createBudget,
  createTransaction,
} from '@/app/app/actions'
import { AnimatedNumber } from '@/components/animated-number'
import { SignOutButton } from '@/components/sign-out-button'
import { ThemeToggle } from '@/components/theme-toggle'

export default async function DashboardPage() {
  const user = await requireUser()
  const period = getMonthRange()
  const [accounts, categories, budgets, transactions] = await Promise.all([
    prisma.bankAccount.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.category.findMany({
      where: { OR: [{ userId: user.id }, { userId: null }] },
      orderBy: [{ userId: 'asc' }, { name: 'asc' }],
    }),
    prisma.budget.findMany({
      where: { userId: user.id, month: period.month, year: period.year },
      include: { category: true },
    }),
    prisma.transaction.findMany({
      where: {
        bankAccount: { userId: user.id },
        date: { gte: period.start, lt: period.end },
      },
      include: { category: true, bankAccount: true },
      orderBy: { date: 'desc' },
      take: 12,
    }),
  ])
  const balance = accounts.reduce(
    (sum, account) => sum + account.balance,
    BigInt(0),
  )
  const income = transactions
    .filter((transaction) => transaction.category.type === 'INCOME')
    .reduce((sum, transaction) => sum + transaction.amount, BigInt(0))
  const expenses = transactions
    .filter((transaction) => transaction.category.type === 'EXPENSE')
    .reduce((sum, transaction) => sum + transaction.amount, BigInt(0))
  const totalBudget = budgets.reduce(
    (sum, budget) => sum + budget.amount,
    BigInt(0),
  )
  const monthLabel = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date())

  return (
    <main className="mx-auto min-h-dvh max-w-7xl px-5 py-6 sm:px-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Olá, {user.name.split(' ')[0]}
          </p>
          <h1 className="font-display text-2xl font-bold">Seu Verdin</h1>
        </div>
        <div className="flex gap-2">
          <ThemeToggle />
          <SignOutButton />
        </div>
      </header>
      <section className="mt-10">
        <p className="capitalize text-sm text-muted-foreground">{monthLabel}</p>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          <Metric
            label="Saldo em contas"
            value={<AnimatedNumber value={balance} />}
          />
          <Metric
            label="Entradas do mês"
            tone="positive"
            value={formatCurrency(income)}
          />
          <Metric
            label="Saídas do mês"
            tone="negative"
            value={formatCurrency(expenses)}
          />
        </div>
      </section>
      <section className="mt-7 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        <div className="glass-card p-5 sm:p-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Transações recentes
              </p>
              <h2 className="font-display text-xl font-bold">Movimentações</h2>
            </div>
            <WalletCards className="size-6 text-primary" />
          </div>
          {transactions.length ? (
            <div className="mt-5 divide-y divide-border/60">
              {transactions.map((transaction) => (
                <div
                  className="flex items-center justify-between gap-4 py-4"
                  key={transaction.id}
                >
                  <div>
                    <p className="font-medium">
                      {transaction.description || transaction.category.name}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {transaction.bankAccount.name} ·{' '}
                      {formatDate(transaction.date)}
                    </p>
                  </div>
                  <strong
                    className={
                      transaction.category.type === 'INCOME'
                        ? 'text-primary'
                        : ''
                    }
                  >
                    {transaction.category.type === 'INCOME' ? '+' : '−'}{' '}
                    {formatCurrency(transaction.amount)}
                  </strong>
                </div>
              ))}
            </div>
          ) : (
            <Empty label="Registre sua primeira transação para acompanhar o mês." />
          )}
        </div>
        <div className="glass-card p-5 sm:p-7">
          <p className="text-sm text-muted-foreground">Planejado</p>
          <div className="mt-2 flex items-end justify-between">
            <h2 className="font-display text-xl font-bold">Orçamentos</h2>
            <strong>{formatCurrency(totalBudget)}</strong>
          </div>
          {budgets.length ? (
            <div className="mt-5 space-y-3">
              {budgets.map((budget) => (
                <div className="flex justify-between text-sm" key={budget.id}>
                  <span>{budget.category.name}</span>
                  <span className="text-muted-foreground">
                    {formatCurrency(budget.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <Empty label="Defina limites por categoria para planejar melhor." />
          )}
        </div>
      </section>
      <section className="mt-7 grid gap-6 lg:grid-cols-3">
        <FormCard title="Nova conta">
          <form action={createAccount} className="space-y-3">
            <input
              className="field w-full"
              name="name"
              placeholder="Ex.: Nubank"
              required
            />
            <select className="field w-full" defaultValue="BANK" name="type">
              <option value="BANK">Conta bancária</option>
              <option value="WALLET">Carteira</option>
              <option value="CREDIT_CARD">Cartão</option>
            </select>
            <input
              className="field w-full"
              inputMode="decimal"
              name="balance"
              placeholder="Saldo inicial (0,00)"
              required
            />
            <Submit label="Adicionar conta" />
          </form>
        </FormCard>
        <FormCard title="Nova transação">
          <form action={createTransaction} className="space-y-3">
            <select
              className="field w-full"
              disabled={!accounts.length}
              name="bankAccountId"
              required
            >
              <option value="">Selecione uma conta</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
            <select className="field w-full" name="categoryId" required>
              <option value="">Selecione uma categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input
                className="field w-full"
                inputMode="decimal"
                name="amount"
                placeholder="Valor"
                required
              />
              <input
                className="field w-full"
                defaultValue={new Date().toISOString().slice(0, 10)}
                name="date"
                required
                type="date"
              />
            </div>
            <input
              className="field w-full"
              name="description"
              placeholder="Descrição (opcional)"
            />
            <Submit disabled={!accounts.length} label="Registrar" />
          </form>
        </FormCard>
        <FormCard title="Novo orçamento">
          <form action={createBudget} className="space-y-3">
            <select className="field w-full" name="categoryId" required>
              <option value="">Selecione uma categoria</option>
              {categories
                .filter((category) => category.type === 'EXPENSE')
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
            <input
              className="field w-full"
              inputMode="decimal"
              name="amount"
              placeholder="Limite mensal"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                className="field w-full"
                defaultValue={period.month}
                max="12"
                min="1"
                name="month"
                required
                type="number"
              />
              <input
                className="field w-full"
                defaultValue={period.year}
                min="2024"
                name="year"
                required
                type="number"
              />
            </div>
            <Submit label="Salvar orçamento" />
          </form>
        </FormCard>
      </section>
    </main>
  )
}

function Metric({
  label,
  tone,
  value,
}: {
  label: string
  tone?: 'negative' | 'positive'
  value: React.ReactNode
}) {
  return (
    <div className="glass-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className={`mt-3 font-display text-2xl font-bold ${tone === 'positive' ? 'text-primary' : tone === 'negative' ? 'text-destructive' : ''}`}
      >
        {value}
      </p>
    </div>
  )
}
function FormCard({
  children,
  title,
}: {
  children: React.ReactNode
  title: string
}) {
  return (
    <div className="glass-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Plus className="size-4 text-primary" />
        <h2 className="font-display font-bold">{title}</h2>
      </div>
      {children}
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
function Submit({ disabled, label }: { disabled?: boolean; label: string }) {
  return (
    <button className="primary-button w-full" disabled={disabled} type="submit">
      {label}
    </button>
  )
}
