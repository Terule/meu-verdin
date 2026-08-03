'use client'

import {
  Landmark,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  ReceiptText,
  Tags,
  UsersRound,
  WalletCards,
  X,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { SignOutButton } from '@/components/sign-out-button'
import { ThemeToggle } from '@/components/theme-toggle'

const navigation = [
  { href: '/app', label: 'Visão geral', icon: LayoutDashboard },
  { href: '/app/lancamentos', label: 'Lançamentos', icon: ReceiptText },
  { href: '/app/contas', label: 'Contas', icon: Landmark },
  { href: '/app/orcamentos', label: 'Orçamentos', icon: WalletCards },
  { href: '/app/categorias', label: 'Categorias', icon: Tags },
  { href: '/app/juntos', label: 'Juntos', icon: UsersRound },
]

type SidebarUser = {
  image: string | null
  name: string
  subscriptionPlan: string | null
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function shortName(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).join(' ') || 'Usuário'
}

function UserAvatar({ user }: { user: SidebarUser }) {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = Boolean(user.image) && !imageFailed

  return (
    <span className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-primary/15 text-xs font-bold text-primary">
      {showImage ? (
        <Image
          alt=""
          className="size-full object-cover"
          fill
          onError={() => setImageFailed(true)}
          sizes="36px"
          src={user.image as string}
        />
      ) : (
        initials(user.name)
      )}
    </span>
  )
}

function SidebarContent({
  collapsed,
  onNavigate,
  user,
}: {
  collapsed: boolean
  onNavigate?: () => void
  user: SidebarUser
}) {
  const pathname = usePathname()
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const profileButtonRef = useRef<HTMLButtonElement>(null)
  const plan =
    user.subscriptionPlan === 'FREE' || !user.subscriptionPlan
      ? 'Gratuito'
      : user.subscriptionPlan

  useEffect(() => {
    if (!profileMenuOpen) return

    function closeOnOutsideClick(event: MouseEvent) {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setProfileMenuOpen(false)
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      setProfileMenuOpen(false)
      profileButtonRef.current?.focus()
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [profileMenuOpen])

  return (
    <>
      <div className="flex h-16 items-center gap-3 px-4">
        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary font-display font-bold text-primary-foreground">
          V
        </div>
        {!collapsed ? (
          <span className="font-display text-lg font-bold">Meu Verdin</span>
        ) : null}
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {navigation.map((item) => {
          const active =
            item.href === '/app'
              ? pathname === item.href
              : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              aria-current={active ? 'page' : undefined}
              aria-label={item.label}
              className={`group text-sm font-medium transition ${collapsed ? 'mx-auto grid size-11 place-items-center rounded-xl' : 'flex h-11 items-center gap-3 rounded-xl px-3'} ${active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`}
              href={item.href}
              key={item.href}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="size-5 shrink-0" />
              <span className={collapsed ? 'sr-only' : ''}>{item.label}</span>
            </Link>
          )
        })}
      </nav>
      <div
        className="relative border-t border-sidebar-border p-3"
        ref={profileMenuRef}
      >
        {profileMenuOpen ? (
          <div
            aria-label="Menu do perfil"
            className="absolute bottom-full left-3 right-3 z-20 mb-2 rounded-xl border border-sidebar-border bg-sidebar p-2 shadow-xl"
            id="profile-menu"
            role="menu"
          >
            <div className="flex items-center justify-between gap-3 px-2 py-1">
              <span className="text-sm font-medium">Tema</span>
              <ThemeToggle />
            </div>
            <div className="mt-1 border-t border-sidebar-border pt-1">
              <SignOutButton />
            </div>
          </div>
        ) : null}
        <button
          aria-controls="profile-menu"
          aria-expanded={profileMenuOpen}
          aria-haspopup="menu"
          className={`flex w-full items-center rounded-xl py-2 transition hover:bg-sidebar-accent ${collapsed ? 'justify-center px-0' : 'gap-3 px-2 text-left'}`}
          onClick={() => setProfileMenuOpen((open) => !open)}
          ref={profileButtonRef}
          type="button"
        >
          <UserAvatar user={user} />
          {!collapsed ? (
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">
                {shortName(user.name)}
              </span>
              <span className="block text-xs text-sidebar-foreground/60">
                {plan}
              </span>
            </span>
          ) : null}
        </button>
      </div>
    </>
  )
}

export function AppSidebar({ user }: { user: SidebarUser }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  useEffect(() => {
    setCollapsed(
      localStorage.getItem('meu-verdin-sidebar-collapsed') === 'true',
    )
  }, [])
  function toggle() {
    setCollapsed((value) => {
      const next = !value
      localStorage.setItem('meu-verdin-sidebar-collapsed', String(next))
      return next
    })
  }
  return (
    <>
      <button
        aria-label="Abrir navegação"
        className="fixed left-4 top-4 z-30 grid size-10 place-items-center rounded-xl border border-border bg-card shadow-lg md:hidden"
        onClick={() => setMobileOpen(true)}
        type="button"
      >
        <Menu className="size-5" />
      </button>
      <aside
        className={`sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:flex ${collapsed ? 'w-20' : 'w-64'}`}
      >
        <button
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          className="absolute -right-4 top-6 z-10 grid size-8 place-items-center rounded-full border border-sidebar-border bg-sidebar shadow-sm"
          onClick={toggle}
          type="button"
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </button>
        <SidebarContent collapsed={collapsed} user={user} />
      </aside>
      {mobileOpen ? (
        <>
          <button
            aria-label="Fechar navegação"
            className="fixed inset-0 z-40 bg-foreground/30 md:hidden"
            onClick={() => setMobileOpen(false)}
            type="button"
          />
          <aside
            aria-label="Navegação"
            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-sidebar text-sidebar-foreground shadow-2xl md:hidden"
          >
            <button
              aria-label="Fechar navegação"
              className="absolute left-60 top-5 grid size-9 place-items-center rounded-xl bg-sidebar-accent"
              onClick={() => setMobileOpen(false)}
              type="button"
            >
              <X className="size-5" />
            </button>
            <SidebarContent
              collapsed={false}
              onNavigate={() => setMobileOpen(false)}
              user={user}
            />
          </aside>
        </>
      ) : null}
    </>
  )
}
