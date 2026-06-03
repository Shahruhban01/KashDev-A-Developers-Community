import { MapPin, Clock, Building2, Bookmark } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'
import api from '../../services/api'
import { timeAgo } from '../../utils/helpers'
import toast from 'react-hot-toast'

const typeConfig = {
  job:        { label: 'Full-time',   className: 'badge-accent' },
  internship: { label: 'Internship',  className: 'badge-green' },
  freelance:  { label: 'Freelance',   className: 'badge-amber' },
  cofounder:  { label: 'Co-founder',  className: 'badge-surface' },
}

export default function OpportunityCard({ opportunity }) {
  const { user } = useAuth()
  const config = typeConfig[opportunity.type] || typeConfig.job
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    if (!user) { toast.error('Login to save opportunities'); return }
    try {
      const { data } = await api.post(`/opportunities/${opportunity._id}/save`)
      setSaved(data.saved)
      toast.success(data.saved ? 'Saved!' : 'Removed from saved')
    } catch { toast.error('Failed to save') }
  }

  return (
    <div className="card p-5 flex flex-col gap-3 animate-fade-in hover:border-surface-5 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`badge ${config.className}`}>{config.label}</span>
          </div>
          <h3 className="font-semibold text-text-primary text-sm">{opportunity.title}</h3>
        </div>
        <button onClick={handleSave}
          className={`p-1.5 rounded-lg transition-all flex-shrink-0 ${
            saved ? 'text-accent bg-accent-subtle' : 'text-text-muted hover:text-text-primary hover:bg-surface-3'
          }`}>
          <Bookmark size={14} className={saved ? 'fill-current' : ''} />
        </button>
      </div>

      <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">{opportunity.description}</p>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-text-muted">
        {opportunity.company && (
          <span className="flex items-center gap-1.5"><Building2 size={11} />{opportunity.company}</span>
        )}
        <span className="flex items-center gap-1.5"><MapPin size={11} />{opportunity.location || 'Remote'}</span>
        <span className="flex items-center gap-1.5"><Clock size={11} />{timeAgo(opportunity.createdAt)}</span>
      </div>

      {opportunity.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {opportunity.skills.slice(0, 4).map(s => <span key={s} className="tag">{s}</span>)}
        </div>
      )}
    </div>
  )
}