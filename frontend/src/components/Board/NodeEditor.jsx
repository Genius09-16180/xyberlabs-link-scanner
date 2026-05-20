// NodeEditor.jsx — pannello edit inline styles, no border bianchi
import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Trash2, Tag, Save, ExternalLink } from 'lucide-react'

const CATS = ['safe','suspicious','dangerous','phishing','tracker','ads','unknown']
const CAT_C = {
  safe:'#00FF99', suspicious:'#F5C842', dangerous:'#FF7A40',
  phishing:'#FF3B8B', tracker:'#9B5FFF', ads:'#00E5FF', unknown:'rgba(255,255,255,.3)',
}

export default function NodeEditor({ node, onClose, onUpdate, onDelete }) {
  const [label,    setLabel]    = useState(node.label    || '')
  const [category, setCategory] = useState(node.category || 'unknown')
  const [tagInput, setTagInput] = useState('')
  const [tags,     setTags]     = useState(node.tags     || [])

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !tags.includes(t) && tags.length < 10) { setTags(p => [...p, t]); setTagInput('') }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      style={{
        position: 'absolute', right: '12px', top: '12px', bottom: '12px',
        width: '280px', zIndex: 20, display: 'flex', flexDirection: 'column',
        background: 'rgba(11,11,20,.97)', backdropFilter: 'blur(28px)',
        border: '1px solid rgba(255,255,255,.08)',
        boxShadow: '-12px 0 40px rgba(0,0,0,.5)',
      }}
    >
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px 14px', borderBottom:'1px solid rgba(255,255,255,.06)', flexShrink:0 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'8px', color:'rgba(255,255,255,.25)', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'2px' }}>Modifica nodo</div>
          <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'11px', fontWeight:700, color:'rgba(255,255,255,.7)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{node.domain || node.url}</div>
        </div>
        <button onClick={onClose} style={{ width:'28px', height:'28px', background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.5)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}
          onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,59,139,.15)'; e.currentTarget.style.color='#FF3B8B' }}
          onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,.05)'; e.currentTarget.style.color='rgba(255,255,255,.5)' }}>
          <X size={14} />
        </button>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'14px', display:'flex', flexDirection:'column', gap:'16px' }}>

        {/* URL */}
        <div>
          <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'8px', color:'rgba(255,255,255,.2)', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'6px' }}>URL</div>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 10px', background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.06)' }}>
            <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'9px', color:'rgba(255,255,255,.35)', wordBreak:'break-all', flex:1 }}>{node.url}</span>
            <a href={node.url} target="_blank" rel="noopener noreferrer" style={{ flexShrink:0, color:'rgba(255,255,255,.2)', display:'flex' }}
              onMouseEnter={e=>e.currentTarget.style.color='#00E5FF'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,.2)'}>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Label */}
        <div>
          <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'8px', color:'rgba(255,255,255,.2)', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'6px' }}>Etichetta</div>
          <input value={label} onChange={e=>setLabel(e.target.value)} placeholder="Aggiungi etichetta..."
            style={{ width:'100%', background:'rgba(20,20,34,.8)', border:'1px solid rgba(255,255,255,.1)', padding:'8px 10px', fontFamily:'JetBrains Mono, monospace', fontSize:'11px', color:'rgba(255,255,255,.75)', outline:'none', boxSizing:'border-box' }}
            onFocus={e=>e.target.style.borderColor='rgba(0,229,255,.4)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.1)'} />
        </div>

        {/* Category */}
        <div>
          <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'8px', color:'rgba(255,255,255,.2)', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'8px' }}>Categoria</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5px' }}>
            {CATS.map(cat => {
              const active = category === cat
              const c = CAT_C[cat]
              return (
                <button key={cat} onClick={()=>setCategory(cat)} style={{
                  padding:'6px 4px', cursor:'pointer', textAlign:'center',
                  fontFamily:'JetBrains Mono, monospace', fontSize:'8px', fontWeight:700,
                  textTransform:'uppercase', letterSpacing:'0.08em',
                  background: active ? `${c}14` : 'rgba(255,255,255,.03)',
                  border: `1px solid ${active ? `${c}44` : 'rgba(255,255,255,.08)'}`,
                  color: active ? c : 'rgba(255,255,255,.3)',
                  transition:'all 0.15s',
                }}
                  onMouseEnter={e=>{ if(!active){ e.currentTarget.style.borderColor=`${c}30`; e.currentTarget.style.color=c }}}
                  onMouseLeave={e=>{ if(!active){ e.currentTarget.style.borderColor='rgba(255,255,255,.08)'; e.currentTarget.style.color='rgba(255,255,255,.3)' }}}>
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tags */}
        <div>
          <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'8px', color:'rgba(255,255,255,.2)', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'6px' }}>Tag</div>
          <div style={{ display:'flex', gap:'6px', marginBottom:'8px' }}>
            <input value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addTag()} placeholder="Nuovo tag..."
              style={{ flex:1, background:'rgba(20,20,34,.8)', border:'1px solid rgba(255,255,255,.1)', padding:'7px 10px', fontFamily:'JetBrains Mono, monospace', fontSize:'10px', color:'rgba(255,255,255,.7)', outline:'none', boxSizing:'border-box' }}
              onFocus={e=>e.target.style.borderColor='rgba(0,229,255,.4)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.1)'} />
            <button onClick={addTag} style={{ padding:'0 12px', background:'rgba(0,229,255,.08)', border:'1px solid rgba(0,229,255,.25)', color:'#00E5FF', cursor:'pointer', display:'flex', alignItems:'center' }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(0,229,255,.18)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(0,229,255,.08)'}>
              <Tag size={12} />
            </button>
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'5px' }}>
            {tags.map(tag => (
              <span key={tag} onClick={()=>setTags(p=>p.filter(t=>t!==tag))} style={{ display:'flex', alignItems:'center', gap:'4px', padding:'3px 8px', background:'rgba(0,229,255,.06)', border:'1px solid rgba(0,229,255,.18)', fontFamily:'JetBrains Mono, monospace', fontSize:'9px', color:'rgba(0,229,255,.7)', cursor:'pointer' }}
                onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,59,139,.08)'; e.currentTarget.style.borderColor='rgba(255,59,139,.3)'; e.currentTarget.style.color='#FF3B8B' }}
                onMouseLeave={e=>{ e.currentTarget.style.background='rgba(0,229,255,.06)'; e.currentTarget.style.borderColor='rgba(0,229,255,.18)'; e.currentTarget.style.color='rgba(0,229,255,.7)' }}>
                {tag} <X size={8} />
              </span>
            ))}
          </div>
        </div>

        {/* Risk readout */}
        {node.riskScore !== undefined && (
          <div style={{ padding:'12px', background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.05)' }}>
            <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'8px', color:'rgba(255,255,255,.2)', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'6px' }}>Risk Score</div>
            <div style={{ display:'flex', alignItems:'baseline', gap:'8px' }}>
              <span style={{ fontFamily:'alfarn-2, sans-serif', fontSize:'28px', fontWeight:900, color:'rgba(255,255,255,.65)', lineHeight:1 }}>{node.riskScore}</span>
              <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'9px', color:'rgba(255,255,255,.3)' }}>/ 10 · {node.riskLevel}</span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ padding:'12px 14px 16px', borderTop:'1px solid rgba(255,255,255,.05)', display:'flex', flexDirection:'column', gap:'6px', flexShrink:0 }}>
        <button onClick={()=>onUpdate(node._id,{label,category,tags})} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'7px', padding:'10px', background:'rgba(0,229,255,.09)', border:'1px solid rgba(0,229,255,.28)', color:'#00E5FF', fontFamily:'JetBrains Mono, monospace', fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', cursor:'pointer' }}
          onMouseEnter={e=>e.currentTarget.style.background='rgba(0,229,255,.18)'} onMouseLeave={e=>e.currentTarget.style.background='rgba(0,229,255,.09)'}>
          <Save size={12} /> Salva modifiche
        </button>
        <button onClick={()=>onDelete(node._id)} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'7px', padding:'10px', background:'rgba(255,59,139,.05)', border:'1px solid rgba(255,59,139,.18)', color:'rgba(255,59,139,.65)', fontFamily:'JetBrains Mono, monospace', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.1em', cursor:'pointer' }}
          onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,59,139,.14)'; e.currentTarget.style.color='#FF3B8B' }}
          onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,59,139,.05)'; e.currentTarget.style.color='rgba(255,59,139,.65)' }}>
          <Trash2 size={12} /> Rimuovi dalla board
        </button>
      </div>
    </motion.div>
  )
}
