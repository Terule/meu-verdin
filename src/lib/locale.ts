const locale = 'pt-BR'
const timeZone = 'America/Sao_Paulo'

export function formatCurrency(valueInCents: bigint | number) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(valueInCents) / 100)
}

export function formatDate(value: Date) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeZone,
  }).format(value)
}

export function parseCurrencyToCents(value: string) {
  const normalized = value.trim().replace(/\./g, '').replace(',', '.')
  const amount = Number(normalized.replace(/[^0-9.-]/g, ''))

  if (!Number.isFinite(amount)) throw new Error('Valor inválido.')
  return BigInt(Math.round(amount * 100))
}

export function getMonthRange(reference = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
  }).formatToParts(reference)
  const year = Number(parts.find((part) => part.type === 'year')?.value)
  const month = Number(parts.find((part) => part.type === 'month')?.value)

  return {
    month,
    year,
    start: new Date(Date.UTC(year, month - 1, 1)),
    end: new Date(Date.UTC(year, month, 1)),
  }
}
