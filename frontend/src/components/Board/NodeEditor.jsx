// components/Board/NodeEditor.jsx — Pannello di editing del nodo selezionato
import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Trash2, Tag, Save, ExternalLink } from 'lucide-react'

const CATEGORIES = ['safe','suspicious','dangerous','phishing','tracker','ads','unknown']
const CAT_COLORS = {
  safe:       'text-neon border-neon/30 bg-neon/8',
  suspicious: 'text-gold border-gold/30 bg-gold/8',
  dangerous:  'text-orange border-orange/30 bg-orange/8',
  phishing:   'text-pink border-pink/30 bg-pink/8',
  tracker:    'text-violet border-violet/30 bg-violet/8',
  ads:        'text-cyan border-cyan/30 bg-cyan/8',
  unknown:    'text-white/40 border-white/10 bg-white/3',
}

export default function NodeEditor({ node, onClose, onUpdate, onDelete }) {
  const [label,    setLabel]    = useState(node.label    || '')
  const [category, setCategory] = useState(node.category || 'unknown')
  const [tagInput, setTagInput] = useState('')
  const [tags,     setTags]     = useState(node.tags     || [])

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !tags.includes(t) && tags.length < 8) {
      setTags(prev => [...prev, t])
      setTagInput('')
    }
  }

  const removeTag = (tag) => setTags(prev => prev.filter(t => t !== tag))

  const handleSave = () => {
    onUpdate(node._id, { label, category, tags })
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ type: 'spring', damping: 26, stiffness: 300 }}
      className="absolute right-4 top-4 bottom-4 w-72 z-20 flex flex-col rounded-2xl border border-white/8 bg-bg1/95 backdrop-blur-2xl overflow-hidden"
      style={{ boxShadow: '-10px 0 40px rgba(0,0,0,.4)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/6">
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[9px] text-white/25 uppercase tracking-widest">Modifica nodo</div>
          <div className="font-mono text-xs font-bold text-white/70 truncate">{node.domain}</div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">

        {/* URL */}
        <div>
          <div className="font-mono text-[8px] text-white/20 uppercase tracking-widest mb-1.5">URL</div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-bg3/50 border border-white/5">
            <span className="font-mono text-[9px] text-white/35 break-all flex-1">{node.url}</span>
            <a href={node.url} target="_blank" rel="noopener noreferrer"
               className="flex-shrink-0 text-white/20 hover:text-cyan transition-colors">
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Label */}
        <div>
          <div className="font-mono text-[8px] text-white/20 uppercase tracking-widest mb-1.5">Etichetta</div>
          <input
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="Aggiungi etichetta..."
            className="w-full bg-bg3/60 border border-white/8 rounded-xl px-3 py-2.5 font-mono text-xs text-white/70 placeholder-white/20 outline-none focus:border-cyan/40 transition-colors"
          />
        </div>

        {/* Category */}
        <div>
          <div className="font-mono text-[8px] text-white/20 uppercase tracking-widest mb-2">Categoria</div>
          <div className="grid grid-cols-2 gap-1.5">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-2 py-1.5 rounded-lg border font-mono text-[9px] uppercase tracking-widest transition-all ${
                  category === cat
                    ? CAT_COLORS[cat]
                    : 'text-white/25 border-white/8 bg-transparent hover:border-white/15'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <div className="font-mono text-[8px] text-white/20 uppercase tracking-widest mb-1.5">Tag</div>
          <div className="flex gap-2 mb-2">
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTag()}
              placeholder="Nuovo tag..."
              className="flex-1 bg-bg3/60 border border-white/8 rounded-xl px-3 py-2 font-mono text-xs text-white/70 placeholder-white/20 outline-none focus:border-cyan/40 transition-colors"
            />
            <button
              onClick={addTag}
              className="px-3 rounded-xl bg-cyan/10 border border-cyan/25 text-cyan hover:bg-cyan/20 transition-colors"
            >
              <Tag size={12} />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tags.map(tag => (
              <span key={tag}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10 font-mono text-[9px] text-white/50 group cursor-pointer hover:border-pink/30 transition-colors"
                onClick={() => removeTag(tag)}
              >
                {tag}
                <X size={9} className="group-hover:text-pink transition-colors" />
              </span>
            ))}
          </div>
        </div>

        {/* Risk info (read-only) */}
        {node.riskScore !== undefined && (
          <div className="p-3 rounded-xl bg-bg3/40 border border-white/5">
            <div className="font-mono text-[8px] text-white/20 uppercase tracking-widest mb-2">Risk (dall'analisi)</div>
            <div className="flex items-center gap-3">
              <span className="font-title text-2xl font-black text-white/60">{node.riskScore}</span>
              <span className="font-mono text-[9px] text-white/30">/ 10 · {node.riskLevel}</span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 pt-2 border-t border-white/5 space-y-2">
        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan/10 border border-cyan/30 text-cyan font-mono font-bold text-xs uppercase tracking-widest hover:bg-cyan/20 transition-colors"
        >
          <Save size={13} />
          Salva modifiche
        </button>
        <button
          onClick={() => onDelete(node._id)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-pink/5 border border-pink/20 text-pink/70 font-mono text-xs uppercase tracking-widest hover:bg-pink/15 hover:text-pink transition-colors"
        >
          <Trash2 size={13} />
          Rimuovi dalla board
        </button>
      </div>
    </motion.div>
  )
}
