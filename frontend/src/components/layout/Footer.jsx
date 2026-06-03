import { Link } from 'react-router-dom'
import { Code2, Github, Twitter } from 'lucide-react'

// Replace the Platform links array only
// {[
//   ['Developers',  '/developers'],
//   ['Companies',   '/companies'],
//   ['Projects',    '/projects'],
//   ['Opportunities','/opportunities'],
//   ['Forum',       '/forum'],
//   ['Hall of Fame','/hall-of-fame'],
//   ['Insights',    '/insights'],
//   ['Nearby',      '/developers/nearby'],
// ].map(([label, to]) => (
//   <Link key={to} to={to} className="text-sm text-text-muted hover:text-text-primary transition-colors">{label}</Link>
// ))}

export default function Footer() {
  return (
    <footer className="border-t border-surface-border bg-surface-0 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid sm:grid-cols-3 gap-8">
        <div>
          <Link to="/" className="flex items-center gap-2 text-text-primary font-bold font-display mb-3">
            <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
              <Code2 size={13} className="text-white" />
            </div>
            KashDev
          </Link>
          <p className="text-xs text-text-muted leading-relaxed">
            The home for Kashmiri software developers. Build, collaborate, grow.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-3">Platform</p>
          <div className="flex flex-col gap-2">
            {[
              ['Developers', '/developers'],
              ['Companies', '/companies'],
              ['Projects', '/projects'],
              ['Opportunities', '/opportunities'],
              ['Forum', '/forum'],
              ['Hall of Fame', '/hall-of-fame'],
              ['Insights', '/insights'],
              ['Nearby', '/developers/nearby']
            ].map(([label, to]) => (
              <Link key={to} to={to} className="text-sm text-text-muted hover:text-text-primary transition-colors">{label}</Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-3">Community</p>
          <div className="flex gap-3">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer"
              className="p-2 rounded-lg bg-surface-2 border border-surface-border text-text-muted hover:text-text-primary hover:border-surface-5 transition-all">
              <Github size={15} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
              className="p-2 rounded-lg bg-surface-2 border border-surface-border text-text-muted hover:text-text-primary hover:border-surface-5 transition-all">
              <Twitter size={15} />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-surface-border px-4 sm:px-6 py-4">
        <p className="text-xs text-text-muted text-center">© {new Date().getFullYear()} KashDev. Built for the Kashmir tech ecosystem.</p>
      </div>
    </footer>
  )
}