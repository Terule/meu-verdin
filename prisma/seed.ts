import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv'
import { Pool } from 'pg'

import { PrismaClient } from '../src/generated/prisma/client'

dotenv.config({ path: ['.env.local', '.env'] })

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

const categories = [
  { name: 'Alimentação', icon: 'utensils', type: 'EXPENSE' },
  { name: 'Moradia', icon: 'house', type: 'EXPENSE' },
  { name: 'Transporte', icon: 'car', type: 'EXPENSE' },
  { name: 'Lazer', icon: 'sparkles', type: 'EXPENSE' },
  { name: 'Saúde', icon: 'heart-pulse', type: 'EXPENSE' },
  { name: 'Salário', icon: 'wallet-cards', type: 'INCOME' },
  { name: 'Outros rendimentos', icon: 'plus-circle', type: 'INCOME' },
]

const institutions = [
  ['banco-do-brasil', 'Banco do Brasil', 'BANK', 'landmark'],
  ['caixa', 'Caixa', 'BANK', 'landmark'],
  ['itau', 'Itaú', 'BANK', 'landmark'],
  ['bradesco', 'Bradesco', 'BANK', 'landmark'],
  ['santander', 'Santander', 'BANK', 'landmark'],
  ['nubank', 'Nubank', 'PAYMENT_INSTITUTION', 'building-2'],
  ['inter', 'Inter', 'PAYMENT_INSTITUTION', 'building-2'],
  ['c6-bank', 'C6 Bank', 'PAYMENT_INSTITUTION', 'building-2'],
  ['btg-pactual', 'BTG Pactual', 'BANK', 'landmark'],
  ['xp', 'XP Investimentos', 'BROKERAGE', 'chart-no-axes-combined'],
  ['rico', 'Rico', 'BROKERAGE', 'chart-no-axes-combined'],
  ['mercado-pago', 'Mercado Pago', 'PAYMENT_INSTITUTION', 'building-2'],
  ['picpay', 'PicPay', 'PAYMENT_INSTITUTION', 'building-2'],
  ['caju', 'Caju', 'BENEFITS', 'gift'],
  ['flash', 'Flash', 'BENEFITS', 'gift'],
  ['ifood-beneficios', 'iFood Benefícios', 'BENEFITS', 'gift'],
  ['swile', 'Swile', 'BENEFITS', 'gift'],
  ['ticket', 'Ticket', 'BENEFITS', 'gift'],
] as const

async function main() {
  for (const category of categories) {
    const existing = await prisma.category.findFirst({
      where: { userId: null, name: category.name, type: category.type },
    })

    if (!existing) await prisma.category.create({ data: category })
  }

  for (const [slug, name, kind, icon] of institutions) {
    await prisma.institution.upsert({
      where: { slug },
      create: { slug, name, kind, icon },
      update: { name, kind, icon },
    })
  }
}

main().finally(async () => {
  await prisma.$disconnect()
  await pool.end()
})
