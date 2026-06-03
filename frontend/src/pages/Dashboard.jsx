import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Save, Plus, Trash2, Eye, Code2, Briefcase, User, Settings } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import Avatar from '../components/ui/Avatar'
import toast from 'react-hot-toast'
import { SKILLS, EXPERIENCE_LEVELS } from '../utils/helpers'

const TABS = [
  { id: 'profile',       label: 'Profile',       Icon: User      },
  { id: 'projects',      label: 'Projects',      Icon: Code2     },
  { id: 'opportunities', label: 'Opportunities', Icon: Briefcase },
  { id: 'settings',      label: 'Settings',      Icon: Settings  },
]

// Safely convert location (object or string) → display string
const resolveLocation = (location) => {
  if (!location) return 'Kashmir, India'
  if (typeof location === 'string') return location
  if (typeof location === 'object') {
    return [location.city, location.district, location.state, location.country]
      .filter(Boolean)
      .join(', ') || 'Kashmir, India'
  }
  return 'Kashmir, India'
}

export default function Dashboard() {
  const { user, profile, loading, logout, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('profile')

  // Single unified form state — location is always a plain string here
  const [form, setForm] = useState({
    name:          '',
    bio:           '',
    avatar:        '',
    location:      'Kashmir, India',   // always string in form state
    skills:        [],
    company:       '',
    jobTitle:      '',
    experience:    '0-1 years',
    github:        '',
    linkedin:      '',
    portfolio:     '',
    twitter:       '',
    openToWork:    false,
    openToFreelance: false,
    achievements:  [],
  })

  const [newAchievement, setNewAchievement] = useState('')
  const [saving, setSaving]       = useState(false)
  const [myProjects, setMyProjects]           = useState([])
  const [myOpportunities, setMyOpportunities] = useState([])

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [loading, user, navigate])

  // Populate form from auth context once loaded
  useEffect(() => {
    if (user && profile) {
      setForm({
        name:           user.name          || '',
        bio:            user.bio           || '',
        avatar:         user.avatar        || '',
        // Resolve location safely — could be object or string from API
        location:       user.locationString
                          ? user.locationString
                          : resolveLocation(user.location),
        skills:         profile.skills         || [],
        company:        profile.company        || '',
        jobTitle:       profile.jobTitle       || '',
        experience:     profile.experience     || '0-1 years',
        github:         profile.github         || '',
        linkedin:       profile.linkedin       || '',
        portfolio:      profile.portfolio      || '',
        twitter:        profile.twitter        || '',
        openToWork:     profile.openToWork     || false,
        openToFreelance:profile.openToFreelance|| false,
        achievements:   profile.achievements   || [],
      })
    }
  }, [user, profile])

  // Lazy-load tab data
  useEffect(() => {
    if (tab === 'projects' && user) {
      api.get('/projects', { params: { limit: 50 } })
        .then(r => {
          const mine = r.data.data.filter(
            p => p.owner?._id === user._id || p.owner === user._id
          )
          setMyProjects(mine)
        })
        .catch(() => {})
    }
    if (tab === 'opportunities' && user) {
      api.get('/opportunities', { params: { limit: 50 } })
        .then(r => {
          const mine = r.data.data.filter(
            o => o.postedBy?._id === user._id || o.postedBy === user._id
          )
          setMyOpportunities(mine)
        })
        .catch(() => {})
    }
  }, [tab, user])

  // Helpers
  const set = (field) => (e) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const setCheck = (field) => (e) =>
    setForm(f => ({ ...f, [field]: e.target.checked }))

  const toggleSkill = (skill) =>
    setForm(f => ({
      ...f,
      skills: f.skills.includes(skill)
        ? f.skills.filter(s => s !== skill)
        : [...f.skills, skill],
    }))

  const addAchievement = () => {
    if (!newAchievement.trim()) return
    setForm(f => ({ ...f, achievements: [...f.achievements, newAchievement.trim()] }))
    setNewAchievement('')
  }

  const removeAchievement = (i) =>
    setForm(f => ({ ...f, achievements: f.achievements.filter((_, j) => j !== i) }))

  // Save — send `location` as a string, backend stores in locationString
  const saveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/developers/profile', {
        // Basic user fields
        name:           form.name,
        bio:            form.bio,
        avatar:         form.avatar,
        locationString: form.location,   // ← key the controller expects (string)
        // Developer profile fields
        skills:         form.skills,
        company:        form.company,
        jobTitle:       form.jobTitle,
        experience:     form.experience,
        github:         form.github,
        linkedin:       form.linkedin,
        portfolio:      form.portfolio,
        twitter:        form.twitter,
        openToWork:     form.openToWork,
        openToFreelance:form.openToFreelance,
        achievements:   form.achievements,
      })
      await refreshProfile()
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const deleteProject = async (id) => {
    try {
      await api.delete(`/projects/${id}`)
      setMyProjects(p => p.filter(x => x._id !== id))
      toast.success('Project deleted')
    } catch {
      toast.error('Failed to delete project')
    }
  }

  const deleteOpportunity = async (id) => {
    try {
      await api.delete(`/opportunities/${id}`)
      setMyOpportunities(o => o.filter(x => x._id !== id))
      toast.success('Opportunity removed')
    } catch {
      toast.error('Failed to remove opportunity')
    }
  }

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-20 text-center">
      <p className="text-text-muted text-sm">Loading…</p>
    </div>
  )
  if (!user) return null

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

      {/* Header card */}
      <div className="card p-5 mb-6 flex items-center gap-4">
        <Avatar name={user.name} src={user.avatar} size="lg" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-text-primary font-display">{user.name}</p>
          <p className="text-sm text-text-muted">@{user.username}</p>
          {(user.locationString || user.location) && (
            <p className="text-xs text-text-faint mt-0.5">
              {user.locationString || resolveLocation(user.location)}
            </p>
          )}
        </div>
        <Link
          to={`/developers/${user.username}`}
          className="btn btn-secondary btn-sm gap-1.5"
        >
          <Eye size={12} /> View Profile
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-surface-border">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
              tab === id
                ? 'border-accent text-text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* ── PROFILE TAB ───────────────────────────────────────── */}
      {tab === 'profile' && (
        <form onSubmit={saveProfile} className="space-y-6 animate-fade-in">

          {/* Basic Info */}
          <div className="card p-6 space-y-4">
            <h3 className="font-semibold text-text-primary text-sm">Basic Info</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="label">Location</label>
                <input
                  type="text"
                  className="input"
                  value={form.location}
                  onChange={set('location')}       // updates form.location (string)
                  placeholder="e.g. Sopore, Jammu & Kashmir"
                />
              </div>
            </div>
            <div>
              <label className="label">Bio</label>
              <textarea
                className="input resize-none"
                rows={3}
                maxLength={300}
                value={form.bio}
                onChange={set('bio')}
                placeholder="Tell the community about yourself…"
              />
              <p className="text-xs text-text-faint mt-1 text-right">
                {form.bio.length}/300
              </p>
            </div>
            <div>
              <label className="label">Avatar URL</label>
              <input
                type="url"
                className="input"
                value={form.avatar}
                onChange={set('avatar')}
                placeholder="https://…"
              />
              {form.avatar && (
                <img
                  src={form.avatar}
                  alt="Avatar preview"
                  className="mt-2 w-12 h-12 rounded-full object-cover border border-surface-border"
                  onError={e => { e.target.style.display = 'none' }}
                />
              )}
            </div>
          </div>

          {/* Work & Experience */}
          <div className="card p-6 space-y-4">
            <h3 className="font-semibold text-text-primary text-sm">Work & Experience</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Company</label>
                <input
                  className="input"
                  value={form.company}
                  onChange={set('company')}
                  placeholder="Where do you work?"
                />
              </div>
              <div>
                <label className="label">Job Title</label>
                <input
                  className="input"
                  value={form.jobTitle}
                  onChange={set('jobTitle')}
                  placeholder="Software Engineer"
                />
              </div>
            </div>
            <div>
              <label className="label">Experience Level</label>
              <select
                className="input"
                value={form.experience}
                onChange={set('experience')}
              >
                {EXPERIENCE_LEVELS.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.openToWork}
                  onChange={setCheck('openToWork')}
                  className="w-4 h-4 accent-accent rounded"
                />
                Open to Work
              </label>
              <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.openToFreelance}
                  onChange={setCheck('openToFreelance')}
                  className="w-4 h-4 accent-accent rounded"
                />
                Open to Freelance
              </label>
            </div>
          </div>

          {/* Links */}
          <div className="card p-6 space-y-4">
            <h3 className="font-semibold text-text-primary text-sm">Links</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: 'GitHub URL',    field: 'github',    placeholder: 'https://github.com/…' },
                { label: 'LinkedIn URL',  field: 'linkedin',  placeholder: 'https://linkedin.com/in/…' },
                { label: 'Portfolio URL', field: 'portfolio', placeholder: 'https://…' },
                { label: 'Twitter URL',   field: 'twitter',   placeholder: 'https://twitter.com/…' },
              ].map(({ label, field, placeholder }) => (
                <div key={field}>
                  <label className="label">{label}</label>
                  <input
                    type="url"
                    className="input"
                    value={form[field]}
                    onChange={set(field)}
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-text-primary text-sm">Skills</h3>
              <span className="text-xs text-text-muted">{form.skills.length} selected</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map(s => (
                <button
                  type="button"
                  key={s}
                  onClick={() => toggleSkill(s)}
                  className={`tag cursor-pointer select-none transition-all ${
                    form.skills.includes(s)
                      ? 'bg-accent-subtle border-accent-muted text-accent-text'
                      : 'hover:border-surface-5 hover:text-text-primary'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="card p-6 space-y-4">
            <h3 className="font-semibold text-text-primary text-sm">Achievements</h3>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                value={newAchievement}
                onChange={e => setNewAchievement(e.target.value)}
                placeholder="e.g. Built a SaaS used by 10k+ users"
                onKeyDown={e => {
                  if (e.key === 'Enter') { e.preventDefault(); addAchievement() }
                }}
              />
              <button
                type="button"
                onClick={addAchievement}
                className="btn btn-secondary btn-sm px-3"
              >
                <Plus size={14} />
              </button>
            </div>
            {form.achievements.length > 0 && (
              <ul className="space-y-2">
                {form.achievements.map((a, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-3 text-sm text-text-secondary bg-surface-2 px-3 py-2 rounded-lg"
                  >
                    <span className="flex-1">{a}</span>
                    <button
                      type="button"
                      onClick={() => removeAchievement(i)}
                      className="text-text-muted hover:text-red-text transition-colors flex-shrink-0"
                    >
                      <Trash2 size={12} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary gap-2"
          >
            <Save size={14} />
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
      )}

      {/* ── PROJECTS TAB ──────────────────────────────────────── */}
      {tab === 'projects' && (
        <div className="animate-fade-in space-y-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-secondary">{myProjects.length} project{myProjects.length !== 1 ? 's' : ''}</p>
            <Link to="/projects" className="btn btn-secondary btn-sm gap-1.5">
              <Plus size={12} /> Add Project
            </Link>
          </div>
          {myProjects.length === 0 ? (
            <div className="text-center py-16 card">
              <Code2 size={28} className="text-text-faint mx-auto mb-3" />
              <p className="text-text-muted text-sm mb-3">You haven't added any projects yet.</p>
              <Link to="/projects" className="btn btn-primary btn-sm gap-1.5">
                <Plus size={12} /> Add your first project
              </Link>
            </div>
          ) : (
            myProjects.map(p => (
              <div key={p._id} className="card p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-text-primary truncate">{p.title}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.technologies?.slice(0, 4).map(t => (
                      <span key={t} className="tag text-[10px] py-0">{t}</span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => deleteProject(p._id)}
                  className="btn btn-danger btn-sm p-2 flex-shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── OPPORTUNITIES TAB ─────────────────────────────────── */}
      {tab === 'opportunities' && (
        <div className="animate-fade-in space-y-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-secondary">{myOpportunities.length} posted</p>
            <Link to="/opportunities" className="btn btn-secondary btn-sm gap-1.5">
              <Plus size={12} /> Post Opportunity
            </Link>
          </div>
          {myOpportunities.length === 0 ? (
            <div className="text-center py-16 card">
              <Briefcase size={28} className="text-text-faint mx-auto mb-3" />
              <p className="text-text-muted text-sm mb-3">You haven't posted any opportunities yet.</p>
              <Link to="/opportunities" className="btn btn-primary btn-sm gap-1.5">
                <Plus size={12} /> Post an opportunity
              </Link>
            </div>
          ) : (
            myOpportunities.map(o => (
              <div key={o._id} className="card p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-text-primary truncate">{o.title}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {[o.company, o.type].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <button
                  onClick={() => deleteOpportunity(o._id)}
                  className="btn btn-danger btn-sm p-2 flex-shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── SETTINGS TAB ──────────────────────────────────────── */}
      {tab === 'settings' && (
        <div className="animate-fade-in space-y-4">
          <div className="card p-6">
            <h3 className="font-semibold text-text-primary text-sm mb-1">Account</h3>
            <p className="text-xs text-text-muted mb-4">Your account details.</p>
            <div className="space-y-0 text-sm text-text-secondary divide-y divide-surface-border">
              {[
                { label: 'Email',        value: user.email },
                { label: 'Username',     value: `@${user.username}`, mono: true },
                { label: 'Member since', value: new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }) },
                { label: 'Reputation',   value: `${user.reputation || 0} pts` },
              ].map(({ label, value, mono }) => (
                <div key={label} className="flex items-center justify-between py-2.5">
                  <span className="text-text-secondary">{label}</span>
                  <span className={`text-text-muted ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6 border-red/20">
            <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--color-red, #ef4444)' }}>
              Danger Zone
            </h3>
            <p className="text-xs text-text-muted mb-4">
              Signing out will clear your session.
            </p>
            <button
              onClick={() => { logout(); navigate('/') }}
              className="btn btn-danger btn-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

    </div>
  )
}