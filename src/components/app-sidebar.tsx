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
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
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

const sidebarSpring = { damping: 26, stiffness: 260, type: 'spring' } as const
const contentTransition = {
  duration: 0.18,
  ease: [0.22, 1, 0.36, 1],
} as const

type SidebarUser = {
  email: string
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
  const reduceMotion = useReducedMotion()
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
      <div className="h-16 px-3">
        <div className="grid h-full grid-cols-[3.5rem_minmax(0,1fr)] items-center">
          <div className="grid size-9 justify-self-center place-items-center rounded-xl bg-primary font-display font-bold text-primary-foreground">
            V
          </div>
          <AnimatePresence initial={false}>
            {!collapsed ? (
              <motion.span
                animate={{ opacity: 1, x: 0 }}
                className="overflow-hidden whitespace-nowrap font-display text-lg font-bold"
                exit={{ opacity: 0, x: -10 }}
                initial={{ opacity: 0, x: -10 }}
                transition={reduceMotion ? { duration: 0 } : contentTransition}
              >
                Meu Verdin
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>
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
              className={`group relative grid h-11 w-full grid-cols-[3.5rem_minmax(0,1fr)] items-center overflow-hidden rounded-xl text-sm font-medium ${active ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground/70 hover:text-sidebar-accent-foreground'}`}
              href={item.href}
              key={item.href}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
            >
              <motion.span
                animate={{ left: collapsed ? 6 : 0, right: collapsed ? 6 : 0 }}
                aria-hidden="true"
                className={`absolute inset-y-0 rounded-xl transition-colors ${active ? 'bg-sidebar-accent' : 'group-hover:bg-sidebar-accent'}`}
                transition={reduceMotion ? { duration: 0 } : sidebarSpring}
              />
              <span className="relative z-10 grid h-full place-items-center">
                <Icon className="size-5 shrink-0" />
              </span>
              <AnimatePresence initial={false}>
                {!collapsed ? (
                  <motion.span
                    animate={{ opacity: 1, x: 0 }}
                    className="relative z-10 overflow-hidden whitespace-nowrap"
                    exit={{ opacity: 0, x: -8 }}
                    initial={{ opacity: 0, x: -8 }}
                    transition={
                      reduceMotion ? { duration: 0 } : contentTransition
                    }
                  >
                    {item.label}
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </Link>
          )
        })}
      </nav>
      <div
        className="relative border-t border-sidebar-border p-3"
        ref={profileMenuRef}
      >
        <AnimatePresence>
          {profileMenuOpen ? (
            <motion.div
              animate={{ opacity: 1, scale: 1, y: 0 }}
              aria-label="Menu do perfil"
              className={`absolute z-20 rounded-xl border border-sidebar-border bg-sidebar p-2 shadow-xl ${collapsed ? 'bottom-3 left-full ml-2 w-52 origin-bottom-left' : 'bottom-full left-3 right-3 mb-2 origin-bottom'}`}
              exit={{ opacity: 0, scale: 0.97, y: 6 }}
              id="profile-menu"
              initial={{ opacity: 0, scale: 0.97, y: 6 }}
              role="menu"
              transition={reduceMotion ? { duration: 0 } : contentTransition}
            >
              <div className="flex items-center gap-3 px-2 py-2">
                <UserAvatar user={user} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{user.name}</p>
                  <p className="truncate text-xs text-sidebar-foreground/60">
                    {user.email}
                  </p>
                  <p className="mt-1 text-xs font-medium text-primary">
                    Licença {plan}
                  </p>
                </div>
              </div>
              <div className="mt-1 flex items-center justify-between border-t border-sidebar-border px-2 pt-2">
                <ThemeToggle />
                <SignOutButton />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
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
          <AnimatePresence initial={false}>
            {!collapsed ? (
              <motion.span
                animate={{ opacity: 1, x: 0 }}
                className="min-w-0"
                exit={{ opacity: 0, x: -8 }}
                initial={{ opacity: 0, x: -8 }}
                transition={reduceMotion ? { duration: 0 } : contentTransition}
              >
                <span className="block truncate text-sm font-semibold">
                  {shortName(user.name)}
                </span>
                <span className="block text-xs text-sidebar-foreground/60">
                  {plan}
                </span>
              </motion.span>
            ) : null}
          </AnimatePresence>
        </button>
      </div>
    </>
  )
}

export function AppSidebar({ user }: { user: SidebarUser }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const reduceMotion = useReducedMotion()
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
      <motion.aside
        animate={{ width: collapsed ? 80 : 256 }}
        className="sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex"
        initial={false}
        transition={reduceMotion ? { duration: 0 } : sidebarSpring}
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
      </motion.aside>
      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.button
              animate={{ opacity: 1 }}
              aria-label="Fechar navegação"
              className="fixed inset-0 z-40 bg-foreground/30 md:hidden"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              type="button"
            />
            <motion.aside
              animate={{ x: 0 }}
              aria-label="Navegação"
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-sidebar text-sidebar-foreground shadow-2xl md:hidden"
              exit={{ x: '-100%' }}
              initial={{ x: '-100%' }}
              transition={reduceMotion ? { duration: 0 } : sidebarSpring}
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
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  )
}
