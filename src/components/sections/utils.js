export const fmt = (n, decimals = 2) =>
  n != null ? n.toFixed(decimals) : '—'

export const fmtPct = (n) =>
  n != null ? `${n.toFixed(1)}%` : '—'

export const fmtB = (n) => {
  if (n == null) return '—'
  const abs = Math.abs(n)
  if (abs >= 1e12) return `$${(n / 1e12).toFixed(1)}T`
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(1)}B`
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(0)}M`
  return `$${n.toLocaleString()}`
}
