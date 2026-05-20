// components/Board/LinkNode.jsx — Custom React Flow node
import { Handle, Position } from '@xyflow/react'

const RISK_COLORS = {
  LOW:      { border: 'border-neon/40',   bg: 'bg-neon/5',   text: 'text-neon'   },
  MEDIUM:   { border: 'border-gold/40',   bg: 'bg-gold/5',   text: 'text-gold'   },
  HIGH:     { border: 'border-orange/40', bg: 'bg-orange/5', text: 'text-orange' },
  CRITICAL: { border: 'border-pink/40',   bg: 'bg-pink/5',   text: 'text-pink'   },
  UNKNOWN:  { border: 'border-white/20',  bg: 'bg-white/3',  text: 'text-white/40'},
}

const CAT_ICONS = {
  safe: '✓', suspicious: '⚠', dangerous: '!', phishing: '⛔',
  tracker: '👁', ads: '📢', unknown: '?',
}

export default function LinkNode({ data, selected }) {
  const colors = RISK_COLORS[data.riskLevel] || RISK_COLORS.UNKNOWN

  return (
    <div
      className={`min-w-[180px] max-w-[220px] rounded-2xl border backdrop-blur-xl transition-all cursor-pointer ${colors.border} ${colors.bg} ${
        selected ? 'shadow-[0_0_0_2px_rgba(0,229,255,.5),0_0_30px_rgba(0,229,255,.15)]' : ''
      }`}
      style={{ background: 'rgba(13,13,24,.85)' }}
    >
      {/* Handles */}
      <Handle type="target" position={Position.Top}    style={{ top: -5 }} />
      <Handle type="source" position={Position.Bottom} style={{ bottom: -5 }} />
      <Handle type="target" position={Position.Left}   style={{ left: -5 }} />
      <Handle type="source" position={Position.Right}  style={{ right: -5 }} />

      <div className="p-3">
        {/* Header row */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base">{CAT_ICONS[data.category] || '?'}</span>
          <div className="flex-1 min-w-0">
            <div className="font-mono font-bold text-[11px] text-white/80 truncate">{data.domain}</div>
          </div>
          <div className={`font-title font-black text-sm ${colors.text}`}>{data.riskScore}</div>
        </div>

        {/* Label */}
        {data.label && (
          <div className="font-mono text-[9px] text-white/40 mb-2 truncate">{data.label}</div>
        )}

        {/* URL */}
        <div className="font-mono text-[8px] text-white/20 truncate mb-2">{data.url}</div>

        {/* Tags */}
        {data.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {data.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[7px] text-white/30">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Risk bar */}
        <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${colors.text.replace('text-', 'bg-')}`}
            style={{ width: `${(data.riskScore || 0) * 10}%` }}
          />
        </div>
      </div>
    </div>
  )
}
