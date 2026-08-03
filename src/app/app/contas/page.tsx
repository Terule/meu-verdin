import { Building2, Plus } from 'lucide-react'

import { calculateBalance } from '@/lib/financial'
import { formatCurrency } from '@/lib/locale'
import prisma from '@/lib/prisma'
import { requireUser } from '@/lib/session'

import {
  createFinancialAccount,
  deleteFinancialAccount,
  deletePrivateInstitution,
  updateFinancialAccount,
  updatePrivateInstitution,
} from '@/app/app/actions'

const labels: Record<string, string> = {
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

export default async function AccountsPage() {
  const user = await requireUser()
  const [accounts, institutions] = await Promise.all([
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
  ])
  const grouped = new Map<string, typeof accounts>()
  for (const account of accounts) {
    const key = account.institutionId ?? 'cash'
    grouped.set(key, [...(grouped.get(key) ?? []), account])
  }
  const hasInstitutionAccount = accounts.some(
    (account) => account.institutionId,
  )
  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <header className="mb-8">
        <p className="text-sm text-muted-foreground">
          Instituições, benefícios e dinheiro
        </p>
        <h1 className="font-display text-3xl font-bold">Contas financeiras</h1>
      </header>
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="glass-card p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Building2 className="size-5 text-primary" />
            <h2 className="font-display text-xl font-bold">Suas contas</h2>
          </div>
          {grouped.size ? (
            <div className="mt-5 space-y-4">
              {[...grouped.entries()].map(([key, group]) => {
                const institution = group[0].institution
                const balance = group.reduce(
                  (sum, account) =>
                    sum +
                    calculateBalance(
                      account.transactions.map((item) => ({
                        amount: item.amount,
                        kind: item.kind,
                        categoryType: item.category?.type,
                      })),
                    ),
                  BigInt(0),
                )
                return (
                  <div
                    className="rounded-2xl border border-border/60 p-4"
                    key={key}
                  >
                    <div className="flex justify-between gap-4">
                      <div>
                        <p className="font-semibold">
                          {institution?.name ?? 'Dinheiro em espécie'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {institution ? 'Instituição' : 'Conta avulsa'}
                        </p>
                      </div>
                      <strong>{formatCurrency(balance)}</strong>
                    </div>
                    {group.map((account) => {
                      const accountBalance = calculateBalance(
                        account.transactions.map((item) => ({
                          amount: item.amount,
                          kind: item.kind,
                          categoryType: item.category?.type,
                        })),
                      )
                      return (
                        <details
                          className="mt-3 rounded-xl bg-muted/50 p-3"
                          key={account.id}
                        >
                          <summary className="cursor-pointer list-none">
                            <div className="flex justify-between gap-3">
                              <span>
                                {account.name}
                                <small className="ml-2 text-muted-foreground">
                                  {labels[account.type]}
                                </small>
                              </span>
                              <span>{formatCurrency(accountBalance)}</span>
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
                                {Object.entries(labels)
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
                              <button
                                className="primary-button w-full"
                                type="submit"
                              >
                                Salvar conta
                              </button>
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
                      )
                    })}
                    {institution?.userId ? (
                      <details className="mt-3 text-sm">
                        <summary className="cursor-pointer text-muted-foreground">
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
            <p className="mt-5 rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground">
              Comece cadastrando uma instituição e sua primeira conta.
            </p>
          )}
        </section>
        <section className="glass-card h-fit p-5">
          <div className="mb-4 flex items-center gap-2">
            <Plus className="size-4 text-primary" />
            <h2 className="font-display font-bold">
              {hasInstitutionAccount
                ? 'Adicionar conta'
                : 'Primeira instituição'}
            </h2>
          </div>
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
              {Object.entries(labels)
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
            <button className="primary-button w-full" type="submit">
              {hasInstitutionAccount
                ? 'Adicionar conta'
                : 'Criar instituição e conta'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
