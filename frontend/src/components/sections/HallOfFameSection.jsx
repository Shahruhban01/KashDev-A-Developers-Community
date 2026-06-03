import { Link } from 'react-router-dom'
import { Trophy, ArrowRight, Star, Rocket, Building2, Code } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import Avatar from '../ui/Avatar'

const categoryConfig = {
  'top-contributor': { label: 'Top Contributor', icon: Star,     color: 'text-amber'    },
  'startup-founder': { label: 'Startup Founder', icon: Rocket,   color: 'text-accent'   },
  'major-company':   { label: 'Major Company',   icon: Building2, color: 'text-green'   },
  'open-source':     { label: 'Open Source',     icon: Code,     color: 'text-purple-400' },
}

export default function HallOfFameSection() {
  const { data, loading } = useApi('/developers/hall-of-fame')
  const profiles = (data?.data || []).slice(0, 6)

  return (
    <section className="py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold text-amber uppercase tracking-widest mb-1">Recognition</p>
            <h2 className="section-title">Hall of Fame</h2>
            <p className="section-sub">Celebrating extraordinary Kashmiri engineers</p>
          </div>
          <Link to="/hall-of-fame" className="btn btn-ghost btn-sm hidden sm:inline-flex gap-1 group">
            View all <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="card h-24 skeleton" />)}
          </div>
        )}

        {!loading && profiles.length === 0 && (
          <div className="card p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.05),transparent_70%)]" />
            <Trophy size={32} className="text-amber mx-auto mb-3" />
            <p className="text-sm text-text-secondary mb-4">Hall of Fame inductees coming soon.</p>
            <Link to="/hall-of-fame" className="btn btn-secondary btn-sm">Learn more</Link>
          </div>
        )}

        {profiles.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map(profile => {
              const config = categoryConfig[profile.hallOfFameCategory]
              const Icon = config?.icon || Trophy
              return (
                <Link key={profile._id} to={`/developers/${profile.user?.username}`}
                  className="card card-hover p-5 flex items-center gap-4 animate-fade-in">
                  <Avatar name={profile.user?.name} src={profile.user?.avatar} size="lg" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-text-primary truncate">{profile.user?.name}</p>
                    <p className="text-xs text-text-muted mb-1">@{profile.user?.username}</p>
                    {config && (
                      <span className={`flex items-center gap-1 text-[11px] font-medium ${config.color}`}>
                        <Icon size={10} /> {config.label}
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}