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

async function main() {
  for (const category of categories) {
    const existing = await prisma.category.findFirst({
      where: { userId: null, name: category.name, type: category.type },
    })

    if (!existing) await prisma.category.create({ data: category })
  }
}

main().finally(async () => {
  await prisma.$disconnect()
  await pool.end()
})
