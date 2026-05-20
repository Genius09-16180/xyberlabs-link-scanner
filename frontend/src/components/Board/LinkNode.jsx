// LinkNode.jsx — nodo board con handle, risk bar, drag funzionante
import { Handle, Position } from '@xyflow/react'
import { memo } from 'react'

const RISK = {
  LOW:      { border: 'rgba(0,255,153,.4)',   bg: 'rgba(0,255,153,.06)',   text: '#00FF99',  bar: '#00FF99'  },
  MEDIUM:   { border: 'rgba(245,200,66,.4)',  bg: 'rgba(245,200,66,.06)',  text: '#F5C842',  bar: '#F5C842'  },
  HIGH:     { border: 'rgba(255,122,64,.4)',  bg: 'rgba(255,122,64,.06)',  text: '#FF7A40',  bar: '#FF7A40'  },
  CRITICAL: { border: 'rgba(255,59,139,.4)',  bg: 'rgba(255,59,139,.06)',  text: '#FF3B8B',  bar: '#FF3B8B'  },
  UNKNOWN:  { border: 'rgba(255,255,255,.15)',bg: 'rgba(255,255,255,.03)', text: 'rgba(255,255,255,.4)', bar: 'rgba(255,255,255,.2)' },
}

const CAT_ICON = { safe:'✓', suspicious:'⚠', dangerous:'!', phishing:'⛔', tracker:'👁', ads:'📢', unknown:'?' }
const CAT_COLOR = { safe:'#00FF99', suspicious:'#F5C842', dangerous:'#FF7A40', phishing:'#FF3B8B', tracker:'#9B5FFF', ads:'#00E5FF', unknown:'rgba(255,255,255,.3)' }

const LinkNode = memo(({ data, selected }) => {
  const r = RISK[data.riskLevel] || RISK.UNKNOWN
  const score = Math.max(0, Math.min(10, data.riskScore || 0))

  return (
    <div style={{
      minWidth: '190px', maxWidth: '230px', position: 'relative',
      background: 'rgba(13,13,24,.92)',
      border: `1px solid ${selected ? 'rgba(0,229,255,.7)' : r.border}`,
      boxShadow: selected ? '0 0 0 1px rgba(0,229,255,.4), 0 0 24px rgba(0,229,255,.15)' : 'none',
      cursor: 'grab',
      userSelect: 'none',
    }}>
      {/* Handles — tutti e 4 i lati */}
      <Handle type="target" position={Position.Top}    style={{ top:-5, background:'rgba(0,229,255,.35)', border:'1px solid rgba(0,229,255,.6)', width:8, height:8, borderRadius:0 }} />
      <Handle type="source" position={Position.Bottom} style={{ bottom:-5, background:'rgba(0,229,255,.35)', border:'1px solid rgba(0,229,255,.6)', width:8, height:8, borderRadius:0 }} />
      <Handle type="target" position={Position.Left}   style={{ left:-5,  background:'rgba(0,229,255,.35)', border:'1px solid rgba(0,229,255,.6)', width:8, height:8, borderRadius:0 }} />
      <Handle type="source" position={Position.Right}  style={{ right:-5, background:'rgba(0,229,255,.35)', border:'1px solid rgba(0,229,255,.6)', width:8, height:8, borderRadius:0 }} />

      {/* Corner decoration */}
      <div style={{ position:'absolute', top:0, left:0, width:10, height:10, borderTop:`1.5px solid rgba(0,229,255,.5)`, borderLeft:`1.5px solid rgba(0,229,255,.5)`, pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:0, right:0, width:10, height:10, borderBottom:`1.5px solid rgba(0,229,255,.5)`, borderRight:`1.5px solid rgba(0,229,255,.5)`, pointerEvents:'none' }} />

      <div style={{ padding: '12px' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
          <span style={{ fontSize:'14px', flexShrink:0 }}>{CAT_ICON[data.category]||'?'}</span>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'11px', fontWeight:700, color:'rgba(255,255,255,.85)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {data.domain || data.url}
            </div>
          </div>
          <div style={{ fontFamily:'alfarn-2, sans-serif', fontSize:'18px', fontWeight:900, color:r.text, flexShrink:0, lineHeight:1 }}>
            {score}
          </div>
        </div>

        {/* Label */}
        {data.label && (
          <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'9px', color:'rgba(255,255,255,.45)', marginBottom:'6px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', padding:'3px 6px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.06)' }}>
            {data.label}
          </div>
        )}

        {/* Category badge */}
        <div style={{ display:'inline-flex', alignItems:'center', gap:'4px', padding:'2px 7px', background:`${CAT_COLOR[data.category]||'rgba(255,255,255,.1)'}12`, border:`1px solid ${CAT_COLOR[data.category]||'rgba(255,255,255,.1)'}30`, marginBottom:'8px' }}>
          <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'8px', color:CAT_COLOR[data.category]||'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{data.category||'unknown'}</span>
        </div>

        {/* Tags */}
        {data.tags?.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:'3px', marginBottom:'8px' }}>
            {data.tags.slice(0,4).map(tag => (
              <span key={tag} style={{ padding:'1px 5px', background:'rgba(0,229,255,.06)', border:'1px solid rgba(0,229,255,.15)', fontFamily:'JetBrains Mono, monospace', fontSize:'7px', color:'rgba(0,229,255,.6)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{tag}</span>
            ))}
          </div>
        )}

        {/* Risk bar */}
        <div style={{ height:'2px', background:'rgba(255,255,255,.06)', overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${score*10}%`, background:r.bar, transition:'width 0.3s' }} />
        </div>

        {/* URL mini */}
        <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'7px', color:'rgba(255,255,255,.2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginTop:'6px' }}>
          {data.url}
        </div>
      </div>
    </div>
  )
})

LinkNode.displayName = 'LinkNode'
export default LinkNode
