import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import OpportunityCard from '../components/ui/OpportunityCard'
import api from '../services/api'
import toast from 'react-hot-toast'
import { OPPORTUNITY_TYPES, SKILLS } from '../utils/helpers'

const typeColors = {
  job: 'badge-accent',
  internship: 'badge-green',
  freelance: 'badge-amber',
  cofounder: 'badge-surface',
}

function OpportunityForm({ onClose, onSuccess }) {
  const [form, setForm] = useState({ title: '', type: 'job', description: '', company: '', location: 'Remote', salary: '', skills: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/opportunities', {
        ...form,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean)
      })
      toast.success('Opportunity posted!')
      onSuccess?.()
      onClose()
    } catch (err) { toast.error(err.message) }
    finally { setSubmitting(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="card w-full max-w-lg p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-text-primary">Post Opportunity</h2>
          <button onClick={onClose} className="btn btn-ghost p-1.5"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div><label className="label">Title *</label>
            <input className="input" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Senior React Developer" /></div>
          <div><label className="label">Type *</label>
            <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              {OPPORTUNITY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div><label className="label">Description *</label>
            <textarea className="input resize-none" rows={4} required value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the role and requirements..." /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Company</label>
              <input className="input" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Company name" /></div>
            <div><label className="label">Location</label>
              <input className="input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Remote / Srinagar" /></div>
          </div>
          <div><label className="label">Required Skills (comma separated)</label>
            <input className="input" value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} placeholder="React, Node.js" /></div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary flex-1">{submitting ? 'Posting…' : 'Post Opportunity'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Opportunities() {
  const { user } = useAuth()
  const [activeType, setActiveType] = useState('')
  const [showForm, setShowForm] = useState(false)

  const params = {}
  if (activeType) params.type = activeType

  const { data, loading, refetch } = useApi('/opportunities', { params })
  const opportunities = data?.data || []

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-display text-text-primary">Opportunities</h1>
          <p className="text-sm text-text-secondary mt-0.5">Jobs, internships, freelance, and co-founder searches</p>
        </div>
        {user && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary gap-2">
            <Plus size={15} /> Post Opportunity
          </button>
        )}
      </div>

      {/* Type Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setActiveType('')}
          className={`btn btn-sm ${!activeType ? 'btn-primary' : 'btn-secondary'}`}>All</button>
        {OPPORTUNITY_TYPES.map(t => (
          <button key={t.value} onClick={() => setActiveType(activeType === t.value ? '' : t.value)}
            className={`btn btn-sm ${activeType === t.value ? 'btn-primary' : 'btn-secondary'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading
        ? <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="card p-5 h-32 skeleton" />)}</div>
        : opportunities.length === 0
          ? <div className="text-center py-20"><p className="text-text-muted text-sm">No opportunities found.</p></div>
          : <div className="flex flex-col gap-3">
              {opportunities.map(o => <OpportunityCard key={o._id} opportunity={o} />)}
            </div>
      }

      {showForm && <OpportunityForm onClose={() => setShowForm(false)} onSuccess={refetch} />}
    </div>
  )
}