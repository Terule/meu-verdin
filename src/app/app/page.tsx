import { Building2, Plus, WalletCards } from 'lucide-react'

import { calculateBalance } from '@/lib/financial'
import { formatCurrency, formatDate, getMonthRange } from '@/lib/locale'
import prisma from '@/lib/prisma'
import { requireUser } from '@/lib/session'

import {
  createBudget,
  createFinancialAccount,
  createTransaction,
  deleteFinancialAccount,
  deletePrivateInstitution,
  updateFinancialAccount,
  updatePrivateInstitution,
} from '@/app/app/actions'
import { AnimatedNumber } from '@/components/animated-number'
import { SignOutButton } from '@/components/sign-out-button'
import { ThemeToggle } from '@/components/theme-toggle'

const accountTypeLabels: Record<string, string> = {
  CHECKING: 'Conta corrente',
  PAYMENT: 'Conta de pagamento',
  SAVINGS: 'Poupança',
  INVESTMENT: 'Investimento',
  CREDIT_CARD: 'Cartão de crédito',
  FOOD_BENEFIT: 'Vale-alimentação',
  MEAL_BENEFIT: 'Vale-refeição',
  FLEX_BENEFIT: 'Benefício flexível',
  CASH: 'Dinheiro em espécie',
  OTHER: 'Outra conta',
}

export default async function DashboardPage() {
  const user = await requireUser()
  const period = getMonthRange()
  const [accounts, institutions, categories, budgets, monthTransactions] =
    await Promise.all([
      prisma.financialAccount.findMany({
        where: { userId: user.id },
        include: {
          institution: true,
          transactions: { include: { category: true } },
        },
        orderBy: [{ institution: { name: 'asc' } }, { name: 'asc' }],
      }),
      prisma.institution.findMany({
        where: { OR: [{ userId: null }, { userId: user.id }] },
        orderBy: { name: 'asc' },
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
          financialAccount: { userId: user.id },
          date: { gte: period.start, lt: period.end },
        },
        include: {
          category: true,
          financialAccount: { include: { institution: true } },
        },
        orderBy: { date: 'desc' },
        take: 12,
      }),
    ])
  const balances = new Map(
    accounts.map((account) => [
      account.id,
      calculateBalance(
        account.transactions.map((transaction) => ({
          amount: transaction.amount,
          kind: transaction.kind,
          categoryType: transaction.category?.type,
        })),
      ),
    ]),
  )
  const balance = [...balances.values()].reduce(
    (sum, value) => sum + value,
    BigInt(0),
  )
  const regularTransactions = monthTransactions.filter(
    (transaction) => transaction.kind === 'REGULAR',
  )
  const income = regularTransactions
    .filter((transaction) => transaction.category?.type === 'INCOME')
    .reduce((sum, transaction) => sum + transaction.amount, BigInt(0))
  const expenses = regularTransactions
    .filter((transaction) => transaction.category?.type === 'EXPENSE')
    .reduce((sum, transaction) => sum + transaction.amount, BigInt(0))
  const totalBudget = budgets.reduce(
    (sum, budget) => sum + budget.amount,
    BigInt(0),
  )
  const groupedAccounts = new Map<string, typeof accounts>()
  for (const account of accounts) {
    const key = account.institutionId ?? 'cash'
    groupedAccounts.set(key, [...(groupedAccounts.get(key) ?? []), account])
  }
  const hasInstitutionAccount = accounts.some(
    (account) => account.institutionId,
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
            label="Saldo total"
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
          {regularTransactions.length ? (
            <div className="mt-5 divide-y divide-border/60">
              {regularTransactions.map((transaction) => (
                <div
                  className="flex items-center justify-between gap-4 py-4"
                  key={transaction.id}
                >
                  <div>
                    <p className="font-medium">
                      {transaction.description || transaction.category?.name}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {transaction.financialAccount.institution?.name
                        ? `${transaction.financialAccount.institution.name} › `
                        : ''}
                      {transaction.financialAccount.name} ·{' '}
                      {formatDate(transaction.date)}
                    </p>
                  </div>
                  <strong
                    className={
                      transaction.category?.type === 'INCOME'
                        ? 'text-primary'
                        : ''
                    }
                  >
                    {transaction.category?.type === 'INCOME' ? '+' : '−'}{' '}
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

      <section className="mt-7 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        <div className="glass-card p-5 sm:p-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Suas instituições</p>
              <h2 className="font-display text-xl font-bold">
                Contas financeiras
              </h2>
            </div>
            <Building2 className="size-6 text-primary" />
          </div>
          {accounts.length ? (
            <div className="mt-5 space-y-5">
              {[...groupedAccounts.entries()].map(([key, group]) => {
                const institution = group[0].institution
                const groupBalance = group.reduce(
                  (sum, account) =>
                    sum + (balances.get(account.id) ?? BigInt(0)),
                  BigInt(0),
                )
                return (
                  <div
                    className="rounded-2xl border border-border/60 p-4"
                    key={key}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">
                          {institution?.name ?? 'Dinheiro em espécie'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {institution ? 'Instituição' : 'Conta avulsa'}
                        </p>
                      </div>
                      <strong>{formatCurrency(groupBalance)}</strong>
                    </div>
                    {group.map((account) => (
                      <details
                        className="mt-3 rounded-xl bg-muted/50 p-3"
                        key={account.id}
                      >
                        <summary className="cursor-pointer list-none">
                          <div className="flex justify-between gap-3">
                            <span>
                              {account.name}
                              <small className="ml-2 text-muted-foreground">
                                {accountTypeLabels[account.type]}
                              </small>
                            </span>
                            <span>
                              {formatCurrency(
                                balances.get(account.id) ?? BigInt(0),
                              )}
                            </span>
                          </div>
                        </summary>
                        <div className="mt-4 grid gap-3 border-t border-border/60 pt-3 sm:grid-cols-2">
                          <form
                            action={updateFinancialAccount}
                            className="space-y-2"
                          >
                            <input
                              name="accountId"
                              type="hidden"
                              value={account.id}
                            />
                            <input
                              className="field w-full"
                              defaultValue={account.name}
                              name="name"
                              required
                            />
                            <select
                              className="field w-full"
                              defaultValue={account.type}
                              name="type"
                            >
                              {Object.entries(accountTypeLabels)
                                .filter(
                                  ([type]) =>
                                    account.institutionId || type === 'CASH',
                                )
                                .map(([type, label]) => (
                                  <option key={type} value={type}>
                                    {label}
                                  </option>
                                ))}
                            </select>
                            <Submit label="Salvar conta" />
                          </form>
                          <form action={deleteFinancialAccount}>
                            <input
                              name="accountId"
                              type="hidden"
                              value={account.id}
                            />
                            <button
                              className="secondary-button w-full"
                              type="submit"
                            >
                              Excluir conta
                            </button>
                          </form>
                        </div>
                      </details>
                    ))}
                    {institution?.userId ? (
                      <details className="mt-3 text-sm text-muted-foreground">
                        <summary className="cursor-pointer">
                          Gerenciar instituição privada
                        </summary>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          <form
                            action={updatePrivateInstitution}
                            className="flex gap-2"
                          >
                            <input
                              name="institutionId"
                              type="hidden"
                              value={institution.id}
                            />
                            <input
                              className="field min-w-0 flex-1"
                              defaultValue={institution.name}
                              name="name"
                              required
                            />
                            <button className="secondary-button" type="submit">
                              Salvar
                            </button>
                          </form>
                          <form action={deletePrivateInstitution}>
                            <input
                              name="institutionId"
                              type="hidden"
                              value={institution.id}
                            />
                            <button
                              className="secondary-button w-full"
                              type="submit"
                            >
                              Excluir instituição
                            </button>
                          </form>
                        </div>
                      </details>
                    ) : null}
                  </div>
                )
              })}
            </div>
          ) : (
            <Empty label="Comece cadastrando uma instituição e sua primeira conta." />
          )}
        </div>
        <FormCard
          title={
            hasInstitutionAccount
              ? 'Adicionar conta'
              : 'Cadastre sua primeira instituição'
          }
        >
          <form action={createFinancialAccount} className="space-y-3">
            <input
              className="field w-full"
              name="name"
              placeholder="Ex.: Conta principal"
              required
            />
            <select
              className="field w-full"
              defaultValue="CHECKING"
              name="type"
            >
              {Object.entries(accountTypeLabels)
                .filter(([type]) => hasInstitutionAccount || type !== 'CASH')
                .map(([type, label]) => (
                  <option key={type} value={type}>
                    {label}
                  </option>
                ))}
            </select>
            <select
              className="field w-full"
              defaultValue=""
              name="institutionId"
            >
              <option value="">Selecione a instituição</option>
              {institutions.map((institution) => (
                <option key={institution.id} value={institution.id}>
                  {institution.name}
                </option>
              ))}
            </select>
            <input
              className="field w-full"
              name="customInstitutionName"
              placeholder="Ou digite uma instituição privada"
            />
            <input
              className="field w-full"
              inputMode="decimal"
              name="openingBalance"
              placeholder="Saldo inicial (opcional)"
            />
            <Submit
              label={
                hasInstitutionAccount
                  ? 'Adicionar conta'
                  : 'Criar instituição e conta'
              }
            />
          </form>
        </FormCard>
      </section>

      <section className="mt-7 grid gap-6 lg:grid-cols-2">
        <FormCard title="Nova transação">
          <form action={createTransaction} className="space-y-3">
            <select
              className="field w-full"
              disabled={!accounts.length}
              name="financialAccountId"
              required
            >
              <option value="">Selecione uma conta</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.institution?.name
                    ? `${account.institution.name} › `
                    : ''}
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
