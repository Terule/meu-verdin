'use client'

import { ArrowLeft } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

export function MobileBackButton() {
  const pathname = usePathname()
  const router = useRouter()

  if (pathname === '/app') return null

  function goBack() {
    const referrer = document.referrer
    const cameFromThisApp = referrer
      ? new URL(referrer).origin === window.location.origin
      : false

    if (cameFromThisApp && window.history.length > 1) {
      router.back()
      return
    }

    router.push('/app')
  }

  return (
    <button
      aria-label="Voltar para a página anterior"
      className="fixed right-3 top-3.5 z-30 inline-flex size-11 items-center justify-center gap-1 rounded-xl border border-border bg-card px-2 text-sm font-medium shadow-lg md:hidden"
      onClick={goBack}
      type="button"
    >
      <ArrowLeft className="size-5" />
      <span className="sr-only">Voltar</span>
    </button>
  )
}
