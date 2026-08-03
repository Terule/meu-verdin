import { formatCurrency, formatDate, getMonthRange } from '@/lib/locale'
import prisma from '@/lib/prisma'
import { requireUser } from '@/lib/session'

import { createTransaction } from '@/app/app/actions'
import { ActionModal } from '@/components/action-modal'

export default async function TransactionsPage() {
  const user = await requireUser()
  const period = getMonthRange()
  const [accounts, categories, transactions] = await Promise.all([
    prisma.financialAccount.findMany({
      where: { userId: user.id },
      include: { institution: true },
      orderBy: { name: 'asc' },
    }),
    prisma.category.findMany({
      where: { OR: [{ userId: user.id }, { userId: null }] },
      orderBy: [{ userId: 'asc' }, { name: 'asc' }],
    }),
    prisma.transaction.findMany({
      where: {
        financialAccount: { userId: user.id },
        kind: 'REGULAR',
        date: { gte: period.start, lt: period.end },
      },
      include: {
        category: true,
        financialAccount: { include: { institution: true } },
      },
      orderBy: { date: 'desc' },
    }),
  ])
  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Movimente suas contas</p>
          <h1 className="font-display text-3xl font-bold">Lançamentos</h1>
        </div>
        {accounts.length ? (
          <ActionModal
            description="Registre uma receita ou despesa."
            title="Adicionar lançamento"
            triggerLabel="Adicionar lançamento"
          >
            <form action={createTransaction} className="space-y-3">
              <select
                className="field w-full"
                name="financialAccountId"
                required
              >
                <option value="">Selecione a conta</option>
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
                <option value="">Selecione a categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
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
              <input
                className="field w-full"
                name="description"
                placeholder="Descrição (opcional)"
              />
              <button className="primary-button w-full" type="submit">
                Registrar
              </button>
            </form>
          </ActionModal>
        ) : null}
      </header>
      <section className="glass-card p-5 sm:p-6">
        <h2 className="font-display text-xl font-bold">Este mês</h2>
        {transactions.length ? (
          <div className="mt-4 divide-y divide-border/60">
            {transactions.map((item) => (
              <div
                className="flex items-center justify-between gap-4 py-4"
                key={item.id}
              >
                <div>
                  <p className="font-medium">
                    {item.description || item.category?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.financialAccount.institution?.name
                      ? `${item.financialAccount.institution.name} › `
                      : ''}
                    {item.financialAccount.name} · {formatDate(item.date)}
                  </p>
                </div>
                <strong
                  className={
                    item.category?.type === 'INCOME' ? 'text-primary' : ''
                  }
                >
                  {item.category?.type === 'INCOME' ? '+' : '−'}{' '}
                  {formatCurrency(item.amount)}
                </strong>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground">
            {accounts.length
              ? 'Nenhum lançamento neste mês.'
              : 'Cadastre uma conta antes de registrar lançamentos.'}
          </p>
        )}
      </section>
    </div>
  )
}
