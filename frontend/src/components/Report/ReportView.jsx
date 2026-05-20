// ─────────────────────────────────────────────────────────
//  components/Report/ReportView.jsx
//  Visualizza il report AI con box grafici animati
// ─────────────────────────────────────────────────────────
import { motion } from 'framer-motion'
import {
  Shield, AlertTriangle, AlertOctagon, Zap,
  Eye, Code, Link as LinkIcon, Cookie, Server,
  Lock, Globe, ExternalLink, LayoutDashboard,
  CheckCircle2, XCircle, MinusCircle,
} from 'lucide-react'

const iconMap = {
  shield: Shield, alert: AlertTriangle, eye: Eye,
  code: Code, link: LinkIcon, cookie: Cookie,
  server: Server, lock: Lock, globe: Globe, zap: Zap,
}

const colorMap = {
  cyan:   { text: 'text-cyan',   border: 'border-cyan/20',   bg: 'bg-cyan/5',   glow: 'rgba(0,229,255,.15)'   },
  violet: { text: 'text-violet', border: 'border-violet/20', bg: 'bg-violet/5', glow: 'rgba(155,95,255,.15)'  },
  pink:   { text: 'text-pink',   border: 'border-pink/20',   bg: 'bg-pink/5',   glow: 'rgba(255,59,139,.15)'  },
  orange: { text: 'text-orange', border: 'border-orange/20', bg: 'bg-orange/5', glow: 'rgba(255,122,64,.15)'  },
  green:  { text: 'text-neon',   border: 'border-neon/20',   bg: 'bg-neon/5',   glow: 'rgba(0,255,153,.15)'   },
  gold:   { text: 'text-gold',   border: 'border-gold/20',   bg: 'bg-gold/5',   glow: 'rgba(245,200,66,.15)'  },
}

const riskConfig = {
  LOW:      { label: 'BASSO',    cls: 'risk-low',      Icon: CheckCircle2,  glow: 'rgba(0,255,153,.2)'  },
  MEDIUM:   { label: 'MEDIO',    cls: 'risk-medium',   Icon: MinusCircle,   glow: 'rgba(245,200,66,.2)' },
  HIGH:     { label: 'ALTO',     cls: 'risk-high',     Icon: AlertTriangle, glow: 'rgba(255,122,64,.2)' },
  CRITICAL: { label: 'CRITICO',  cls: 'risk-critical', Icon: AlertOctagon,  glow: 'rgba(255,59,139,.2)' },
}

export default function ReportView({ data, onAddToBoard }) {
  if (!data) return null
  const { url, domain, report, extractedData, redirectChain, status } = data
  const risk = riskConfig[report.riskLevel] || riskConfig.LOW

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full space-y-6"
    >

      {/* ── Header card ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card p-6 relative overflow-hidden corner-bracket"
        style={{ boxShadow: `0 0 60px ${risk.glow}` }}
      >
        {/* Bg glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{ background: `radial-gradient(ellipse at top right, ${risk.glow}, transparent 60%)` }}
        />

        <div className="relative flex flex-col md:flex-row md:items-start gap-6">

          {/* Risk score big display */}
          <div className="flex-shrink-0">
            <div className={`w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center ${risk.cls}`}>
              <risk.Icon size={22} className="mb-1" />
              <span className="font-title text-3xl font-black leading-none">{report.riskScore}</span>
              <span className="font-mono text-[8px] tracking-widest uppercase opacity-70">/ 10</span>
            </div>
            <div className={`mt-2 px-3 py-1 rounded-full border text-center font-mono text-[9px] font-bold tracking-widest uppercase ${risk.cls}`}>
              {risk.label}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="font-title text-xl font-black uppercase tracking-tight">{domain}</span>
              <span className={`px-2 py-0.5 rounded border font-mono text-[9px] font-bold uppercase tracking-widest ${risk.cls}`}>
                {report.riskLevel}
              </span>
              <span className={`px-2 py-0.5 rounded border font-mono text-[9px] uppercase tracking-widest ${
                status < 400 ? 'text-neon border-neon/30 bg-neon/5' : 'text-orange border-orange/30 bg-orange/5'
              }`}>
                HTTP {status}
              </span>
            </div>

            <p className="font-mono text-xs text-white/40 mb-3 break-all">{url}</p>

            {/* Verdict */}
            <div className="bg-bg3/60 border border-white/5 rounded-xl p-4 mb-4">
              <div className="font-mono text-[9px] text-white/30 tracking-widest uppercase mb-1.5">Verdict AI</div>
              <p className="font-mono text-sm text-white/80 leading-relaxed">{report.verdict || report.summary}</p>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: 'Script', value: extractedData.scriptCount, color: 'cyan'   },
                { label: 'Ext. Domains', value: extractedData.externalDomains.length, color: 'violet' },
                { label: 'Tracker', value: extractedData.trackerList?.length || 0, color: 'pink'  },
                { label: 'Cookie', value: extractedData.cookies?.length || 0, color: 'gold'  },
              ].map(({ label, value, color }) => (
                <div key={label} className={`p-3 rounded-xl border ${colorMap[color].border} ${colorMap[color].bg}`}>
                  <div className={`font-title text-2xl font-black ${colorMap[color].text}`}>{value}</div>
                  <div className="font-mono text-[9px] text-white/30 uppercase tracking-widest">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Add to board button */}
          {onAddToBoard && (
            <motion.button
              onClick={onAddToBoard}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet/10 border border-violet/30 text-violet font-mono font-bold text-xs tracking-widest uppercase hover:bg-violet/20 transition-colors"
            >
              <LayoutDashboard size={13} />
              Board
            </motion.button>
          )}
        </div>

        {/* Redirect chain */}
        {redirectChain.length > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-orange/5 border border-orange/20">
            <div className="font-mono text-[9px] text-orange/60 tracking-widest uppercase mb-2">Redirect chain ({redirectChain.length})</div>
            <div className="space-y-1">
              {redirectChain.map((r, i) => (
                <div key={i} className="font-mono text-[10px] text-white/40 flex items-center gap-2">
                  <span className="text-orange/40">{i + 1}.</span>
                  <span className="break-all">{r}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Dynamic report sections ─────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2">
        {report.sections.map((section, i) => {
          const Icon = iconMap[section.icon] || Shield
          const colors = colorMap[section.color] || colorMap.cyan

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className={`glass-card p-5 border ${colors.border} ${colors.bg} relative overflow-hidden corner-bracket`}
            >
              {/* Subtle glow */}
              <div
                className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
                style={{ background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)` }}
              />

              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-1.5 rounded-lg ${colors.bg} border ${colors.border}`}>
                    <Icon size={14} className={colors.text} />
                  </div>
                  <h3 className={`font-mono text-xs font-bold uppercase tracking-widest ${colors.text}`}>
                    {section.title}
                  </h3>
                </div>
                <p className="font-mono text-xs text-white/55 leading-relaxed whitespace-pre-wrap">
                  {section.content}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ── Raw data accordion ───────────────────────────────── */}
      <RawDataSection data={extractedData} />
    </motion.div>
  )
}

// ── Raw data expandable section ───────────────────────────
function RawDataSection({ data }) {
  const sections = [
    {
      title: 'Meta Tags',
      icon: Globe,
      items: data.metaTags?.map(m => `${m.name}: ${m.content}`).slice(0, 15) || [],
      color: 'cyan',
    },
    {
      title: 'Script Sources',
      icon: Code,
      items: data.scripts?.slice(0, 20) || [],
      color: 'violet',
    },
    {
      title: 'Domini Esterni',
      icon: ExternalLink,
      items: data.externalDomains?.slice(0, 30) || [],
      color: 'pink',
    },
    {
      title: 'Cookie',
      icon: Cookie,
      items: data.cookies?.map(c => `${c.name} [${c.flags || 'no flags'}]`).slice(0, 15) || [],
      color: 'gold',
    },
    {
      title: 'Tracker Rilevati',
      icon: Eye,
      items: data.trackerList || [],
      color: 'orange',
    },
  ].filter(s => s.items.length > 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="glass-card p-5"
    >
      <div className="font-mono text-[9px] text-white/25 tracking-widest uppercase mb-4 flex items-center gap-2">
        <Server size={11} />
        Dati Grezzi Estratti
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.map(({ title, icon: Icon, items, color }) => {
          const colors = colorMap[color] || colorMap.cyan
          return (
            <div key={title} className={`rounded-xl border ${colors.border} p-3`}>
              <div className="flex items-center gap-1.5 mb-2">
                <Icon size={11} className={colors.text} />
                <span className={`font-mono text-[9px] uppercase tracking-widest font-bold ${colors.text}`}>
                  {title} ({items.length})
                </span>
              </div>
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {items.map((item, i) => (
                  <div key={i} className="font-mono text-[9px] text-white/35 break-all leading-relaxed">
                    · {item}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
