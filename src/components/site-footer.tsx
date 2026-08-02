import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
      <span>© {new Date().getFullYear()} Meu Verdin</span>
      <Link className="hover:text-foreground" href="/termos-de-uso">
        Termos de Uso
      </Link>
      <Link className="hover:text-foreground" href="/politica-de-privacidade">
        Política de Privacidade
      </Link>
    </footer>
  )
}
