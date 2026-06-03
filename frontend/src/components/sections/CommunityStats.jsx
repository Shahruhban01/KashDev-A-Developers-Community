import { Users, Code2, Briefcase, MapPin } from 'lucide-react'
import { useApi } from '../../hooks/useApi'

const staticStats = [
  { label: 'Districts Represented', value: '10+', icon: MapPin },
]

export default function CommunityStats() {
  const { data } = useApi('/users/stats')
  const stats = data?.data || {}

  const items = [
    { label: 'Developers',    value: stats.users        || '—', icon: Users },
    { label: 'Projects',      value: stats.projects     || '—', icon: Code2 },
    { label: 'Opportunities', value: stats.opportunities || '—', icon: Briefcase },
    { label: 'Districts',     value: '10+',                     icon: MapPin },
  ]

  return (
    <section className="border-y border-surface-border bg-surface-1">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {items.map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center group">
              <div className="flex justify-center mb-2">
                <div className="w-9 h-9 rounded-lg bg-accent-subtle border border-accent/20 flex items-center justify-center group-hover:bg-accent/15 transition-colors">
                  <Icon size={17} className="text-accent-text" />
                </div>
              </div>
              <p className="text-2xl font-bold font-display tabular text-text-primary">{value}</p>
              <p className="text-xs text-text-muted mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}