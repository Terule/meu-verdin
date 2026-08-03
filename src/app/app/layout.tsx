import prisma from '@/lib/prisma'
import { requireUser } from '@/lib/session'

import { AppSidebar } from '@/components/app-sidebar'
import { QueryProvider } from '@/components/query-provider'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireUser()
  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { subscriptionPlan: true },
  })
  return (
    <QueryProvider>
      <div className="min-h-dvh md:flex">
        <AppSidebar
          user={{
            image: user.image ?? null,
            name: user.name,
            subscriptionPlan: profile?.subscriptionPlan ?? 'FREE',
          }}
        />
        <main className="min-w-0 flex-1 px-5 pb-8 pt-20 md:px-8 md:pt-8 xl:px-12">
          {children}
        </main>
      </div>
    </QueryProvider>
  )
}
