// components/Board/LinkBoard.jsx — Legge da localStorage + API
import { useCallback, useEffect, useState } from 'react'
import {
  ReactFlow, Background, Controls, MiniMap,
  addEdge, useNodesState, useEdgesState,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { motion, AnimatePresence } from 'framer-motion'
import { Link2, CheckCircle2 } from 'lucide-react'
import { getLinks, updateLink, deleteLink } from '../../lib/api'
import LinkNode    from './LinkNode'
import NodeEditor  from './NodeEditor'

const nodeTypes = { linkNode: LinkNode }

const CAT_COLORS = {
  safe:       'rgba(0,255,153,.5)',
  suspicious: 'rgba(245,200,66,.5)',
  dangerous:  'rgba(255,122,64,.5)',
  phishing:   'rgba(255,59,139,.5)',
  tracker:    'rgba(155,95,255,.5)',
  ads:        'rgba(0,229,255,.5)',
  unknown:    'rgba(255,255,255,.2)',
}

// Carica da localStorage
function loadLocalLinks() {
  try {
    return JSON.parse(localStorage.getItem('xyber_board_links') || '[]')
  } catch { return [] }
}

// Salva posizioni in localStorage
function saveLocalPosition(id, position) {
  try {
    const links = loadLocalLinks()
    const updated = links.map(l => l._id === id ? { ...l, boardPosition: position } : l)
    localStorage.setItem('xyber_board_links', JSON.stringify(updated))
  } catch {}
}

function deleteLocalLink(id) {
  try {
    const links = loadLocalLinks().filter(l => l._id !== id)
    localStorage.setItem('xyber_board_links', JSON.stringify(links))
  } catch {}
}

function updateLocalLink(id, updates) {
  try {
    const links = loadLocalLinks().map(l => l._id === id ? { ...l, ...updates } : l)
    localStorage.setItem('xyber_board_links', JSON.stringify(links))
  } catch {}
}

export default function LinkBoard() {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode]  = useState(null)
  const [loading, setLoading]            = useState(true)
  const [saved, setSaved]                = useState(false)

  useEffect(() => { loadLinks() }, [])

  async function loadLinks() {
    try {
      // Prima prova API
      const apiLinks = await getLinks()
      const allLinks = apiLinks.length > 0 ? apiLinks : loadLocalLinks()
      buildNodes(allLinks)
    } catch {
      // Fallback a localStorage
      buildNodes(loadLocalLinks())
    } finally {
      setLoading(false)
    }
  }

  function buildNodes(links) {
    const ns = links.map(link => ({
      id:       String(link._id),
      type:     'linkNode',
      position: link.boardPosition || { x: Math.random() * 600 + 100, y: Math.random() * 400 + 100 },
      data: {
        url:       link.url,
        domain:    link.domain,
        label:     link.label,
        category:  link.category,
        riskScore: link.report?.riskScore ?? 0,
        riskLevel: link.report?.riskLevel ?? 'UNKNOWN',
        tags:      link.tags || [],
      },
    }))

    const es = []
    links.forEach(link => {
      ;(link.connections || []).forEach(targetId => {
        es.push({ id: `${link._id}-${targetId}`, source: String(link._id), target: String(targetId), animated: true })
      })
    })
    setNodes(ns)
    setEdges(es)
  }

  const onNodeDragStop = useCallback(async (_, node) => {
    saveLocalPosition(node.id, node.position)
    try { await updateLink(node.id, { boardPosition: node.position }) } catch {}
  }, [])

  const onConnect = useCallback(async (params) => {
    setEdges(eds => addEdge({ ...params, animated: true }, eds))
    try { await updateLink(params.source, { connections: [params.target] }) } catch {}
  }, [])

  const handleDeleteNode = async (id) => {
    deleteLocalLink(id)
    setNodes(ns => ns.filter(n => n.id !== id))
    setEdges(es => es.filter(e => e.source !== id && e.target !== id))
    setSelectedNode(null)
    try { await deleteLink(id) } catch {}
  }

  const handleUpdateNode = async (id, updates) => {
    updateLocalLink(id, updates)
    setNodes(ns => ns.map(n => n.id === id ? { ...n, data: { ...n.data, ...updates } } : n))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    try { await updateLink(id, updates) } catch {}
  }

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(0,229,255,.08)', border: '1px solid rgba(0,229,255,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #00E5FF', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        </div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'rgba(255,255,255,.3)' }}>Caricamento board...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )

  return (
    <div style={{ flex: 1, position: 'relative' }}>
      {nodes.length === 0 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, pointerEvents: 'none' }}>
          <div style={{ textAlign: 'center', maxWidth: '300px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Link2 size={24} color="rgba(255,255,255,.2)" />
            </div>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'rgba(255,255,255,.2)', lineHeight: 1.7 }}>
              Nessun link sulla board.<br />Analizza un URL dallo Scanner.
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
          const localLinks = loadLocalLinks()
          const found = localLinks.find(l => String(l._id) === node.id)
          setSelectedNode(found ? { ...found, _id: node.id, ...node.data } : { _id: node.id, ...node.data })
        }}
        onPaneClick={() => setSelectedNode(null)}
        fitView fitViewOptions={{ padding: 0.2 }}
        deleteKeyCode="Delete"
        style={{ background: 'transparent' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={28} size={1} color="rgba(0,229,255,.12)" />
        <Controls />
        <MiniMap nodeColor={n => CAT_COLORS[n.data?.category] || CAT_COLORS.unknown} maskColor="rgba(7,7,13,.8)" />
      </ReactFlow>

      <AnimatePresence>
        {selectedNode && (
          <NodeEditor
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onUpdate={handleUpdateNode}
            onDelete={handleDeleteNode}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {saved && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 18px', borderRadius: '20px', background: 'rgba(0,255,153,.1)', border: '1px solid rgba(0,255,153,.3)', color: '#00FF99', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', zIndex: 50 }}>
            <CheckCircle2 size={13} /> Salvato
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
