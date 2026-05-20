// components/Layout/Footer.jsx
export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-6 mt-auto">
      <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-3">
        <span className="font-mono text-[10px] text-white/25 tracking-widest uppercase">
          © 2026 XyberLabs · Link Scanner AI v1.0
        </span>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] text-white/20 uppercase tracking-widest">
            Powered by Groq · LLaMA 3.1
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
            <span className="font-mono text-[10px] text-neon/60 tracking-widest uppercase">System Online</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
