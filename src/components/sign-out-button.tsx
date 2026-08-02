'use client'

import { LogOut } from 'lucide-react'

import { signOut } from '@/lib/auth-client'

export function SignOutButton() {
  return (
    <button
      className="glass-button inline-flex h-10 items-center gap-2 px-3 text-sm"
      onClick={() =>
        signOut({
          fetchOptions: { onSuccess: () => window.location.assign('/') },
        })
      }
      type="button"
    >
      <LogOut className="size-4" /> Sair
    </button>
  )
}
