import { Trophy, Star, Rocket, Code, Building2 } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import Avatar from '../components/ui/Avatar'
import { Link } from 'react-router-dom'

const categoryConfig = {
  'top-contributor': { label: 'Top Contributor', icon: Star, color: 'text-amber' },
  'startup-founder': { label: 'Startup Founder', icon: Rocket, color: 'text-accent' },
  'major-company':   { label: 'Major Company',   icon: Building2, color: 'text-green' },
  'open-source':     { label: 'Open Source',     icon: Code, color: 'text-purple-400' },
}

export default function HallOfFame() {
  const { data, loading } = useApi('/developers/hall-of-fame')
  const profiles = data?.data || []

  const grouped = profiles.reduce((acc, p) => {
    const cat = p.hallOfFameCategory
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(p)
    return acc
  }, {})

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="w-14 h-14 rounded-2xl bg-amber-muted border border-amber/20 flex items-center justify-center mx-auto mb-4">
          <Trophy size={28} className="text-amber" />
        </div>
        <h1 className="text-3xl font-bold font-display text-text-primary mb-2">Hall of Fame</h1>
        <p className="text-sm text-text-secondary max-w-lg mx-auto">
          Celebrating Kashmiri developers making extraordinary impact — in startups, open source, and the world's top companies.
        </p>
      </div>

      {loading && <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i => <div key={i} className="card h-40 skeleton" />)}</div>}

      {!loading && profiles.length === 0 && (
        <div className="text-center py-20">
          <p className="text-text-muted text-sm">Hall of Fame coming soon.</p>
        </div>
      )}

      {Object.entries(grouped).map(([category, members]) => {
        const config = categoryConfig[category]
        if (!config) return null
        const Icon = config.icon
        return (
          <div key={category} className="mb-10">
            <div className="flex items-center gap-2.5 mb-5">
              <Icon size={18} className={config.color} />
              <h2 className="text-lg font-bold font-display text-text-primary">{config.label}</h2>
              <span className="badge badge-surface">{members.length}</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map(profile => (
                <Link key={profile._id} to={`/developers/${profile.user?.username}`}
                  className="card card-hover p-5 flex items-start gap-4 animate-fade-in">
                  <Avatar name={profile.user?.name} src={profile.user?.avatar} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="font-semibold text-sm text-text-primary truncate">{profile.user?.name}</p>
                      <Icon size={11} className={`${config.color} flex-shrink-0`} />
                    </div>
                    <p className="text-xs text-text-muted mb-2">@{profile.user?.username}</p>
                    {profile.user?.bio && (
                      <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">{profile.user.bio}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}