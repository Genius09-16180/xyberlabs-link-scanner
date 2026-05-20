// ─────────────────────────────────────────────────────────
//  components/Board/LinkBoard.jsx
//  Board interattiva con React Flow (@xyflow/react)
//  Drag & drop, connessioni, label, categorie, cartelle
// ─────────────────────────────────────────────────────────
import { useCallback, useEffect, useState } from 'react'
import {
  ReactFlow, Background, Controls, MiniMap,
  addEdge, useNodesState, useEdgesState,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Tag, FolderPlus, Link2, CheckCircle2 } from 'lucide-react'
import { getLinks, updateLink, deleteLink } from '../../lib/api'
import LinkNode from './LinkNode'
import NodeEditor from './NodeEditor'

const nodeTypes = { linkNode: LinkNode }

const CATEGORY_COLORS = {
  safe:       'rgba(0,255,153,.3)',
  suspicious: 'rgba(245,200,66,.3)',
  dangerous:  'rgba(255,122,64,.3)',
  phishing:   'rgba(255,59,139,.3)',
  tracker:    'rgba(155,95,255,.3)',
  ads:        'rgba(0,229,255,.3)',
  unknown:    'rgba(255,255,255,.15)',
}

export default function LinkBoard() {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode]  = useState(null)
  const [loading, setLoading]            = useState(true)
  const [saved, setSaved]                = useState(false)

  // ── Load links from DB ────────────────────────────────
  useEffect(() => {
    loadLinks()
  }, [])

  async function loadLinks() {
    try {
      const links = await getLinks()
      const loadedNodes = links.map(link => ({
        id:       link._id,
        type:     'linkNode',
        position: link.boardPosition || { x: Math.random() * 600 + 100, y: Math.random() * 400 + 100 },
        data: {
          url:       link.url,
          domain:    link.domain,
          label:     link.label,
          category:  link.category,
          riskScore: link.report?.riskScore || 0,
          riskLevel: link.report?.riskLevel || 'UNKNOWN',
          tags:      link.tags || [],
          onSelect:  () => setSelectedNode(link),
        },
      }))

      // Rebuild edges from connections
      const loadedEdges = []
      links.forEach(link => {
        (link.connections || []).forEach(targetId => {
          loadedEdges.push({
            id:     `${link._id}-${targetId}`,
            source: link._id,
            target: String(targetId),
            animated: true,
          })
        })
      })

      setNodes(loadedNodes)
      setEdges(loadedEdges)
    } catch (err) {
      console.warn('Board: impossibile caricare link', err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Save node position on drag end ─────────────────────
  const onNodeDragStop = useCallback(async (_, node) => {
    try {
      await updateLink(node.id, { boardPosition: node.position })
    } catch (err) {
      console.warn('Update position failed:', err.message)
    }
  }, [])

  // ── Connect two nodes ─────────────────────────────────
  const onConnect = useCallback(async (params) => {
    setEdges(eds => addEdge({ ...params, animated: true }, eds))
    // Save connection to DB
    try {
      const sourceNode = nodes.find(n => n.id === params.source)
      if (!sourceNode) return
      const currentConns = sourceNode.data.connections || []
      await updateLink(params.source, {
        connections: [...currentConns, params.target]
      })
    } catch (err) {
      console.warn('Save connection failed:', err.message)
    }
  }, [nodes])

  // ── Delete selected node ─────────────────────────────
  const handleDeleteNode = async (id) => {
    try {
      await deleteLink(id)
      setNodes(ns => ns.filter(n => n.id !== id))
      setEdges(es => es.filter(e => e.source !== id && e.target !== id))
      setSelectedNode(null)
    } catch (err) {
      console.warn('Delete failed:', err.message)
    }
  }

  // ── Update label/category ─────────────────────────────
  const handleUpdateNode = async (id, updates) => {
    try {
      await updateLink(id, updates)
      setNodes(ns => ns.map(n =>
        n.id === id ? { ...n, data: { ...n.data, ...updates } } : n
      ))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.warn('Update node failed:', err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-cyan/10 border border-cyan/30 flex items-center justify-center mx-auto mb-4">
            <div className="w-5 h-5 rounded-full border-2 border-cyan border-t-transparent animate-spin" />
          </div>
          <div className="font-mono text-xs text-white/30">Caricamento board...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 relative">
      {/* Empty state */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="text-center max-w-xs">
            <div className="w-16 h-16 rounded-2xl bg-white/3 border border-white/8 flex items-center justify-center mx-auto mb-4">
              <Link2 size={24} className="text-white/20" />
            </div>
            <p className="font-mono text-sm text-white/20 leading-relaxed">
              Nessun link sulla board.<br />
              Analizza un URL dallo Scanner per aggiungerlo.
            </p>
          </div>
        </div>
      )}

      {/* React Flow canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => setSelectedNode({ _id: node.id, ...node.data })}
        onPaneClick={() => setSelectedNode(null)}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        deleteKeyCode="Delete"
        className="bg-transparent"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={28}
          size={1}
          color="rgba(0,229,255,.15)"
        />
        <Controls />
        <MiniMap
          nodeColor={node => CATEGORY_COLORS[node.data?.category] || CATEGORY_COLORS.unknown}
          maskColor="rgba(7,7,13,.8)"
        />
      </ReactFlow>

      {/* Node editor sidebar */}
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

      {/* Saved indicator */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-neon/10 border border-neon/30 text-neon font-mono text-xs"
          >
            <CheckCircle2 size={13} />
            Salvato
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
