const numberFormat = new Intl.NumberFormat('es-ES', { useGrouping: 'always' })

export const formatNumber = (n: number) => numberFormat.format(n)

/** `0.18` → «+18 %». */
export const formatEffect = (effect: number) =>
  `${effect > 0 ? '+' : effect < 0 ? '−' : ''}${Math.round(Math.abs(effect) * 100)} %`

/** `228` → «+228», `-48` → «−48». */
export const formatSigned = (n: number) =>
  `${n > 0 ? '+' : n < 0 ? '−' : ''}${formatNumber(Math.abs(n))}`

export const formatTime = (date: Date) =>
  date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

export const formatLongDate = (date: Date) =>
  date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })

/** Tiempo restante legible: «1 h 20 min», «45 min». */
export function formatTimeLeft(ms: number) {
  if (ms <= 0) return 'cerrado'
  const totalMinutes = Math.floor(ms / 60_000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes} min`
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`
}
