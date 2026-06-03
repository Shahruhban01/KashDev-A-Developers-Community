import { Link } from 'react-router-dom'
import { ArrowRight, Github } from 'lucide-react'

export default function JoinCTA() {
  return (
    <section className="py-20 px-4 sm:px-6 bg-surface-1 border-t border-surface-border">
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 border border-surface-border bg-surface-2 text-text-muted text-xs px-3 py-1.5 rounded-full mb-6">
          Free forever · No credit card required
        </div>
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-text-primary mb-4 leading-tight">
          Ready to join the community?
        </h2>
        <p className="text-sm text-text-secondary mb-9 max-w-lg mx-auto leading-relaxed">
          Create your developer profile in minutes. Connect with engineers across Kashmir,
          showcase your projects, and find opportunities built for our ecosystem.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/register" className="btn btn-primary btn-lg gap-2 group">
            Create Free Profile
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer"
            className="btn btn-secondary btn-lg gap-2">
            <Github size={15} /> Star on GitHub
          </a>
        </div>
      </div>
    </section>
  )
}