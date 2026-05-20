// components/Layout/Navbar.jsx — Logo SVG reale XyberLabs + fix layout
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, LayoutDashboard, Menu, X } from 'lucide-react'

const XyberLabsLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3118.98 980.96" height="28" aria-label="XyberLabs">
    <defs>
      <style>{`.xl-s0{opacity:.55}.xl-s1{fill:#00E5FF}`}</style>
    </defs>
    <polygon className="xl-s1" points="665.26 582.16 935.86 980.96 676.2 980.96 405.59 582.16 665.26 582.16"/>
    <g>
      <g className="xl-s0">
        <polygon className="xl-s1" points="694.41 183.56 423.81 582.35 405.59 582.35 676.2 183.56 694.41 183.56"/>
        <polygon className="xl-s1" points="774.9 183.56 504.29 582.35 486.07 582.35 756.68 183.56 774.9 183.56"/>
        <polygon className="xl-s1" points="855.39 183.56 584.78 582.35 566.55 582.35 837.16 183.56 855.39 183.56"/>
        <polygon className="xl-s1" points="935.87 183.56 665.27 582.35 647.04 582.35 917.64 183.56 935.87 183.56"/>
      </g>
      <polygon className="xl-s1" points="694.41 183.56 423.81 582.35 405.59 582.35 676.2 183.56 694.41 183.56"/>
      <polygon className="xl-s1" points="774.9 183.56 504.29 582.35 486.07 582.35 756.68 183.56 774.9 183.56"/>
      <polygon className="xl-s1" points="855.39 183.56 584.78 582.35 566.55 582.35 837.16 183.56 855.39 183.56"/>
      <polygon className="xl-s1" points="935.87 183.56 665.27 582.35 647.04 582.35 917.64 183.56 935.87 183.56"/>
    </g>
    <polygon className="xl-s1" points="270.61 398.79 0 797.59 259.67 797.59 530.28 398.79 270.61 398.79"/>
    <g>
      <g className="xl-s0">
        <polygon className="xl-s1" points="241.46 0 512.06 398.79 530.28 398.79 259.67 0 241.46 0"/>
        <polygon className="xl-s1" points="160.97 0 431.58 398.79 449.8 398.79 179.19 0 160.97 0"/>
        <polygon className="xl-s1" points="80.48 0 351.09 398.79 369.31 398.79 98.71 0 80.48 0"/>
        <polygon className="xl-s1" points="0 0 270.6 398.79 288.83 398.79 18.23 0 0 0"/>
      </g>
      <polygon className="xl-s1" points="241.46 0 512.06 398.79 530.28 398.79 259.67 0 241.46 0"/>
      <polygon className="xl-s1" points="160.97 0 431.58 398.79 449.8 398.79 179.19 0 160.97 0"/>
      <polygon className="xl-s1" points="80.48 0 351.09 398.79 369.31 398.79 98.71 0 80.48 0"/>
      <polygon className="xl-s1" points="0 0 270.6 398.79 288.83 398.79 18.23 0 0 0"/>
    </g>
    <g>
      <path className="xl-s1" d="M1219.83,464.47l-144.37-202.12h157.65l63.52,95.28h3.46l64.1-95.28h155.34l-143.22,202.12,143.22,202.12h-155.34l-63.52-94.71h-4.62l-62.95,94.71h-157.65l144.37-202.12Z"/>
      <path className="xl-s1" d="M1609.22,523.37l-154.77-261.02h152.46l65.26,124.74h6.93l65.26-124.74h152.46l-154.77,261.02v143.22h-132.82v-143.22Z"/>
      <path className="xl-s1" d="M1881.42,262.35h263.91c87.78,0,128.78,47.93,128.78,111.45,0,39.85-20.79,76.23-60.06,88.93,39.27,17.9,60.06,47.35,60.06,92.97,0,63.52-41,110.88-128.78,110.88h-263.91v-404.24ZM2112.42,424.05c18.48,0,33.49-8.66,33.49-28.87,0-21.37-15.01-28.87-33.49-28.87h-106.83v57.75h106.83ZM2112.42,562.64c18.48,0,33.49-8.66,33.49-30.03,0-19.63-15.01-27.72-33.49-27.72h-106.83v57.75h106.83Z"/>
      <path className="xl-s1" d="M2320.31,262.35h342.45v103.95h-211.94v46.2h211.94v103.95h-211.94v46.2h211.94v103.95h-342.45v-404.24Z"/>
      <path className="xl-s1" d="M2714.74,262.35h260.44c87.78,0,143.79,49.66,143.79,132.82,0,56.59-25.41,95.28-68.72,113.76l62.37,157.65h-140.33l-50.82-143.79h-83.74v143.79h-123v-404.24ZM2944.58,433.29c24.25,0,41-8.66,41-34.07s-16.75-32.92-41-32.92h-106.83v66.99h106.83Z"/>
    </g>
    <g>
      <path className="xl-s1" d="M1088.39,735.16h59.49v134.51h71.65v46.56h-131.15v-181.07Z"/>
      <path className="xl-s1" d="M1275.41,735.16h98.81l45.53,181.07h-59.24l-6.98-28.45h-57.42l-6.98,28.45h-59.24l45.53-181.07ZM1306.71,843.29h35.96l-15-61.56h-5.95l-15,61.56Z"/>
      <path className="xl-s1" d="M1436.56,735.16h118.21c39.32,0,57.68,21.47,57.68,49.92,0,17.85-9.31,34.14-26.9,39.84,17.59,8.02,26.9,21.21,26.9,41.65,0,28.45-18.37,49.66-57.68,49.66h-118.21v-181.07ZM1540.03,807.59c8.28,0,15-3.88,15-12.93,0-9.57-6.73-12.93-15-12.93h-47.85v25.87h47.85ZM1540.03,869.67c8.28,0,15-3.88,15-13.45,0-8.79-6.73-12.42-15-12.42h-47.85v25.87h47.85Z"/>
      <path className="xl-s1" d="M1630.31,869.67h97.52c9.31,0,13.19-3.62,13.19-9.83,0-7.24-3.88-10.86-13.45-10.86h-43.2c-33.11,0-57.68-19.92-57.68-57.17s24.57-56.65,57.68-56.65h105.02v46.56h-93.12c-6.98,0-12.93,2.59-12.93,10.35s5.95,10.35,12.93,10.35h44.23c34.66,0,57.68,19.66,57.68,55.87s-23.02,57.94-57.68,57.94h-110.19v-46.56Z"/>
    </g>
  </svg>
)

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { to: '/',      label: 'Scanner',  icon: Shield },
    { to: '/board', label: 'Board',    icon: LayoutDashboard },
  ]

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-bg0/90 backdrop-blur-2xl' : 'bg-bg0/70 backdrop-blur-xl'
        }`}
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-5">

          {/* Logo XyberLabs reale */}
          <a
            href="https://xyberlabs.altervista.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 opacity-90 hover:opacity-100 transition-opacity"
            aria-label="XyberLabs"
          >
            <XyberLabsLogo />
          </a>

          {/* Separatore verticale */}
          <div className="w-px h-5 bg-white/10 flex-shrink-0" />

          {/* Tool badge */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full flex-shrink-0"
            style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.18)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
            <span className="font-mono text-[10px] text-cyan tracking-widest uppercase">Link Scanner AI</span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1 ml-auto">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs tracking-widest uppercase transition-all duration-200 ${
                  location.pathname === to
                    ? 'text-cyan'
                    : 'text-white/40 hover:text-white/70'
                }`}
                style={location.pathname === to ? {
                  background: 'rgba(0,229,255,0.07)',
                  border: '1px solid rgba(0,229,255,0.18)',
                } : {
                  background: 'transparent',
                  border: '1px solid transparent',
                }}
              >
                <Icon size={13} />
                {label}
              </Link>
            ))}
          </div>

          {/* Back to site */}
          <a
            href="https://xyberlabs.altervista.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 ml-2 px-4 py-2 rounded-full font-mono font-bold text-[11px] tracking-widest uppercase transition-all duration-200 hover:scale-105 flex-shrink-0"
            style={{
              background: 'rgba(0,229,255,1)',
              color: '#07070D',
              boxShadow: '0 0 22px rgba(0,229,255,0.35)',
            }}
          >
            xyberlabs.it ↗
          </a>

          {/* Mobile burger */}
          <button
            className="md:hidden ml-auto p-2 text-white/50 hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Gradient bottom line */}
        <div style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.15), transparent)',
        }} />
      </motion.nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8"
          style={{ background: 'rgba(7,7,13,0.97)', backdropFilter: 'blur(24px)' }}
        >
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-5 right-6 text-white/30 hover:text-white"
          >
            <X size={22} />
          </button>
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 font-mono text-lg tracking-widest uppercase text-white/50 hover:text-cyan transition-colors"
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
