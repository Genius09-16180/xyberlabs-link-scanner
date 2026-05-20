// components/Report/ReportView.jsx — Layout più ampio, dati grezzi migliorati
import { motion } from 'framer-motion'
import {
  Shield, AlertTriangle, AlertOctagon, Zap,
  Eye, Code, Link as LinkIcon, Cookie, Server,
  Lock, Globe, ExternalLink, LayoutDashboard,
  CheckCircle2, XCircle, MinusCircle, Wifi,
} from 'lucide-react'

const iconMap = {
  shield: Shield, alert: AlertTriangle, eye: Eye,
  code: Code, link: LinkIcon, cookie: Cookie,
  server: Server, lock: Lock, globe: Globe, zap: Zap,
}

const SECTION_STYLES = {
  cyan:   { text: '#00E5FF', border: 'rgba(0,229,255,.18)',   bg: 'rgba(0,229,255,.04)',    glow: 'rgba(0,229,255,.12)'   },
  violet: { text: '#9B5FFF', border: 'rgba(155,95,255,.18)',  bg: 'rgba(155,95,255,.04)',   glow: 'rgba(155,95,255,.12)'  },
  pink:   { text: '#FF3B8B', border: 'rgba(255,59,139,.18)',  bg: 'rgba(255,59,139,.04)',   glow: 'rgba(255,59,139,.12)'  },
  orange: { text: '#FF7A40', border: 'rgba(255,122,64,.18)',  bg: 'rgba(255,122,64,.04)',   glow: 'rgba(255,122,64,.12)'  },
  green:  { text: '#00FF99', border: 'rgba(0,255,153,.18)',   bg: 'rgba(0,255,153,.04)',    glow: 'rgba(0,255,153,.12)'   },
  gold:   { text: '#F5C842', border: 'rgba(245,200,66,.18)',  bg: 'rgba(245,200,66,.04)',   glow: 'rgba(245,200,66,.12)'  },
}

const RISK_CONFIG = {
  LOW:      { label: 'BASSO',   color: '#00FF99', glow: 'rgba(0,255,153,.2)',   icon: CheckCircle2  },
  MEDIUM:   { label: 'MEDIO',   color: '#F5C842', glow: 'rgba(245,200,66,.2)',  icon: MinusCircle   },
  HIGH:     { label: 'ALTO',    color: '#FF7A40', glow: 'rgba(255,122,64,.2)',  icon: AlertTriangle },
  CRITICAL: { label: 'CRITICO', color: '#FF3B8B', glow: 'rgba(255,59,139,.2)', icon: AlertOctagon  },
}

export default function ReportView({ data, onAddToBoard }) {
  if (!data) return null
  const { url, domain, report, extractedData, redirectChain, status } = data
  const risk = RISK_CONFIG[report.riskLevel] || RISK_CONFIG.LOW
  const RiskIcon = risk.icon

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-5">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16,1,.3,1] }}
        style={{
          background: 'rgba(13,13,24,.8)',
          border: `1px solid ${risk.color}22`,
          borderRadius: '20px',
          padding: '28px',
          position: 'relative', overflow: 'hidden',
          boxShadow: `0 0 60px ${risk.glow}`,
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at top right, ${risk.glow}, transparent 60%)`, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>

          {/* Score */}
          <div style={{ flexShrink: 0 }}>
            <div style={{
              width: '96px', height: '96px', borderRadius: '18px',
              border: `2px solid ${risk.color}55`,
              background: `${risk.color}0D`,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '2px',
            }}>
              <RiskIcon size={20} color={risk.color} />
              <span style={{ fontFamily: 'alfarn-2, sans-serif', fontSize: '32px', fontWeight: 900, color: risk.color, lineHeight: 1 }}>
                {report.riskScore}
              </span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', color: `${risk.color}99`, letterSpacing: '0.1em' }}>/ 10</span>
            </div>
            <div style={{
              marginTop: '8px', padding: '4px 10px', borderRadius: '20px', textAlign: 'center',
              border: `1px solid ${risk.color}44`, background: `${risk.color}0D`,
              fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', fontWeight: 700,
              color: risk.color, letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>{risk.label}</div>
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'alfarn-2, sans-serif', fontSize: '22px', fontWeight: 900, color: 'white', textTransform: 'uppercase' }}>{domain}</span>
              <span style={{
                padding: '3px 10px', borderRadius: '6px',
                border: `1px solid ${risk.color}44`, background: `${risk.color}0D`,
                fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', fontWeight: 700,
                color: risk.color, letterSpacing: '0.12em', textTransform: 'uppercase',
              }}>{report.riskLevel}</span>
              <span style={{
                padding: '3px 10px', borderRadius: '6px',
                border: status < 400 ? '1px solid rgba(0,255,153,.3)' : '1px solid rgba(255,122,64,.3)',
                background: status < 400 ? 'rgba(0,255,153,.06)' : 'rgba(255,122,64,.06)',
                fontFamily: 'JetBrains Mono, monospace', fontSize: '9px',
                color: status < 400 ? '#00FF99' : '#FF7A40',
              }}>HTTP {status}</span>
            </div>

            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: 'rgba(255,255,255,.35)', marginBottom: '14px', wordBreak: 'break-all' }}>{url}</p>

            {/* Verdict */}
            <div style={{
              background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
              borderRadius: '12px', padding: '14px 16px', marginBottom: '16px',
            }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', color: 'rgba(255,255,255,.25)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '6px' }}>Verdict AI</div>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'rgba(255,255,255,.75)', lineHeight: 1.7 }}>{report.verdict || report.summary}</p>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {[
                { label: 'Script',       value: extractedData.scriptCount,               color: '#00E5FF' },
                { label: 'Ext. Domains', value: extractedData.externalDomains?.length||0, color: '#9B5FFF' },
                { label: 'Tracker',      value: extractedData.trackerList?.length||0,     color: '#FF3B8B' },
                { label: 'Cookie',       value: extractedData.cookies?.length||0,          color: '#F5C842' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{
                  padding: '12px', borderRadius: '12px',
                  border: `1px solid ${color}22`, background: `${color}08`,
                  textAlign: 'center',
                }}>
                  <div style={{ fontFamily: 'alfarn-2, sans-serif', fontSize: '26px', fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Add to board */}
          {onAddToBoard && (
            <div style={{ flexShrink: 0, alignSelf: 'flex-start' }}>
              <button
                onClick={onAddToBoard}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 16px', borderRadius: '12px', cursor: 'pointer',
                  background: 'rgba(155,95,255,.1)', border: '1px solid rgba(155,95,255,.3)',
                  color: '#9B5FFF', fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(155,95,255,.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(155,95,255,.1)'}
              >
                <LayoutDashboard size={13} />
                Board
              </button>
            </div>
          )}
        </div>

        {/* Redirect chain */}
        {redirectChain?.length > 0 && (
          <div style={{
            marginTop: '16px', padding: '12px 16px', borderRadius: '12px',
            background: 'rgba(255,122,64,.05)', border: '1px solid rgba(255,122,64,.2)',
          }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', color: 'rgba(255,122,64,.6)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>
              Redirect chain ({redirectChain.length})
            </div>
            {redirectChain.map((r, i) => (
              <div key={i} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: 'rgba(255,255,255,.35)', marginBottom: '4px', wordBreak: 'break-all' }}>
                <span style={{ color: 'rgba(255,122,64,.5)', marginRight: '8px' }}>{i+1}.</span>{r}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Security header badges ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px',
        }}
      >
        {[
          { label: 'CSP',           ok: extractedData.cspPresent  },
          { label: 'HSTS',          ok: extractedData.hstsPresent },
          { label: 'X-Frame-Opt.', ok: !!extractedData.xFrameOptions },
          { label: 'Referrer Policy', ok: !!extractedData.referrerPolicy },
          { label: 'Login Form',    ok: !extractedData.hasLogin,   invert: true },
          { label: 'JS Obfuscation',ok: !extractedData.hasObfuscation, invert: true },
        ].map(({ label, ok }) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 14px', borderRadius: '10px',
            background: ok ? 'rgba(0,255,153,.05)' : 'rgba(255,122,64,.05)',
            border: `1px solid ${ok ? 'rgba(0,255,153,.18)' : 'rgba(255,122,64,.18)'}`,
          }}>
            {ok
              ? <CheckCircle2 size={13} color="#00FF99" />
              : <XCircle      size={13} color="#FF7A40" />
            }
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: ok ? '#00FF99' : '#FF7A40', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
          </div>
        ))}
      </motion.div>

      {/* ── Report sections ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '14px' }}>
        {report.sections.map((section, i) => {
          const Icon = iconMap[section.icon] || Shield
          const s = SECTION_STYLES[section.color] || SECTION_STYLES.cyan
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + i * 0.07, duration: 0.5 }}
              style={{
                padding: '20px', borderRadius: '16px',
                background: s.bg, border: `1px solid ${s.border}`,
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', background: `radial-gradient(circle, ${s.glow} 0%, transparent 70%)`, pointerEvents: 'none' }} />
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ padding: '7px', borderRadius: '10px', background: s.bg, border: `1px solid ${s.border}` }}>
                    <Icon size={14} color={s.text} />
                  </div>
                  <h3 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 700, color: s.text, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{section.title}</h3>
                </div>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'rgba(255,255,255,.55)', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{section.content}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ── Raw data — griglia più ampia ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        style={{
          background: 'rgba(13,13,24,.7)', border: '1px solid rgba(255,255,255,.06)',
          borderRadius: '18px', padding: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          <Server size={13} color="rgba(255,255,255,.25)" />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: 'rgba(255,255,255,.25)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Dati Grezzi Estratti</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          {[
            { title: 'Meta Tags',        items: extractedData.metaTags?.map(m => `${m.name}: ${m.content}`).slice(0,15)||[],    color: '#00E5FF', icon: Globe },
            { title: 'Script Sources',   items: extractedData.scripts?.slice(0,20)||[],                                          color: '#9B5FFF', icon: Code  },
            { title: 'Domini Esterni',   items: extractedData.externalDomains?.slice(0,30)||[],                                   color: '#FF3B8B', icon: ExternalLink },
            { title: 'Cookie',           items: extractedData.cookies?.map(c=>`${c.name} [${c.flags||'no flags'}]`).slice(0,15)||[], color: '#F5C842', icon: Cookie },
            { title: 'Tracker',          items: extractedData.trackerList||[],                                                    color: '#FF7A40', icon: Eye   },
          ].filter(s => s.items.length > 0).map(({ title, items, color, icon: Icon }) => (
            <div key={title} style={{
              padding: '16px', borderRadius: '14px',
              border: `1px solid ${color}18`, background: `${color}05`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Icon size={12} color={color} />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {title} ({items.length})
                </span>
              </div>
              <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {items.map((item, i) => (
                  <div key={i} style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: '9px',
                    color: 'rgba(255,255,255,.4)', wordBreak: 'break-all', lineHeight: 1.6,
                    padding: '4px 8px', borderRadius: '6px', background: 'rgba(255,255,255,.03)',
                  }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
