'use client'

import { Plus, X } from 'lucide-react'
import { useRef } from 'react'

type ActionModalProps = {
  children: React.ReactNode
  description?: string
  title: string
  triggerLabel: string
  variant?: 'danger' | 'primary' | 'secondary'
}

export function ActionModal({
  children,
  description,
  title,
  triggerLabel,
  variant = 'primary',
}: ActionModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const triggerClass =
    variant === 'danger'
      ? 'text-sm font-semibold text-destructive'
      : variant === 'secondary'
        ? 'secondary-button'
        : 'primary-button inline-flex items-center gap-2'
  function close() {
    dialogRef.current?.close()
    triggerRef.current?.focus()
  }
  return (
    <>
      <button
        className={triggerClass}
        onClick={() => dialogRef.current?.showModal()}
        ref={triggerRef}
        type="button"
      >
        {variant === 'primary' ? <Plus className="size-4" /> : null}
        {triggerLabel}
      </button>
      <dialog
        aria-labelledby={`${title}-title`}
        className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-3xl border border-border bg-popover p-0 text-popover-foreground shadow-2xl backdrop:bg-foreground/35"
        onClick={(event) => {
          if (event.target === dialogRef.current) close()
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') close()
        }}
        ref={dialogRef}
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                className="font-display text-xl font-bold"
                id={`${title}-title`}
              >
                {title}
              </h2>
              {description ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>
            <button
              aria-label="Fechar"
              className="glass-button grid size-9 place-items-center"
              onClick={close}
              type="button"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="mt-5">{children}</div>
        </div>
      </dialog>
    </>
  )
}
