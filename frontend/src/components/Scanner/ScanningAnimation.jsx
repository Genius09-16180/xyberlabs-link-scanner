// components/Scanner/ScanningAnimation.jsx
import { motion } from 'framer-motion'
import { Shield, Zap, Eye, Code, Globe } from 'lucide-react'

const steps = [
  { icon: Globe,  label: 'Fetching HTML...', color: 'cyan'   },
  { icon: Code,   label: 'Parsing scripts & meta...', color: 'violet' },
  { icon: Eye,    label: 'Rilevando tracker...', color: 'pink'  },
  { icon: Shield, label: 'Analisi sicurezza...', color: 'neon'  },
  { icon: Zap,    label: 'Generando report AI...', color: 'gold'  },
]

const colorMap = {
  cyan:   'text-cyan border-cyan/30 bg-cyan/8',
  violet: 'text-violet border-violet/30 bg-violet/8',
  pink:   'text-pink border-pink/30 bg-pink/8',
  neon:   'text-neon border-neon/30 bg-neon/8',
  gold:   'text-gold border-gold/30 bg-gold/8',
}

export default function ScanningAnimation({ url }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Radar ring */}
      <div className="flex justify-center mb-10">
        <div className="relative w-40 h-40">
          {/* Outer rings */}
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border border-cyan/15"
              animate={{ scale: [1, 1.6 + i * 0.4], opacity: [0.5, 0] }}
              transition={{ duration: 2, delay: i * 0.5, repeat: Infinity, ease: 'easeOut' }}
              style={{ margin: `${i * 10}px` }}
            />
          ))}

          {/* Inner ring */}
          <div className="absolute inset-4 rounded-full border border-cyan/25 flex items-center justify-center">
            {/* Rotating scanner beam */}
            <motion.div
              className="absolute inset-0 rounded-full overflow-hidden"
              style={{ background: 'conic-gradient(from 0deg, transparent 70%, rgba(0,229,255,.2) 100%)' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
            />

            {/* Center dot */}
            <div className="relative w-12 h-12 rounded-full bg-cyan/10 border border-cyan/30 flex items-center justify-center">
              <Shield size={22} className="text-cyan" />
            </div>
          </div>
        </div>
      </div>

      {/* URL being scanned */}
      <div className="text-center mb-8">
        <div className="font-mono text-[10px] text-white/30 tracking-widest uppercase mb-2">Analisi in corso</div>
        <div className="font-mono text-sm text-cyan/80 bg-bg2/60 border border-cyan/10 rounded-lg px-4 py-2 inline-block max-w-full truncate">
          {url}
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map(({ icon: Icon, label, color }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className={`flex items-center gap-3 p-3 rounded-xl border ${colorMap[color]}`}
          >
            {/* Status dot */}
            <motion.div
              className={`w-2 h-2 rounded-full bg-current flex-shrink-0`}
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
            />

            <Icon size={14} className="flex-shrink-0" />

            <span className="font-mono text-xs tracking-wide flex-1">{label}</span>

            {/* Progress bar */}
            <motion.div
              className="h-1 bg-current rounded-full opacity-30"
              initial={{ width: 0 }}
              animate={{ width: '4rem' }}
              transition={{ delay: i * 0.4 + 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
