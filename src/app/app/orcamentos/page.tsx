import { formatCurrency, getMonthRange } from '@/lib/locale'
import prisma from '@/lib/prisma'
import { requireUser } from '@/lib/session'

import { createBudget } from '@/app/app/actions'
import { ActionModal } from '@/components/action-modal'

export default async function BudgetsPage() {
  const user = await requireUser()
  const period = getMonthRange()
  const [categories, budgets] = await Promise.all([
    prisma.category.findMany({
      where: { type: 'EXPENSE', OR: [{ userId: user.id }, { userId: null }] },
      orderBy: { name: 'asc' },
    }),
    prisma.budget.findMany({
      where: { userId: user.id, month: period.month, year: period.year },
      include: { category: true },
      orderBy: { category: { name: 'asc' } },
    }),
  ])
  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Planeje seus gastos por categoria
          </p>
          <h1 className="font-display text-3xl font-bold">Orçamentos</h1>
        </div>
        <ActionModal
          title="Adicionar orçamento"
          triggerLabel="Adicionar orçamento"
        >
          <form action={createBudget} className="space-y-3">
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
            <button className="primary-button w-full" type="submit">
              Salvar orçamento
            </button>
          </form>
        </ActionModal>
      </header>
      <section className="glass-card p-5 sm:p-6">
        <h2 className="font-display text-xl font-bold">
          Limites de {period.month}/{period.year}
        </h2>
        {budgets.length ? (
          <div className="mt-4 divide-y divide-border/60">
            {budgets.map((budget) => (
              <div className="flex justify-between py-4" key={budget.id}>
                <span>{budget.category.name}</span>
                <strong>{formatCurrency(budget.amount)}</strong>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground">
            Você ainda não definiu limites para este mês.
          </p>
        )}
      </section>
    </div>
  )
}
