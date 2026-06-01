import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'

const CONFIG = {
  YES:         { icon: CheckCircle, bg: 'bg-emerald-50', border: 'border-emerald-200', iconColor: 'text-emerald-500', textColor: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', label: 'BUY' },
  CONDITIONAL: { icon: AlertCircle, bg: 'bg-amber-50',   border: 'border-amber-200',   iconColor: 'text-amber-500',   textColor: 'text-amber-700',   badge: 'bg-amber-100 text-amber-700',   label: 'CONDITIONAL' },
  NO:          { icon: XCircle,     bg: 'bg-red-50',     border: 'border-red-200',     iconColor: 'text-red-500',     textColor: 'text-red-700',     badge: 'bg-red-100 text-red-700',       label: 'AVOID' },
  HOLD:        { icon: Clock,       bg: 'bg-blue-50',    border: 'border-blue-200',    iconColor: 'text-blue-500',    textColor: 'text-blue-700',    badge: 'bg-blue-100 text-blue-700',     label: 'HOLD' },
}

export default function DecisionBanner({ decision, quote, halalStatus, notionSaved }) {
  const cfg  = CONFIG[decision.decision] ?? CONFIG.HOLD
  const Icon = cfg.icon

  return (
    <div className={`card p-4 sm:p-6 ${cfg.bg} border ${cfg.border} animate-fade-in`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Icon className={cfg.iconColor} size={30} strokeWidth={1.5} />
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`font-display text-3xl sm:text-4xl font-bold ${cfg.textColor}`}>{cfg.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.badge}`}>
                {decision.confidence} confidence
              </span>
            </div>
            <p className="text-slate-600 text-xs sm:text-sm leading-snug">{decision.reason}</p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-xl sm:text-2xl font-display font-bold text-slate-900">${quote?.price?.toFixed(2)}</div>
          <div className="text-slate-400 text-xs mb-1">{quote?.ticker}</div>
          <HalalBadge status={halalStatus} />
        </div>
      </div>

      {notionSaved && (
        <div className="mt-4 pt-4 border-t border-black/5 flex items-center gap-2 text-slate-400 text-xs">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Saved to Notion
        </div>
      )}
    </div>
  )
}

function HalalBadge({ status }) {
  const map = {
    Halal:           'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Non-Compliant': 'bg-red-100 text-red-700 border-red-200',
    Questionable:    'bg-amber-100 text-amber-700 border-amber-200',
    Unknown:         'bg-slate-100 text-slate-600 border-slate-200',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${map[status] ?? map.Unknown}`}>
      {status === 'Halal' ? '☪ ' : ''}{status}
    </span>
  )
}
