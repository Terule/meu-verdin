'use client'

import { LoaderCircle } from 'lucide-react'
import { useState } from 'react'

import { signIn } from '@/lib/auth-client'

export function GoogleSignInButton() {
  const [pending, setPending] = useState(false)

  async function login() {
    setPending(true)
    await signIn.social({ provider: 'google', callbackURL: '/app' })
  }

  return (
    <button
      className="google-button"
      disabled={pending}
      onClick={login}
      type="button"
    >
      {pending ? (
        <LoaderCircle className="size-5 animate-spin" />
      ) : (
        <GoogleMark />
      )}
      {pending ? 'Redirecionando…' : 'Continuar com Google'}
    </button>
  )
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24">
      <path
        d="M21.35 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.52h3.15c1.84-1.7 2.9-4.2 2.9-7.3Z"
        fill="#4285F4"
      />
      <path
        d="M12 21.75c2.63 0 4.84-.87 6.45-2.36L15.3 16.9c-.89.6-2.02.96-3.3.96-2.54 0-4.69-1.71-5.46-4.02H3.3v2.6A9.75 9.75 0 0 0 12 21.75Z"
        fill="#34A853"
      />
      <path
        d="M6.54 13.84a5.87 5.87 0 0 1 0-3.68v-2.6H3.3a9.75 9.75 0 0 0 0 8.88l3.24-2.6Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.14c1.43 0 2.71.49 3.72 1.46l2.78-2.78C16.84 3.27 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.7 5.31l3.24 2.6C7.31 7.85 9.46 6.14 12 6.14Z"
        fill="#EA4335"
      />
    </svg>
  )
}
