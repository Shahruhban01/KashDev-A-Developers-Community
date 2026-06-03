import { useState } from 'react'
import { Plus, Search, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import ProjectCard from '../components/ui/ProjectCard'
import { SkeletonGrid } from '../components/ui/Skeleton'
import api from '../services/api'
import toast from 'react-hot-toast'

function ProjectForm({ onClose, onSuccess }) {
  const [form, setForm] = useState({ title: '', description: '', githubUrl: '', demoUrl: '', technologies: '', status: 'active' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/projects', form)
      toast.success('Project added!')
      onSuccess?.()
      onClose()
    } catch (err) { toast.error(err.message || 'Failed to add project') }
    finally { setSubmitting(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="card w-full max-w-lg p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-text-primary">Add Project</h2>
          <button onClick={onClose} className="btn btn-ghost p-1.5"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div><label className="label">Title *</label>
            <input className="input" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="My awesome project" /></div>
          <div><label className="label">Description *</label>
            <textarea className="input resize-none" rows={3} required value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What does this project do?" /></div>
          <div><label className="label">Technologies * (comma separated)</label>
            <input className="input" required value={form.technologies} onChange={e => setForm({ ...form, technologies: e.target.value })} placeholder="React, Node.js, MongoDB" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">GitHub URL</label>
              <input type="url" className="input" value={form.githubUrl} onChange={e => setForm({ ...form, githubUrl: e.target.value })} placeholder="https://github.com/..." /></div>
            <div><label className="label">Demo URL</label>
              <input type="url" className="input" value={form.demoUrl} onChange={e => setForm({ ...form, demoUrl: e.target.value })} placeholder="https://..." /></div>
          </div>
          <div><label className="label">Status</label>
            <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="wip">Work in Progress</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary flex-1">{submitting ? 'Adding…' : 'Add Project'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Projects() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const params = {}
  if (search) params.search = search
  if (refreshKey) params.refreshKey = refreshKey

  const { data, loading } = useApi('/projects', { params })
  const projects = data?.data || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-display text-text-primary">Projects</h1>
          <p className="text-sm text-text-secondary mt-0.5">{data?.pagination?.total || 0} projects from the community</p>
        </div>
        {user && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary gap-2">
            <Plus size={15} /> Add Project
          </button>
        )}
      </div>

      <div className="mb-6 relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input type="text" placeholder="Search projects..." value={search}
          onChange={e => setSearch(e.target.value)} className="input pl-9 max-w-sm" />
      </div>

      {loading ? (
        <SkeletonGrid count={9} />
      ) : projects.length === 0 ? (
        <div className="text-center py-20 card">
          <p className="font-medium text-text-primary text-sm mb-1">No projects found</p>
          <p className="text-text-muted text-xs mb-5">
            Try searching by technology, description, or project name.
          </p>
          <div className="flex flex-wrap justify-center gap-2 max-w-sm mx-auto">
            {['React', 'Flutter', 'Node.js', 'Python', 'MongoDB'].map(t => (
              <button
                key={t}
                onClick={() => setSearch(t)}
                className="tag cursor-pointer hover:border-accent hover:text-accent transition-all"
              >
                {t}
              </button>
            ))}
          </div>
          {search && (
            <button onClick={() => setSearch('')} className="btn btn-ghost btn-sm mt-5">
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => <ProjectCard key={p._id} project={p} />)}
        </div>
      )}

      {showForm && <ProjectForm onClose={() => setShowForm(false)} onSuccess={() => setRefreshKey(k => k + 1)} />}
    </div>
  )
}