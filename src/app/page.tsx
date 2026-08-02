import {
  ArrowRight,
  BadgeCheck,
  ChartNoAxesCombined,
  Leaf,
  ShieldCheck,
} from 'lucide-react'
import Link from 'next/link'

import { GoogleSignInButton } from '@/components/google-sign-in-button'
import { SiteFooter } from '@/components/site-footer'
import { ThemeToggle } from '@/components/theme-toggle'

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col px-5 py-6 sm:px-8">
      <header className="flex items-center justify-between">
        <Link
          className="flex items-center gap-2 font-display text-lg font-bold tracking-tight"
          href="/"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Leaf className="size-5" />
          </span>
          Meu Verdin
        </Link>
        <ThemeToggle />
      </header>
      <section className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[1.1fr_.9fr] lg:py-20">
        <div className="max-w-2xl">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
            <BadgeCheck className="size-4" /> Seu dinheiro, com mais clareza
          </p>
          <h1 className="font-display text-5xl font-bold tracking-[-0.045em] text-balance sm:text-6xl">
            Planeje o agora. Veja seu futuro florescer.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            Um lugar sereno para acompanhar gastos, organizar orçamentos e tomar
            decisões melhores para a sua vida financeira.
          </p>
          <div className="mt-9 max-w-sm">
            <GoogleSignInButton />
          </div>
          <p className="mt-4 max-w-sm text-center text-xs leading-5 text-muted-foreground">
            Ao continuar, você concorda com os{' '}
            <Link
              className="underline hover:text-foreground"
              href="/termos-de-uso"
            >
              Termos de Uso
            </Link>{' '}
            e a{' '}
            <Link
              className="underline hover:text-foreground"
              href="/politica-de-privacidade"
            >
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
        <div className="glass-card relative overflow-hidden p-7 sm:p-9">
          <div className="absolute -right-16 -top-16 size-48 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Visão do mês</p>
              <ChartNoAxesCombined className="size-5 text-primary" />
            </div>
            <p className="mt-4 font-display text-4xl font-bold">R$ 2.480,00</p>
            <p className="mt-1 text-sm text-primary">
              + 12% de saldo disponível
            </p>
            <div className="mt-8 space-y-4">
              {[
                ['Orçamento mensal', '72%'],
                ['Gastos essenciais', '48%'],
                ['Objetivos', '85%'],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>{label}</span>
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: value }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex items-center gap-3 rounded-2xl bg-primary/10 p-4 text-sm">
              <ShieldCheck className="size-5 shrink-0 text-primary" /> Seus
              dados financeiros são privados e protegidos.
            </div>
          </div>
        </div>
      </section>
      <div className="mb-6 flex justify-center">
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          href="/app"
        >
          Já entrou? Abrir meu painel <ArrowRight className="size-4" />
        </Link>
      </div>
      <SiteFooter />
    </main>
  )
}
