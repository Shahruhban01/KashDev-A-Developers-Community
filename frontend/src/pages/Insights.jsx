import { useApi } from '../hooks/useApi'
import { Users, Code2, Briefcase, TrendingUp, MapPin, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

function BarRow({ label, value, max, color = 'bg-accent' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-text-secondary w-28 flex-shrink-0 truncate">{label}</span>
      <div className="flex-1 bg-surface-3 rounded-full h-2 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold tabular text-text-primary w-8 text-right">{value}</span>
    </div>
  )
}

export default function Insights() {
  const { data, loading } = useApi('/analytics/insights')
  const d = data?.data

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1,2,3,4].map(i => <div key={i} className="card h-24 skeleton" />)}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3].map(i => <div key={i} className="card h-64 skeleton" />)}
      </div>
    </div>
  )

  const stats       = d?.stats       || {}
  const byDistrict  = d?.byDistrict  || []
  const topSkills   = d?.topSkills   || []
  const topCompanies= d?.topCompanies|| []
  const experience  = d?.experience  || []
  const growth      = d?.growth      || []

  const maxDistrict = Math.max(...byDistrict.map(x => x.count), 1)
  const maxSkill    = Math.max(...topSkills.map(x => x.count), 1)
  const maxCompany  = Math.max(...topCompanies.map(x => x.count), 1)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-1">Analytics</p>
        <h1 className="text-2xl font-bold font-display text-text-primary">Platform Insights</h1>
        <p className="text-sm text-text-secondary mt-1">Real-time data from the Kashmir developer ecosystem</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Developers', value: stats.totalUsers,        icon: Users,      color: 'text-accent'  },
          { label: 'Projects',         value: stats.totalProjects,     icon: Code2,      color: 'text-green'   },
          { label: 'Open to Work',     value: stats.openToWork,        icon: Briefcase,  color: 'text-amber'   },
          { label: 'Mentors',          value: stats.mentors,           icon: Star,       color: 'text-accent'  },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <Icon size={18} className={`${color} mb-2`} />
            <p className="text-2xl font-bold font-display tabular text-text-primary">{value ?? '—'}</p>
            <p className="text-xs text-text-muted mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Developers by District */}
        <div className="card p-5 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-5">
            <MapPin size={15} className="text-amber" />
            <h3 className="font-semibold text-text-primary text-sm">Developers by District</h3>
          </div>
          {byDistrict.length === 0
            ? <p className="text-xs text-text-faint">No location data yet.</p>
            : (
              <div className="space-y-3">
                {byDistrict.slice(0, 10).map(({ district, count }) => (
                  <Link key={district} to={`/developers?district=${district}`}>
                    <BarRow label={district} value={count} max={maxDistrict} color="bg-amber" />
                  </Link>
                ))}
              </div>
            )
          }
        </div>

        {/* Top Skills */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-5">
            <Code2 size={15} className="text-green" />
            <h3 className="font-semibold text-text-primary text-sm">Top Skills</h3>
          </div>
          <div className="space-y-3">
            {topSkills.slice(0, 10).map(({ skill, count }) => (
              <BarRow key={skill} label={skill} value={count} max={maxSkill} color="bg-green" />
            ))}
          </div>
        </div>

        {/* Top Companies */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-5">
            <Briefcase size={15} className="text-accent" />
            <h3 className="font-semibold text-text-primary text-sm">Top Companies</h3>
          </div>
          <div className="space-y-3">
            {topCompanies.slice(0, 10).map(({ company, count }) => (
              <BarRow key={company} label={company} value={count} max={maxCompany} color="bg-accent" />
            ))}
          </div>
        </div>

        {/* Experience Distribution */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={15} className="text-accent" />
            <h3 className="font-semibold text-text-primary text-sm">Experience Levels</h3>
          </div>
          <div className="space-y-3">
            {experience.map(({ experience: exp, count }) => (
              <BarRow key={exp} label={exp} value={count}
                max={Math.max(...experience.map(e => e.count), 1)} color="bg-accent" />
            ))}
          </div>
        </div>

        {/* Growth */}
        {growth.length > 0 && (
          <div className="card p-5 sm:col-span-2">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp size={15} className="text-green" />
              <h3 className="font-semibold text-text-primary text-sm">Developer Growth (Last 6 Months)</h3>
            </div>
            <div className="flex items-end gap-2 h-32">
              {growth.map((g, i) => {
                const maxG = Math.max(...growth.map(x => x.count), 1)
                const h    = Math.max(4, Math.round((g.count / maxG) * 100))
                const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-text-faint tabular">{g.count}</span>
                    <div className="w-full bg-accent rounded-t transition-all duration-500"
                      style={{ height: `${h}%` }} />
                    <span className="text-[10px] text-text-faint">{months[g.month - 1]}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}