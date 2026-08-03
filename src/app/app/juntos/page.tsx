import { HeartHandshake } from 'lucide-react'

export default function TogetherPage() {
  return (
    <div className="mx-auto grid min-h-[60vh] w-full max-w-3xl place-items-center">
      <section className="glass-card max-w-xl p-8 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/15 text-primary">
          <HeartHandshake className="size-7" />
        </span>
        <p className="mt-6 text-sm font-semibold text-primary">EM BREVE</p>
        <h1 className="mt-2 font-display text-3xl font-bold">Juntos</h1>
        <p className="mt-4 text-muted-foreground">
          Um espaço para casais organizarem despesas, objetivos e decisões
          financeiras em conjunto — no ritmo de vocês.
        </p>
      </section>
    </div>
  )
}
