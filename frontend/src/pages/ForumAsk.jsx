import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { X, HelpCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'

const SUGGESTED_TAGS = [
  'react', 'nodejs', 'javascript', 'python', 'career', 'ai',
  'devops', 'mongodb', 'flutter', 'cyber-security', 'open-source',
]

export default function ForumAsk() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]       = useState({ title: '', body: '', tags: [] })
  const [tagInput, setTagInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!user) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-text-muted mb-4">You must be logged in to ask a question.</p>
      <Link to="/login" className="btn btn-primary">Login</Link>
    </div>
  )

  const addTag = (tag) => {
    const t = tag.toLowerCase().trim().replace(/\s+/g, '-')
    if (!t || form.tags.includes(t) || form.tags.length >= 5) return
    setForm(f => ({ ...f, tags: [...f.tags, t] }))
    setTagInput('')
  }

  const removeTag = (tag) => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.body.trim()) {
      toast.error('Title and body are required')
      return
    }
    setSubmitting(true)
    try {
      const { data } = await api.post('/forum', form)
      toast.success('Question posted!')
      navigate(`/forum/question/${data.data._id}`)
    } catch (err) {
      toast.error(err.message || 'Failed to post')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <Link to="/forum" className="text-sm text-text-muted hover:text-text-primary transition-colors">← Forum</Link>
        <h1 className="text-2xl font-bold font-display text-text-primary mt-3">Ask a Question</h1>
        <p className="text-sm text-text-secondary mt-1">Be specific and clear. Good questions get great answers.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="card p-5">
          <label className="label text-sm font-semibold text-text-primary mb-2 block">
            Question Title *
          </label>
          <input
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. How do I implement JWT refresh tokens in Node.js?"
            className="input"
            maxLength={250}
          />
          <p className="text-xs text-text-faint mt-1.5">{form.title.length}/250</p>
        </div>

        {/* Body */}
        <div className="card p-5">
          <label className="label text-sm font-semibold text-text-primary mb-2 block">
            Details *
          </label>
          <p className="text-xs text-text-muted mb-3">
            Explain your question. Include what you tried, any error messages, and relevant code.
          </p>
          <textarea
            value={form.body}
            onChange={e => setForm({ ...form, body: e.target.value })}
            placeholder="Describe your question in detail..."
            className="input resize-none font-mono text-sm"
            rows={12}
            maxLength={10000}
          />
          <p className="text-xs text-text-faint mt-1.5">{form.body.length}/10000</p>
        </div>

        {/* Tags */}
        <div className="card p-5">
          <label className="label text-sm font-semibold text-text-primary mb-2 block">
            Tags (up to 5)
          </label>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {form.tags.map(t => (
              <span key={t}
                className="inline-flex items-center gap-1 bg-accent-subtle border border-accent-muted text-accent-text text-xs px-2.5 py-1 rounded-full">
                {t}
                <button type="button" onClick={() => removeTag(t)}
                  className="hover:text-red transition-colors"><X size={11} /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2 mb-3">
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput) } }}
              placeholder="Add a tag and press Enter"
              className="input flex-1"
              disabled={form.tags.length >= 5}
            />
            <button type="button" onClick={() => addTag(tagInput)}
              className="btn btn-secondary btn-sm" disabled={form.tags.length >= 5}>
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs text-text-faint mr-1">Suggested:</span>
            {SUGGESTED_TAGS.filter(t => !form.tags.includes(t)).slice(0, 8).map(t => (
              <button key={t} type="button" onClick={() => addTag(t)}
                className="tag text-[11px] hover:border-surface-border-2 cursor-pointer">
                + {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Link to="/forum" className="btn btn-secondary flex-1 justify-center">Cancel</Link>
          <button type="submit" disabled={submitting} className="btn btn-primary flex-1">
            {submitting ? 'Posting…' : 'Post Question'}
          </button>
        </div>
      </form>
    </div>
  )
}