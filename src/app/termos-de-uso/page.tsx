import type { Metadata } from 'next'
import Link from 'next/link'

import { SiteFooter } from '@/components/site-footer'

export const metadata: Metadata = { title: 'Termos de Uso' }

export default function TermsPage() {
  return (
    <LegalPage title="Termos de Uso">
      <p>
        Estes Termos de Uso descrevem as regras para utilizar o Meu Verdin. O
        serviço é uma ferramenta de organização financeira pessoal e não oferece
        recomendação de investimento, crédito ou aconselhamento financeiro
        profissional.
      </p>
      <p>
        Você é responsável pelas informações registradas na sua conta e pelo uso
        seguro da sua conta Google. Podemos atualizar estes termos quando
        necessário, sempre indicando a data de vigência.
      </p>
      <p>
        O conteúdo jurídico definitivo deve ser revisado e aprovado pelo
        responsável legal antes da publicação em produção.
      </p>
    </LegalPage>
  )
}

export function LegalPage({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col px-5 py-8 sm:px-8">
      <header>
        <Link className="font-display text-lg font-bold" href="/">
          ← Meu Verdin
        </Link>
      </header>
      <article className="glass-card my-12 flex-1 p-7 sm:p-10">
        <p className="text-sm font-medium text-primary">
          Vigência: 2 de agosto de 2026
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">
          {title}
        </h1>
        <div className="mt-8 space-y-5 leading-7 text-muted-foreground">
          {children}
        </div>
      </article>
      <SiteFooter />
    </main>
  )
}
