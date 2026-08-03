import prisma from '@/lib/prisma'
import { requireUser } from '@/lib/session'

import { createCategory, deleteCategory } from '@/app/app/actions'

export default async function CategoriesPage() {
  const user = await requireUser()
  const categories = await prisma.category.findMany({
    where: { OR: [{ userId: null }, { userId: user.id }] },
    orderBy: [{ type: 'asc' }, { userId: 'asc' }, { name: 'asc' }],
  })
  const expenses = categories.filter((category) => category.type === 'EXPENSE')
  const income = categories.filter((category) => category.type === 'INCOME')
  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <header className="mb-8">
        <p className="text-sm text-muted-foreground">
          Classifique seus lançamentos
        </p>
        <h1 className="font-display text-3xl font-bold">Categorias</h1>
      </header>
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <section className="glass-card h-fit p-5">
          <h2 className="font-display font-bold">Nova categoria</h2>
          <form action={createCategory} className="mt-4 space-y-3">
            <input
              className="field w-full"
              name="name"
              placeholder="Ex.: Assinaturas"
              required
            />
            <select className="field w-full" defaultValue="EXPENSE" name="type">
              <option value="EXPENSE">Despesa</option>
              <option value="INCOME">Receita</option>
            </select>
            <button className="primary-button w-full" type="submit">
              Adicionar categoria
            </button>
          </form>
        </section>
        <section className="grid gap-6 lg:grid-cols-2">
          <CategoryList categories={expenses} title="Despesas" />
          <CategoryList categories={income} title="Receitas" />
        </section>
      </div>
    </div>
  )
}

function CategoryList({
  categories,
  title,
}: {
  categories: { id: string; name: string; userId: string | null }[]
  title: string
}) {
  return (
    <div className="glass-card p-5">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <div className="mt-4 divide-y divide-border/60">
        {categories.map((category) => (
          <div
            className="flex items-center justify-between gap-3 py-3"
            key={category.id}
          >
            <span>{category.name}</span>
            {category.userId ? (
              <form action={deleteCategory}>
                <input name="categoryId" type="hidden" value={category.id} />
                <button
                  className="text-sm font-semibold text-destructive"
                  type="submit"
                >
                  Excluir
                </button>
              </form>
            ) : (
              <span className="text-xs text-muted-foreground">Padrão</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
