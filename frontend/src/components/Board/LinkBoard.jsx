// LinkBoard.jsx — board completa funzionante con localStorage, cartelle, import
import { useCallback, useEffect, useState, useRef } from 'react'
import {
  ReactFlow, Background, Controls, MiniMap,
  addEdge, useNodesState, useEdgesState,
  BackgroundVariant, Panel,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Link2, CheckCircle2, FolderPlus, Trash2,
  RefreshCw, Download, Upload, X, Folder,
} from 'lucide-react'
import { getLinks, updateLink, deleteLink } from '../../lib/api'
import LinkNode   from './LinkNode'
import NodeEditor from './NodeEditor'

const nodeTypes = { linkNode: LinkNode }

const CAT_COLORS = {
  safe:'rgba(0,255,153,.5)', suspicious:'rgba(245,200,66,.5)',
  dangerous:'rgba(255,122,64,.5)', phishing:'rgba(255,59,139,.5)',
  tracker:'rgba(155,95,255,.5)', ads:'rgba(0,229,255,.5)', unknown:'rgba(255,255,255,.2)',
}

// ── localStorage helpers ─────────────────────────────────
const LS_KEY = 'xyber_board_links'

const loadLocal  = ()       => { try { return JSON.parse(localStorage.getItem(LS_KEY)||'[]') } catch { return [] } }
const saveLocal  = (links)  => { try { localStorage.setItem(LS_KEY, JSON.stringify(links)) } catch {} }
const patchLocal = (id, up) => saveLocal(loadLocal().map(l => String(l._id)===String(id) ? {...l,...up} : l))
const deleteLocal= (id)     => saveLocal(loadLocal().filter(l => String(l._id)!==String(id)))

// ── Folder modal ─────────────────────────────────────────
function FolderModal({ onClose, onCreateFolder }) {
  const [name, setName] = useState('')
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.7)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center' }} onClick={onClose}>
      <div style={{ background:'#0D0D18', border:'1px solid rgba(0,229,255,.25)', padding:'28px 32px', minWidth:'320px' }} onClick={e=>e.stopPropagation()}>
        <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'11px', color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'16px' }}>Nuova Cartella</div>
        <input autoFocus value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'&&name.trim()) onCreateFolder(name.trim()) }}
          placeholder="Nome cartella..."
          style={{ width:'100%', background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.12)', padding:'9px 12px', fontFamily:'JetBrains Mono, monospace', fontSize:'12px', color:'white', outline:'none', boxSizing:'border-box', marginBottom:'14px' }}
          onFocus={e=>e.target.style.borderColor='rgba(0,229,255,.45)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.12)'} />
        <div style={{ display:'flex', gap:'8px' }}>
          <button onClick={()=>{ if(name.trim()) onCreateFolder(name.trim()) }} style={{ flex:1, padding:'9px', background:'rgba(0,229,255,.1)', border:'1px solid rgba(0,229,255,.3)', color:'#00E5FF', fontFamily:'JetBrains Mono, monospace', fontSize:'10px', fontWeight:700, textTransform:'uppercase', cursor:'pointer' }}>Crea</button>
          <button onClick={onClose} style={{ padding:'9px 14px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.4)', fontFamily:'JetBrains Mono, monospace', fontSize:'10px', cursor:'pointer' }}>Annulla</button>
        </div>
      </div>
    </div>
  )
}

export default function LinkBoard() {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode]  = useState(null)
  const [loading, setLoading]            = useState(true)
  const [saved, setSaved]                = useState(false)
  const [folders, setFolders]            = useState(() => { try { return JSON.parse(localStorage.getItem('xyber_folders')||'[]') } catch { return [] } })
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [activeFolder, setActiveFolder]  = useState(null) // null = tutti
  const fileInputRef = useRef(null)

  useEffect(() => { loadLinks() }, [])

  // Salva cartelle
  useEffect(() => {
    try { localStorage.setItem('xyber_folders', JSON.stringify(folders)) } catch {}
  }, [folders])

  async function loadLinks() {
    try {
      const apiLinks = await getLinks()
      const links = apiLinks.length > 0 ? mergeWithLocal(apiLinks) : loadLocal()
      buildNodes(links)
    } catch {
      buildNodes(loadLocal())
    } finally { setLoading(false) }
  }

  // Merge API con posizioni locali
  function mergeWithLocal(apiLinks) {
    const local = loadLocal()
    const localMap = Object.fromEntries(local.map(l => [String(l._id), l]))
    return apiLinks.map(l => ({
      ...l,
      boardPosition: localMap[String(l._id)]?.boardPosition || l.boardPosition || { x:100+Math.random()*500, y:100+Math.random()*300 },
      label:       localMap[String(l._id)]?.label    || l.label    || '',
      tags:        localMap[String(l._id)]?.tags     || l.tags     || [],
      category:    localMap[String(l._id)]?.category || l.category || 'unknown',
      folder:      localMap[String(l._id)]?.folder   || l.folder   || null,
    }))
  }

  function buildNodes(links) {
    const filtered = activeFolder ? links.filter(l => l.folder === activeFolder) : links
    setNodes(filtered.map(link => ({
      id:       String(link._id),
      type:     'linkNode',
      position: link.boardPosition || { x:100+Math.random()*600, y:100+Math.random()*400 },
      data: {
        url:       link.url, domain: link.domain,
        label:     link.label, category: link.category,
        riskScore: link.report?.riskScore ?? 0,
        riskLevel: link.report?.riskLevel ?? 'UNKNOWN',
        tags:      link.tags || [],
        folder:    link.folder || null,
      },
    })))
    const es = []
    links.forEach(l => (l.connections||[]).forEach(t => es.push({ id:`${l._id}-${t}`, source:String(l._id), target:String(t), animated:true, style:{ stroke:'rgba(0,229,255,.4)', strokeWidth:1.5 } })))
    setEdges(es)
  }

  // Ricarica quando cambia filtro cartella
  useEffect(() => { if (!loading) buildNodes(loadLocal()) }, [activeFolder])

  const flash = () => { setSaved(true); setTimeout(()=>setSaved(false), 2000) }

  const onNodeDragStop = useCallback((_, node) => {
    patchLocal(node.id, { boardPosition: node.position })
    updateLink(node.id, { boardPosition: node.position }).catch(()=>{})
  }, [])

  const onConnect = useCallback((params) => {
    setEdges(eds => addEdge({ ...params, animated:true, style:{ stroke:'rgba(0,229,255,.4)', strokeWidth:1.5 } }, eds))
    patchLocal(params.source, { connections:[params.target] })
    updateLink(params.source, { connections:[params.target] }).catch(()=>{})
  }, [])

  const handleDeleteNode = (id) => {
    deleteLocal(id); deleteLink(id).catch(()=>{})
    setNodes(ns => ns.filter(n => n.id !== id))
    setEdges(es => es.filter(e => e.source !== id && e.target !== id))
    setSelectedNode(null)
  }

  const handleUpdateNode = (id, updates) => {
    patchLocal(id, updates)
    setNodes(ns => ns.map(n => n.id === id ? { ...n, data:{ ...n.data, ...updates } } : n))
    updateLink(id, updates).catch(()=>{})
    flash()
  }

  // Cartelle
  const createFolder = (name) => {
    if (!folders.includes(name)) setFolders(p => [...p, name])
    setShowFolderModal(false)
  }
  const deleteFolder = (name) => {
    // Sposta link fuori dalla cartella
    const links = loadLocal().map(l => l.folder === name ? { ...l, folder:null } : l)
    saveLocal(links)
    setFolders(p => p.filter(f => f !== name))
    if (activeFolder === name) setActiveFolder(null)
    buildNodes(links)
  }
  const assignFolder = (nodeId, folder) => {
    handleUpdateNode(nodeId, { folder })
  }

  // Export JSON
  const exportBoard = () => {
    const data = { links: loadLocal(), edges: edges.map(e=>({source:e.source,target:e.target})), folders, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'xyberlabs-board.json'; a.click()
  }

  // Import JSON
  const importBoard = (e) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (data.links) { saveLocal(data.links); if (data.folders) setFolders(data.folders); buildNodes(data.links); flash() }
      } catch { alert('File non valido') }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  if (loading) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:'44px', height:'44px', margin:'0 auto 14px', border:'1px solid rgba(0,229,255,.25)', background:'rgba(0,229,255,.06)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ width:'18px', height:'18px', border:'2px solid #00E5FF', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
        </div>
        <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'10px', color:'rgba(255,255,255,.3)' }}>Caricamento board...</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  return (
    <div style={{ flex:1, position:'relative', display:'flex', flexDirection:'column' }}>

      {/* ── Folder bar ── */}
      <div style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 14px', borderBottom:'1px solid rgba(255,255,255,.05)', background:'rgba(7,7,13,.6)', flexShrink:0, flexWrap:'wrap' }}>
        {/* Tutti */}
        <button onClick={()=>setActiveFolder(null)} style={{ padding:'4px 12px', background:!activeFolder?'rgba(0,229,255,.1)':'transparent', border:`1px solid ${!activeFolder?'rgba(0,229,255,.3)':'rgba(255,255,255,.08)'}`, color:!activeFolder?'#00E5FF':'rgba(255,255,255,.35)', fontFamily:'JetBrains Mono, monospace', fontSize:'9px', textTransform:'uppercase', letterSpacing:'0.1em', cursor:'pointer' }}>
          Tutti ({loadLocal().length})
        </button>
        {/* Cartelle */}
        {folders.map(f => (
          <div key={f} style={{ display:'flex', alignItems:'center', gap:'0' }}>
            <button onClick={()=>setActiveFolder(f===activeFolder?null:f)} style={{ padding:'4px 10px', background:activeFolder===f?'rgba(155,95,255,.1)':'transparent', border:`1px solid ${activeFolder===f?'rgba(155,95,255,.3)':'rgba(255,255,255,.08)'}`, borderRight:'none', color:activeFolder===f?'#9B5FFF':'rgba(255,255,255,.35)', fontFamily:'JetBrains Mono, monospace', fontSize:'9px', textTransform:'uppercase', letterSpacing:'0.1em', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px' }}>
              <Folder size={10} /> {f} ({loadLocal().filter(l=>l.folder===f).length})
            </button>
            <button onClick={()=>deleteFolder(f)} style={{ padding:'4px 6px', background:'transparent', border:'1px solid rgba(255,255,255,.08)', color:'rgba(255,255,255,.2)', cursor:'pointer', display:'flex', alignItems:'center' }}
              onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,59,139,.12)'; e.currentTarget.style.color='#FF3B8B' }}
              onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,.2)' }}>
              <X size={10} />
            </button>
          </div>
        ))}
        {/* Nuova cartella */}
        <button onClick={()=>setShowFolderModal(true)} style={{ padding:'4px 10px', background:'transparent', border:'1px solid rgba(255,255,255,.07)', color:'rgba(255,255,255,.25)', fontFamily:'JetBrains Mono, monospace', fontSize:'9px', textTransform:'uppercase', letterSpacing:'0.1em', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px' }}
          onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(0,229,255,.3)'; e.currentTarget.style.color='#00E5FF' }}
          onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,.07)'; e.currentTarget.style.color='rgba(255,255,255,.25)' }}>
          <FolderPlus size={10} /> Nuova cartella
        </button>

        <div style={{ flex:1 }} />

        {/* Import / Export */}
        <button onClick={exportBoard} style={{ padding:'4px 10px', background:'transparent', border:'1px solid rgba(255,255,255,.07)', color:'rgba(255,255,255,.3)', fontFamily:'JetBrains Mono, monospace', fontSize:'9px', textTransform:'uppercase', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px' }}
          onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(0,229,255,.3)'; e.currentTarget.style.color='#00E5FF' }}
          onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,.07)'; e.currentTarget.style.color='rgba(255,255,255,.3)' }}>
          <Download size={10} /> Export
        </button>
        <button onClick={()=>fileInputRef.current?.click()} style={{ padding:'4px 10px', background:'transparent', border:'1px solid rgba(255,255,255,.07)', color:'rgba(255,255,255,.3)', fontFamily:'JetBrains Mono, monospace', fontSize:'9px', textTransform:'uppercase', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px' }}
          onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(155,95,255,.3)'; e.currentTarget.style.color='#9B5FFF' }}
          onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,.07)'; e.currentTarget.style.color='rgba(255,255,255,.3)' }}>
          <Upload size={10} /> Import
        </button>
        <button onClick={()=>{ buildNodes(loadLocal()) }} style={{ padding:'4px 8px', background:'transparent', border:'1px solid rgba(255,255,255,.07)', color:'rgba(255,255,255,.25)', cursor:'pointer', display:'flex', alignItems:'center' }}
          onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(0,229,255,.3)'; e.currentTarget.style.color='#00E5FF' }}
          onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,.07)'; e.currentTarget.style.color='rgba(255,255,255,.25)' }}>
          <RefreshCw size={11} />
        </button>
        <input ref={fileInputRef} type="file" accept=".json" onChange={importBoard} style={{ display:'none' }} />
      </div>

      {/* ── Canvas ── */}
      <div style={{ flex:1, position:'relative' }}>
        {nodes.length === 0 && (
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:5, pointerEvents:'none' }}>
            <div style={{ textAlign:'center', maxWidth:'280px' }}>
              <div style={{ width:'60px', height:'60px', margin:'0 auto 14px', border:'1px solid rgba(255,255,255,.07)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Link2 size={22} color="rgba(255,255,255,.18)" />
              </div>
              <p style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'11px', color:'rgba(255,255,255,.2)', lineHeight:1.7 }}>
                Nessun link in questa vista.<br />Analizza un URL dallo Scanner o importa un JSON.
              </p>
            </div>
          </div>
        )}

        <ReactFlow
          nodes={nodes} edges={edges}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          onConnect={onConnect} onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => {
            const found = loadLocal().find(l => String(l._id) === node.id)
            setSelectedNode(found ? { ...found, _id: node.id } : { _id: node.id, ...node.data })
          }}
          onPaneClick={() => setSelectedNode(null)}
          fitView fitViewOptions={{ padding:0.2 }}
          deleteKeyCode="Delete"
          style={{ background:'transparent' }}
          connectionLineStyle={{ stroke:'rgba(0,229,255,.5)', strokeWidth:1.5 }}
        >
          <Background variant={BackgroundVariant.Dots} gap={28} size={1} color="rgba(0,229,255,.12)" />
          <Controls style={{ boxShadow:'none' }} />
          <MiniMap nodeColor={n=>CAT_COLORS[n.data?.category]||CAT_COLORS.unknown} maskColor="rgba(7,7,13,.8)" />

          {/* Panel con istruzioni */}
          <Panel position="bottom-center">
            <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'8px', color:'rgba(255,255,255,.18)', background:'rgba(7,7,13,.8)', border:'1px solid rgba(255,255,255,.06)', padding:'5px 12px', display:'flex', gap:'14px' }}>
              <span>Drag → sposta</span>
              <span>Click → modifica</span>
              <span>Handle → connetti</span>
              <span>Del → rimuovi</span>
            </div>
          </Panel>
        </ReactFlow>

        {/* Node Editor — pannello destro */}
        <AnimatePresence>
          {selectedNode && (
            <NodeEditor
              node={selectedNode}
              folders={folders}
              onClose={() => setSelectedNode(null)}
              onUpdate={handleUpdateNode}
              onDelete={handleDeleteNode}
              onAssignFolder={assignFolder}
            />
          )}
        </AnimatePresence>

        {/* Saved toast */}
        <AnimatePresence>
          {saved && (
            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              style={{ position:'fixed', bottom:'24px', left:'50%', transform:'translateX(-50%)', display:'flex', alignItems:'center', gap:'7px', padding:'7px 16px', background:'rgba(0,255,153,.09)', border:'1px solid rgba(0,255,153,.28)', color:'#00FF99', fontFamily:'JetBrains Mono, monospace', fontSize:'10px', zIndex:50 }}>
              <CheckCircle2 size={12} /> Salvato
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Folder modal */}
      {showFolderModal && <FolderModal onClose={()=>setShowFolderModal(false)} onCreateFolder={createFolder} />}
    </div>
  )
}
