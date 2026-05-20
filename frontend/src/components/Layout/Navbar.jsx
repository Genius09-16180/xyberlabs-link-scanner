// ─────────────────────────────────────────────────────────
//  components/Layout/Navbar.jsx
// ─────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, LayoutDashboard, Menu, X, Zap } from 'lucide-react'

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { to: '/',      label: 'Scanner', icon: Shield },
    { to: '/board', label: 'Board',   icon: LayoutDashboard },
  ]

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-bg0/80 backdrop-blur-2xl border-b border-white/5'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-6">

          {/* Logo */}
          <a
            href="https://xyberlabs.it"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 flex-shrink-0 group"
          >
            <div className="w-7 h-7 rounded-lg bg-cyan/10 border border-cyan/30 flex items-center justify-center group-hover:bg-cyan/20 transition-colors">
              <Zap size={14} className="text-cyan" />
            </div>
            <span className="font-mono text-sm font-bold tracking-tight">
              Xyber<span className="text-cyan">Labs</span>
            </span>
          </a>

          {/* Tool label */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan/8 border border-cyan/20">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
            <span className="font-mono text-[10px] text-cyan tracking-widest uppercase">Link Scanner AI</span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1 ml-auto">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs tracking-widest uppercase transition-all duration-200 ${
                  location.pathname === to
                    ? 'text-cyan bg-cyan/8 border border-cyan/20'
                    : 'text-white/50 hover:text-white hover:bg-white/4'
                }`}
              >
                <Icon size={13} />
                {label}
              </Link>
            ))}
          </div>

          {/* Back to site */}
          <a
            href="https://xyberlabs.it"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:block ml-3 px-4 py-2 rounded-full bg-cyan text-black font-mono font-bold text-[11px] tracking-widest uppercase hover:scale-105 hover:shadow-glow-sm transition-all duration-200"
          >
            xyberlabs.it ↗
          </a>

          {/* Mobile burger */}
          <button
            className="md:hidden ml-auto p-2 text-white/60 hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Gradient line */}
        <div className="h-px bg-gradient-to-r from-transparent via-cyan/20 to-transparent opacity-60" />
      </motion.nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-bg0/98 backdrop-blur-3xl flex flex-col items-center justify-center gap-6"
        >
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 font-mono text-lg tracking-widest uppercase text-white/60 hover:text-cyan transition-colors"
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </motion.div>
      )}
    </>
  )
}
