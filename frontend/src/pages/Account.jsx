import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  User, Code2, Briefcase, MessageSquare, Bookmark,
  Bell, Activity, Trash2, Settings, ChevronRight,
  Eye, Heart, Send, CheckCircle, XCircle, Clock,
  BookmarkCheck, Edit3, LogOut
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import Avatar from '../components/ui/Avatar'
import { SKILLS, EXPERIENCE_LEVELS, timeAgo } from '../utils/helpers'
import toast from 'react-hot-toast'

// ─── Tab components ────────────────────────────────────────────────────────────

function ProfileTab({ user, profile, onSaved }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    location: user?.location || '',
    skills: profile?.skills || [],
    company: profile?.company || '',
    jobTitle: profile?.jobTitle || '',
    experience: profile?.experience || '0-1 years',
    github: profile?.github || '',
    linkedin: profile?.linkedin || '',
    portfolio: profile?.portfolio || '',
    twitter: profile?.twitter || '',
    openToWork: profile?.openToWork || false,
    openToFreelance: profile?.openToFreelance || false,
    achievements: profile?.achievements?.join('\n') || '',
  })
  const [saving, setSaving] = useState(false)

  const toggleSkill = (s) => setForm(f => ({
    ...f, skills: f.skills.includes(s) ? f.skills.filter(x => x !== s) : [...f.skills, s]
  }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/developers/profile', {
        ...form,
        achievements: form.achievements.split('\n').map(a => a.trim()).filter(Boolean),
      })
      toast.success('Profile updated!')
      onSaved?.()
    } catch (err) { toast.error(err.message || 'Failed') }
    finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Basic */}
      <div className="card p-5 space-y-4">
        <h3 className="font-semibold text-text-primary text-sm">Basic Information</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="label">Full Name</label>
            <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="label">Location</label>
            <input className="input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Srinagar, Kashmir" /></div>
        </div>
        <div><label className="label">Bio</label>
          <textarea className="input resize-none" rows={3} value={form.bio}
            onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Tell the community about yourself…" maxLength={300} />
          <p className="text-xs text-text-faint mt-1">{form.bio.length}/300</p>
        </div>
        <div><label className="label">Avatar URL</label>
          <div className="flex gap-3 items-center">
            <Avatar name={user?.name} src={form.avatar} size="lg" />
            <input className="input flex-1" value={form.avatar}
              onChange={e => setForm({ ...form, avatar: e.target.value })} placeholder="https://…" />
          </div>
        </div>
      </div>

      {/* Professional */}
      <div className="card p-5 space-y-4">
        <h3 className="font-semibold text-text-primary text-sm">Professional Info</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="label">Company</label>
            <input className="input" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} /></div>
          <div><label className="label">Job Title</label>
            <input className="input" value={form.jobTitle} onChange={e => setForm({ ...form, jobTitle: e.target.value })} /></div>
        </div>
        <div><label className="label">Experience</label>
          <select className="input" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })}>
            {EXPERIENCE_LEVELS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.openToWork}
              onChange={e => setForm({ ...form, openToWork: e.target.checked })}
              className="w-4 h-4 accent-accent" />
            <span className="text-sm text-text-secondary">Open to Work</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.openToFreelance}
              onChange={e => setForm({ ...form, openToFreelance: e.target.checked })}
              className="w-4 h-4 accent-accent" />
            <span className="text-sm text-text-secondary">Open to Freelance</span>
          </label>
        </div>
      </div>

      {/* Skills */}
      <div className="card p-5 space-y-3">
        <h3 className="font-semibold text-text-primary text-sm">Skills ({form.skills.length} selected)</h3>
        <div className="flex flex-wrap gap-1.5">
          {SKILLS.map(s => (
            <button key={s} type="button" onClick={() => toggleSkill(s)}
              className={`tag cursor-pointer transition-all ${form.skills.includes(s) ? 'bg-accent-subtle border-accent-muted text-accent-text' : 'hover:border-surface-5'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Social Links */}
      <div className="card p-5 space-y-4">
        <h3 className="font-semibold text-text-primary text-sm">Social Links</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[['GitHub', 'github'], ['LinkedIn', 'linkedin'], ['Portfolio', 'portfolio'], ['Twitter', 'twitter']].map(([label, key]) => (
            <div key={key}><label className="label">{label}</label>
              <input className="input" value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder="https://…" /></div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="card p-5">
        <h3 className="font-semibold text-text-primary text-sm mb-3">Achievements (one per line)</h3>
        <textarea className="input resize-none" rows={4} value={form.achievements}
          onChange={e => setForm({ ...form, achievements: e.target.value })}
          placeholder={"Winner — TechFest 2024\nContributed to OpenAI projects\n1000+ GitHub stars"} />
      </div>

      <button type="submit" disabled={saving} className="btn btn-primary w-full">
        {saving ? 'Saving…' : 'Save Profile'}
      </button>
    </form>
  )
}

function ApplicationsTab({ mine = true }) {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)

  const stageConfig = {
    applied:      { label: 'Applied',       icon: Send,        color: 'text-text-muted' },
    under_review: { label: 'Under Review',  icon: Clock,       color: 'text-amber' },
    interview:    { label: 'Interview',     icon: MessageSquare, color: 'text-accent' },
    selected:     { label: 'Selected',      icon: CheckCircle,   color: 'text-green' },
    rejected:     { label: 'Rejected',      icon: XCircle,      color: 'text-red-text' },
  }

  useEffect(() => {
    api.get(mine ? '/applications/mine' : '/applications').then(r => {
      setApps(r.data.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [mine])

  if (loading) return <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card h-20 skeleton" />)}</div>

  if (apps.length === 0) return (
    <div className="text-center py-16">
      <Briefcase size={28} className="text-text-faint mx-auto mb-3" />
      <p className="text-text-muted text-sm">No applications yet.</p>
      <Link to="/opportunities" className="btn btn-primary btn-sm mt-4">Browse Opportunities</Link>
    </div>
  )

  return (
    <div className="space-y-3">
      {apps.map(app => {
        const cfg = stageConfig[app.stage] || stageConfig.applied
        const Icon = cfg.icon
        return (
          <div key={app._id} className="card p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-text-primary">{app.opportunity?.title || 'Opportunity'}</p>
              <p className="text-xs text-text-muted">{app.opportunity?.company} · {timeAgo(app.createdAt)}</p>
            </div>
            <div className={`flex items-center gap-1.5 text-xs font-medium ${cfg.color}`}>
              <Icon size={13} /> {cfg.label}
            </div>
            {app.isShortlisted && (
              <span className="badge badge-green text-xs">Shortlisted</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function BookmarksTab() {
  const [type, setType] = useState('developer')
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get('/bookmarks', { params: { type } }).then(r => {
      setBookmarks(r.data.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [type])

  const removeBookmark = async (id) => {
    try {
      await api.post('/bookmarks', { targetType: type, targetId: id })
      setBookmarks(prev => prev.filter(b => b._id !== id))
      toast.success('Bookmark removed')
    } catch {}
  }

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {['developer', 'project', 'question', 'opportunity'].map(t => (
          <button key={t} onClick={() => setType(t)}
            className={`btn btn-sm capitalize ${type === t ? 'btn-primary' : 'btn-secondary'}`}>{t}s</button>
        ))}
      </div>
      {loading ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card h-16 skeleton" />)}</div>
        : bookmarks.length === 0 ? (
          <div className="text-center py-12">
            <BookmarkCheck size={28} className="text-text-faint mx-auto mb-2" />
            <p className="text-text-muted text-sm">No saved {type}s yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {bookmarks.map(b => (
              <div key={b._id} className="card p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {b.target?.name || b.target?.title || b.target?.username || '—'}
                  </p>
                  <p className="text-xs text-text-muted">{timeAgo(b.createdAt)}</p>
                </div>
                <button onClick={() => removeBookmark(b.target?._id)}
                  className="btn btn-ghost p-1.5 text-text-faint hover:text-red-text">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
    </div>
  )
}

function ActivityTab() {
  const { data, loading } = useApiLocal('/users/activity')
  const stats = data?.data?.summary || {}
  const activity = data?.data?.activity || []

  const labels = {
    view_profile: 'Viewed a profile',
    view_project: 'Viewed a project',
    like_project: 'Liked a project',
    save_opportunity: 'Saved an opportunity',
    ask_question: 'Asked a question',
    answer_question: 'Answered a question',
    upvote: 'Voted on forum content',
    search: 'Searched KashDev',
    follow: 'Followed a developer',
    bookmark: 'Saved a bookmark',
  }

  if (loading) return <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card h-20 skeleton" />)}</div>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Projects', value: stats.myProjects ?? 0, icon: Code2, color: 'text-accent' },
          { label: 'Likes Received', value: stats.likesReceived ?? 0, icon: Heart, color: 'text-red-text' },
          { label: 'Followers', value: stats.followers ?? 0, icon: User, color: 'text-amber' },
          { label: 'Applications', value: stats.applications ?? 0, icon: Briefcase, color: 'text-green' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5 text-center">
            <Icon size={20} className={`${color} mx-auto mb-2`} />
            <p className="text-2xl font-bold font-display tabular text-text-primary">{value}</p>
            <p className="text-xs text-text-muted mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-text-primary text-sm mb-4">Recent Activity</h3>
        {activity.length === 0 ? (
          <p className="text-sm text-text-muted py-6 text-center">No activity yet.</p>
        ) : (
          <div className="space-y-3">
            {activity.map(item => (
              <div key={item._id} className="flex items-center gap-3 border-b border-surface-border last:border-0 pb-3 last:pb-0">
                <span className="w-8 h-8 rounded-lg bg-accent-subtle text-accent-text inline-flex items-center justify-center flex-shrink-0">
                  <Activity size={14} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary">{labels[item.type] || item.type}</p>
                  <p className="text-xs text-text-muted truncate">
                    {item.metadata?.title || item.metadata?.questionTitle || item.targetType || 'KashDev'}
                  </p>
                </div>
                <span className="text-xs text-text-faint flex-shrink-0">{timeAgo(item.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Avoid circular dep — inline useApi here
function useApiLocal(url) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api.get(url).then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [url])
  return { data, loading }
}

// ─── Main Account Page ────────────────────────────────────────────────────────
const TABS = [
  { key: 'profile',      label: 'Profile',      icon: User },
  { key: 'applications', label: 'Applications',  icon: Briefcase },
  { key: 'bookmarks',    label: 'Bookmarks',     icon: Bookmark },
  { key: 'activity',     label: 'Activity',      icon: Activity },
]

export default function Account() {
  const { user, profile, loading, logout, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('profile')

  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [user, loading])

  if (loading || !user) return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-4">
      <div className="skeleton h-24 rounded-xl" />
      <div className="skeleton h-64 rounded-xl" />
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="card p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <Avatar name={user.name} src={user.avatar} size="xl" />
        <div className="flex-1">
          <h1 className="font-display font-bold text-xl text-text-primary">{user.name}</h1>
          <p className="text-sm text-text-muted">@{user.username} · {user.email}</p>
          {user.bio && <p className="text-sm text-text-secondary mt-1">{user.bio}</p>}
        </div>
        <div className="flex gap-2">
          <Link to={`/developers/${user.username}`} className="btn btn-secondary btn-sm gap-1.5">
            <Eye size={13} /> View Profile
          </Link>
          <button onClick={() => { logout(); navigate('/') }} className="btn btn-ghost btn-sm gap-1.5 text-text-muted">
            <LogOut size={13} /> Logout
          </button>
        </div>
      </div>

      <div className="flex gap-6 flex-col sm:flex-row">
        {/* Sidebar nav */}
        <div className="sm:w-48 flex-shrink-0">
          <nav className="card p-2 flex sm:flex-col gap-1">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all w-full text-left ${
                  tab === key
                    ? 'bg-accent-subtle text-accent-text font-medium'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                }`}>
                <Icon size={14} /> <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="flex-1 min-w-0">
          {tab === 'profile' && (
            <ProfileTab user={user} profile={profile} onSaved={refreshProfile} />
          )}
          {tab === 'applications' && <ApplicationsTab mine />}
          {tab === 'bookmarks' && <BookmarksTab />}
          {tab === 'activity' && <ActivityTab />}
        </div>
      </div>
    </div>
  )
}
