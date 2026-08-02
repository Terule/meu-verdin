import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getCurrentUser } from '@/lib/session'
import { createUploadUrl } from '@/lib/storage'

const requestSchema = z.object({
  contentType: z.string(),
  size: z.number().int().positive(),
})

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }
  const result = requestSchema.safeParse(await request.json())

  if (!result.success) {
    return NextResponse.json({ error: 'Arquivo inválido.' }, { status: 400 })
  }

  try {
    return NextResponse.json(
      await createUploadUrl({ userId: user.id, ...result.data }),
    )
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Não foi possível enviar o arquivo.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
