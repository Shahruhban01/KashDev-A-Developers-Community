import { Link } from 'react-router-dom'
import { ArrowRight, Code2, Sparkles } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative pt-24 pb-20 px-4 sm:px-6 overflow-hidden">
      {/* Subtle dot grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,#2e2e32_1px,transparent_1px)] bg-[size:32px_32px] opacity-50" />
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[420px] bg-accent/6 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 border border-accent/30 bg-accent/8 text-accent text-xs font-medium px-3 py-1.5 rounded-full mb-7">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          Kashmir's Developer Community · Est. 2024
        </div>

        <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-text-primary mb-5 leading-[1.1] tracking-tight">
          Where Kashmiri Developers<br />
          <span className="text-gradient">Build Together</span>
        </h1>

        <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto mb-9 leading-relaxed">
          Discover talented engineers from the Valley, showcase your work,
          find your next opportunity, and help build a stronger tech ecosystem — together.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/register" className="btn btn-primary btn-lg gap-2 group">
            Join the Community
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link to="/developers" className="btn btn-secondary btn-lg">
            Explore Developers
          </Link>
        </div>

        {/* Social proof row */}
        <div className="mt-10 flex items-center justify-center gap-6 text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="flex -space-x-1.5">
              {['A','B','R','S','Z'].map((l, i) => (
                <span key={i} className="w-6 h-6 rounded-full bg-accent-subtle border border-surface-0 flex items-center justify-center text-[9px] font-bold text-accent-text">{l}</span>
              ))}
            </span>
            200+ developers joined
          </span>
          <span className="w-px h-4 bg-surface-border" />
          <span className="flex items-center gap-1"><Sparkles size={11} className="text-amber" /> Free to join</span>
        </div>
      </div>
    </section>
  )
}