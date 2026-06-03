import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Hash, Users, Lock, Globe, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import api from '../services/api'
import toast from 'react-hot-toast'

const CATEGORIES = [
  'general', 'react', 'nodejs', 'python', 'flutter',
  'ai-ml', 'cybersecurity', 'devops', 'startups', 'open-source', 'freelance'
]

function GroupCard({ group }) {
  return (
    <Link to={`/groups/${group.slug}`}
      className="card card-hover p-5 flex flex-col gap-3 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-subtle border border-accent-muted flex items-center justify-center flex-shrink-0">
            <Hash size={18} className="text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-sm text-text-primary">{group.name}</h3>
              {group.type === 'private'
                ? <Lock size={11} className="text-text-faint" />
                : <Globe size={11} className="text-text-faint" />
              }
            </div>
            <p className="text-xs text-text-muted capitalize">{group.category}</p>
          </div>
        </div>
        <span className="badge badge-surface flex items-center gap-1">
          <Users size={10} /> {group.memberCount}
        </span>
      </div>
      {group.description && (
        <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">{group.description}</p>
      )}
      {group.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {group.tags.slice(0, 4).map(t => <span key={t} className="tag">{t}</span>)}
        </div>
      )}
    </Link>
  )
}

function CreateGroupModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', description: '', type: 'public', category: 'general', tags: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { data } = await api.post('/groups', {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      })
      toast.success('Group created!')
      onSuccess?.(data.data)
      onClose()
    } catch (err) { toast.error(err.message || 'Failed to create group') }
    finally { setSubmitting(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="card w-full max-w-md p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-text-primary">Create Group</h2>
          <button onClick={onClose} className="btn btn-ghost p-1.5"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label">Group Name *</label>
            <input className="input" required value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} placeholder="React Kashmir" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={2} value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="What is this group about?" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Tags (comma separated)</label>
            <input className="input" value={form.tags}
              onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="react, frontend, web" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary flex-1">
              {submitting ? 'Creating…' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Groups() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const params = {}
  if (search) params.search = search
  if (category) params.category = category

  const { data, loading, refetch } = useApi('/groups', { params })
  const groups = data?.data || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-display text-text-primary">Groups</h1>
          <p className="text-sm text-text-secondary mt-0.5">Join communities built around your interests</p>
        </div>
        {user && (
          <button onClick={() => setShowCreate(true)} className="btn btn-primary gap-2">
            <Plus size={15} /> Create Group
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" placeholder="Search groups…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="input pl-9 w-full" />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)} className="input sm:w-48">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="card h-36 skeleton" />)}
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-20">
          <Hash size={32} className="text-text-faint mx-auto mb-3" />
          <p className="text-text-muted text-sm">No groups found.</p>
          {user && <button onClick={() => setShowCreate(true)} className="btn btn-primary btn-sm mt-4">Create the first one</button>}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map(g => <GroupCard key={g._id} group={g} />)}
        </div>
      )}

      {showCreate && (
        <CreateGroupModal
          onClose={() => setShowCreate(false)}
          onSuccess={(group) => { refetch(); navigate(`/groups/${group.slug}`) }}
        />
      )}
    </div>
  )
}