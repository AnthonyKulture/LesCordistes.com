const MONTHS_FR = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']

export function formatMonthShort(ym: string): string {
  const m = Number(ym.slice(5, 7))
  return MONTHS_FR[m - 1] ?? ym
}

export function formatMonthFull(ym: string): string {
  return `${formatMonthShort(ym)} ${ym.slice(0, 4)}`
}

// Séries hebdomadaires : la clé est un lundi ISO (YYYY-MM-DD). Le formateur
// mensuel afficherait « sept. » sur quatre points consécutifs.
export function formatWeekShort(iso: string): string {
  const day = Number(iso.slice(8, 10))
  const month = MONTHS_FR[Number(iso.slice(5, 7)) - 1]
  if (!month || Number.isNaN(day)) return iso
  return `${day} ${month}`
}

export function formatWeekFull(iso: string): string {
  const short = formatWeekShort(iso)
  return short === iso ? iso : `semaine du ${short} ${iso.slice(0, 4)}`
}

export function formatNumberFr(value: number): string {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value)
}

function niceCeil(value: number): number {
  if (value <= 0) return 1
  const exp = Math.floor(Math.log10(value))
  const base = Math.pow(10, exp)
  const mant = value / base
  const nice = mant <= 1 ? 1 : mant <= 2 ? 2 : mant <= 5 ? 5 : 10
  return nice * base
}

export function buildScale(maxValue: number): { top: number; ticks: number[] } {
  if (maxValue <= 0) return { top: 4, ticks: [0, 1, 2, 3, 4] }
  const step = Math.max(niceCeil(maxValue / 4), 1)
  const top = step * Math.ceil(maxValue / step)
  const ticks: number[] = []
  for (let v = 0; v <= top + step / 2; v += step) ticks.push(v)
  return { top, ticks }
}

export const SERIES_COLOR = '#5B8DDB'
