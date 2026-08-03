import prisma from '@/lib/prisma'
import { requireUser } from '@/lib/session'

import { createCategory, deleteCategory } from '@/app/app/actions'
import { ActionModal } from '@/components/action-modal'

export default async function CategoriesPage() {
  const user = await requireUser()
  const categories = await prisma.category.findMany({
    where: { OR: [{ userId: null }, { userId: user.id }] },
    orderBy: [{ type: 'asc' }, { userId: 'asc' }, { name: 'asc' }],
  })
  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Classifique seus lançamentos
          </p>
          <h1 className="font-display text-3xl font-bold">Categorias</h1>
        </div>
        <ActionModal
          title="Adicionar categoria"
          triggerLabel="Adicionar categoria"
        >
          <form action={createCategory} className="space-y-3">
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
        </ActionModal>
      </header>
      <section className="grid gap-6 lg:grid-cols-2">
        <CategoryList
          categories={categories.filter(
            (category) => category.type === 'EXPENSE',
          )}
          title="Despesas"
        />
        <CategoryList
          categories={categories.filter(
            (category) => category.type === 'INCOME',
          )}
          title="Receitas"
        />
      </section>
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
              <ActionModal
                title="Excluir categoria"
                triggerLabel="Excluir"
                variant="danger"
              >
                <p className="mb-4 text-sm text-muted-foreground">
                  Esta ação não pode ser desfeita.
                </p>
                <form action={deleteCategory}>
                  <input name="categoryId" type="hidden" value={category.id} />
                  <button className="primary-button w-full" type="submit">
                    Confirmar exclusão
                  </button>
                </form>
              </ActionModal>
            ) : (
              <span className="text-xs text-muted-foreground">Padrão</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
