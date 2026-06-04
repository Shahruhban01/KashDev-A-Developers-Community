import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search, Filter, Download, RefreshCw, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, Eye, EyeOff, Trash2, CheckCheck,
  X, Mail, Phone, Github, Linkedin, Globe, MapPin, Briefcase,
  Code2, MessageSquare, Clock, Tag, SlidersHorizontal, Plus,
  BarChart2, ArrowLeft, Loader2, Check, AlertTriangle, Edit3,
  Users, TrendingUp, Calendar, UserCheck,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import {
  getWaitlist, getWaitlistStats, getWaitlistMember,
  updateWaitlistMember, addNote, deleteWaitlistMember,
  bulkAction, downloadCsv,
} from '../../services/waitlistService'
import toast from 'react-hot-toast'

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLES = ['Student', 'Developer', 'Freelancer', 'Founder', 'Designer', 'Recruiter', 'Tech Enthusiast', 'Other']
const STATUSES = ['new', 'reviewed', 'approved', 'rejected', 'contacted']
const STATUS_COLORS = {
  new:       'badge-accent',
  reviewed:  'bg-amber/10 border-amber/20 text-amber',
  approved:  'badge-green',
  rejected:  'bg-red/10 border-red/20 text-red-text',
  contacted: 'bg-surface-4 border-surface-border-2 text-text-muted',
}

const ALL_COLS = ['full_name','email','phone','location','role','github_url','linkedin_url','portfolio_url','company_or_college','skills','status','contacted','createdAt']
const COL_LABELS = {
  full_name:'Name', email:'Email', phone:'Phone', location:'Location',
  role:'Role', github_url:'GitHub', linkedin_url:'LinkedIn', portfolio_url:'Portfolio',
  company_or_college:'Company/College', skills:'Skills', status:'Status',
  contacted:'Contacted', createdAt:'Joined',
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function AdminStatCard({ label, value, icon: Icon, color = 'text-accent', sub }) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-lg bg-accent-subtle border border-accent-muted flex items-center justify-center flex-shrink-0">
        <Icon size={18} className={color} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold font-display tabular text-text-primary">
          {value ?? '—'}
        </p>
        <p className="text-xs text-text-muted mt-0.5">{label}</p>
        {sub && <p className="text-xs text-text-faint mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Profile Drawer ───────────────────────────────────────────────────────────

function ProfileDrawer({ memberId, onClose, onUpdate }) {
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(true)
  const [noteText, setNoteText] = useState('')
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState({})

  const load = useCallback(() => {
    if (!memberId) return
    setLoading(true)
    getWaitlistMember(memberId)
      .then(res => {
        setMember(res.data.data)
        setEditData(res.data.data)
      })
      .catch(() => toast.error('Failed to load member'))
      .finally(() => setLoading(false))
  }, [memberId])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateWaitlistMember(memberId, editData)
      toast.success('Member updated')
      setEditMode(false)
      load()
      onUpdate()
    } catch {
      toast.error('Update failed')
    } finally {
      setSaving(false)
    }
  }

  const handleAddNote = async () => {
    if (!noteText.trim()) return
    setSaving(true)
    try {
      await addNote(memberId, noteText.trim())
      setNoteText('')
      load()
      toast.success('Note added')
    } catch {
      toast.error('Failed to add note')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleContacted = async () => {
    setSaving(true)
    try {
      await updateWaitlistMember(memberId, { contacted: !member.contacted })
      load()
      onUpdate()
      toast.success(member.contacted ? 'Marked as not contacted' : 'Marked as contacted')
    } catch {
      toast.error('Update failed')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (status) => {
    setSaving(true)
    try {
      await updateWaitlistMember(memberId, { status })
      load()
      onUpdate()
      toast.success(`Status → ${status}`)
    } catch {
      toast.error('Update failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this member? This cannot be undone.')) return
    try {
      await deleteWaitlistMember(memberId)
      toast.success('Member deleted')
      onClose()
      onUpdate()
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-surface-1 border-l border-surface-border
                      z-50 flex flex-col shadow-lg animate-slide-in-right overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border flex-shrink-0">
          <h2 className="font-semibold text-text-primary">Member Profile</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-3 text-text-muted hover:text-text-primary transition-all">
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 size={24} className="text-accent animate-spin" />
          </div>
        ) : !member ? (
          <div className="flex-1 flex items-center justify-center text-text-muted text-sm">Member not found</div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Identity */}
            <div className="px-5 py-5 border-b border-surface-border">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="w-12 h-12 rounded-full bg-accent/20 border border-accent/30
                                  flex items-center justify-center text-lg font-bold text-accent mb-3">
                    {member.full_name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="font-semibold text-text-primary text-base">{member.full_name}</h3>
                  <p className="text-xs text-text-secondary">{member.email}</p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className={`btn btn-sm ${editMode ? 'btn-primary' : 'btn-secondary'} gap-1`}
                  >
                    <Edit3 size={12} /> {editMode ? 'Editing' : 'Edit'}
                  </button>
                  <button onClick={handleDelete} className="btn btn-sm bg-red/10 border-red/20 text-red-text hover:bg-red/20 gap-1">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Status + Contacted badges */}
              <div className="flex flex-wrap gap-2">
                <span className={`badge ${STATUS_COLORS[member.status]}`}>
                  <Tag size={10} /> {member.status}
                </span>
                <span className={`badge ${member.contacted ? 'badge-green' : 'badge-surface'}`}>
                  {member.contacted ? <Check size={10} /> : <Clock size={10} />}
                  {member.contacted ? 'Contacted' : 'Not contacted'}
                </span>
                <span className="badge badge-surface">
                  <MapPin size={10} /> {member.location}
                </span>
                <span className="badge badge-surface">
                  <Briefcase size={10} /> {member.role}
                </span>
              </div>
            </div>

            {/* Quick actions */}
            <div className="px-5 py-4 border-b border-surface-border">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Quick Actions</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleToggleContacted}
                  disabled={saving}
                  className={`btn btn-sm gap-1.5 ${member.contacted ? 'btn-secondary' : 'btn-primary'}`}
                >
                  <UserCheck size={12} />
                  {member.contacted ? 'Mark Not Contacted' : 'Mark Contacted'}
                </button>
                {STATUSES.filter(s => s !== member.status).slice(0, 3).map(s => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={saving}
                    className="btn btn-secondary btn-sm gap-1 capitalize"
                  >
                    → {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Detail fields */}
            <div className="px-5 py-4 border-b border-surface-border space-y-3">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Details</p>

              {editMode ? (
                <div className="space-y-3">
                  {[
                    { k: 'full_name',         label: 'Full Name' },
                    { k: 'email',             label: 'Email' },
                    { k: 'phone',             label: 'Phone' },
                    { k: 'location',          label: 'Location' },
                    { k: 'github_url',        label: 'GitHub' },
                    { k: 'linkedin_url',      label: 'LinkedIn' },
                    { k: 'portfolio_url',     label: 'Portfolio' },
                    { k: 'company_or_college',label: 'Company/College' },
                    { k: 'skills',            label: 'Skills' },
                  ].map(({ k, label }) => (
                    <div key={k}>
                      <label className="block text-xs text-text-muted mb-1">{label}</label>
                      <input
                        className="input"
                        value={editData[k] || ''}
                        onChange={e => setEditData(d => ({ ...d, [k]: e.target.value }))}
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs text-text-muted mb-1">Status</label>
                    <select
                      className="input"
                      value={editData.status}
                      onChange={e => setEditData(d => ({ ...d, status: e.target.value }))}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-md w-full gap-2">
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    Save Changes
                  </button>
                  <button onClick={() => { setEditMode(false); setEditData(member) }} className="btn btn-secondary btn-sm w-full">
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {[
                    { icon: Mail,     val: member.email,              label: 'Email',            link: `mailto:${member.email}` },
                    { icon: Phone,    val: member.phone,              label: 'Phone',            link: member.phone ? `tel:${member.phone}` : null },
                    { icon: Github,   val: member.github_url,         label: 'GitHub',           link: member.github_url },
                    { icon: Linkedin, val: member.linkedin_url,       label: 'LinkedIn',         link: member.linkedin_url },
                    { icon: Globe,    val: member.portfolio_url,      label: 'Portfolio',        link: member.portfolio_url },
                    { icon: Briefcase,val: member.company_or_college, label: 'Company/College',  link: null },
                    { icon: Code2,    val: member.skills,             label: 'Skills',           link: null },
                  ].filter(f => f.val).map(({ icon: Icon, val, label, link }) => (
                    <div key={label} className="flex items-start gap-2.5 group">
                      <Icon size={13} className="text-text-faint mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-text-faint">{label}</p>
                        {link ? (
                          <a href={link} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-accent hover:text-accent-hover break-all transition-colors">
                            {val}
                          </a>
                        ) : (
                          <p className="text-xs text-text-secondary break-words">{val}</p>
                        )}
                      </div>
                      {link && (
                        <button
                          onClick={() => { navigator.clipboard.writeText(val); toast.success('Copied!') }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded text-text-faint hover:text-text-primary hover:bg-surface-3 transition-all text-[10px]"
                          title="Copy"
                        >
                          ⎘
                        </button>
                      )}
                    </div>
                  ))}

                  {member.message && (
                    <div className="pt-2">
                      <p className="text-[10px] text-text-faint mb-1">Message</p>
                      <p className="text-xs text-text-secondary leading-relaxed bg-surface-3 rounded-lg p-3">
                        {member.message}
                      </p>
                    </div>
                  )}

                  <div className="pt-1">
                    <p className="text-[10px] text-text-faint">Joined</p>
                    <p className="text-xs text-text-secondary">
                      {new Date(member.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="px-5 py-4">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                Notes ({member.notes?.length || 0})
              </p>

              {member.notes?.length > 0 && (
                <div className="space-y-2 mb-3">
                  {[...member.notes].reverse().map(n => (
                    <div key={n._id} className="bg-surface-3 rounded-lg p-3">
                      <p className="text-xs text-text-secondary leading-relaxed">{n.text}</p>
                      <p className="text-[10px] text-text-faint mt-1">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Add a note..."
                  rows={2}
                  className="input resize-none flex-1 text-xs"
                />
                <button
                  onClick={handleAddNote}
                  disabled={!noteText.trim() || saving}
                  className="btn btn-primary btn-sm px-3"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// ─── Filters Panel ────────────────────────────────────────────────────────────

function FiltersPanel({ filters, onChange, onClear }) {
  return (
    <div className="card border border-surface-border-2 p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4 animate-fade-in">
      <div>
        <label className="block text-xs text-text-muted mb-1">Role</label>
        <select className="input" value={filters.role} onChange={e => onChange('role', e.target.value)}>
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs text-text-muted mb-1">Status</label>
        <select className="input" value={filters.status} onChange={e => onChange('status', e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs text-text-muted mb-1">Contacted</label>
        <select className="input" value={filters.contacted} onChange={e => onChange('contacted', e.target.value)}>
          <option value="">Any</option>
          <option value="true">Contacted</option>
          <option value="false">Not Contacted</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-text-muted mb-1">Location</label>
        <input className="input" placeholder="District / city" value={filters.location}
          onChange={e => onChange('location', e.target.value)} />
      </div>
      <div>
        <label className="block text-xs text-text-muted mb-1">Date From</label>
        <input className="input" type="date" value={filters.date_from}
          onChange={e => onChange('date_from', e.target.value)} />
      </div>
      <div>
        <label className="block text-xs text-text-muted mb-1">Date To</label>
        <input className="input" type="date" value={filters.date_to}
          onChange={e => onChange('date_to', e.target.value)} />
      </div>
      <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
        <button onClick={onClear} className="btn btn-ghost btn-sm gap-1 text-text-muted">
          <X size={13} /> Clear Filters
        </button>
      </div>
    </div>
  )
}

// ─── Column Visibility Toggle ─────────────────────────────────────────────────

function ColumnToggle({ visible, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)} className="btn btn-secondary btn-sm gap-1.5">
        <Eye size={13} /> Columns <ChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 card border border-surface-border py-1 z-20 animate-scale-in">
          {ALL_COLS.map(col => (
            <label key={col} className="flex items-center gap-2 px-3 py-1.5 hover:bg-surface-3 cursor-pointer">
              <input
                type="checkbox"
                checked={visible.includes(col)}
                onChange={() => onChange(col)}
                className="accent-accent"
              />
              <span className="text-xs text-text-secondary">{COL_LABELS[col]}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

const DEFAULT_FILTERS = { role: '', status: '', contacted: '', location: '', date_from: '', date_to: '' }
const DEFAULT_VISIBLE = ['full_name', 'email', 'location', 'role', 'status', 'contacted', 'createdAt']

export default function WaitlistAdmin() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  // Stats
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)

  // Table
  const [members, setMembers]         = useState([])
  const [pagination, setPagination]   = useState({ page: 1, pages: 1, total: 0 })
  const [tableLoading, setTableLoading] = useState(true)

  // Controls
  const [search, setSearch]           = useState('')
  const [filters, setFilters]         = useState(DEFAULT_FILTERS)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy]           = useState('createdAt')
  const [sortDir, setSortDir]         = useState('desc')
  const [page, setPage]               = useState(1)
  const [limit]                       = useState(20)
  const [visibleCols, setVisibleCols] = useState(DEFAULT_VISIBLE)

  // Selection + bulk
  const [selected, setSelected]       = useState(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)

  // Drawer
  const [drawerId, setDrawerId]       = useState(null)

  // Auth guard
  useEffect(() => {
    if (!authLoading) {
      if (!user) navigate('/login')
      else if (user.role !== 'admin') navigate('/')
    }
  }, [user, authLoading, navigate])

  const fetchStats = useCallback(() => {
    setStatsLoading(true)
    getWaitlistStats()
      .then(res => setStats(res.data.data))
      .catch(() => toast.error('Failed to load stats'))
      .finally(() => setStatsLoading(false))
  }, [])

  const fetchMembers = useCallback(() => {
    setTableLoading(true)
    const params = {
      page, limit,
      sort_by: sortBy, sort_dir: sortDir,
      ...(search && { search }),
      ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '')),
    }
    getWaitlist(params)
      .then(res => {
        setMembers(res.data.data)
        setPagination(res.data.pagination)
      })
      .catch(() => toast.error('Failed to load waitlist'))
      .finally(() => setTableLoading(false))
  }, [page, limit, sortBy, sortDir, search, filters])

  useEffect(() => { fetchStats() }, [fetchStats])
  useEffect(() => { fetchMembers() }, [fetchMembers])

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('desc') }
    setPage(1)
  }

  const handleFilterChange = (key, val) => {
    setFilters(f => ({ ...f, [key]: val }))
    setPage(1)
  }

  const toggleCol = (col) => {
    setVisibleCols(v => v.includes(col) ? v.filter(c => c !== col) : [...v, col])
  }

  const toggleSelect = (id) => {
    setSelected(s => {
      const ns = new Set(s)
      ns.has(id) ? ns.delete(id) : ns.add(id)
      return ns
    })
  }

  const toggleSelectAll = () => {
    if (selected.size === members.length) setSelected(new Set())
    else setSelected(new Set(members.map(m => m._id)))
  }

  const handleBulk = async (action, value) => {
    if (!selected.size) return
    setBulkLoading(true)
    try {
      const res = await bulkAction([...selected], action, value)
      toast.success(res.data.message)
      setSelected(new Set())
      fetchMembers()
      fetchStats()
    } catch {
      toast.error('Bulk action failed')
    } finally {
      setBulkLoading(false)
    }
  }

  const handleExportCsv = async () => {
    const params = {
      ...(search && { search }),
      ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '')),
      ...(selected.size && { ids: [...selected].join(',') }),
    }
    try {
      await downloadCsv(params)
      toast.success('CSV downloaded')
    } catch {
      toast.error('Export failed')
    }
  }

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={24} className="text-accent animate-spin" />
      </div>
    )
  }

  if (!user || user.role !== 'admin') return null

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 space-y-7">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/" className="text-text-muted hover:text-text-primary transition-colors">
              <ArrowLeft size={15} />
            </Link>
            <p className="text-xs text-text-muted">Admin</p>
            <span className="text-text-faint">/</span>
            <p className="text-xs text-text-primary font-medium">Waitlist</p>
          </div>
          <h1 className="text-2xl font-bold font-display text-text-primary">Waitlist Management</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Manage early access signups for KashDev
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/waitlist/analytics" className="btn btn-secondary btn-md gap-2">
            <BarChart2 size={15} /> Analytics
          </Link>
          <button onClick={handleExportCsv} className="btn btn-secondary btn-md gap-2">
            <Download size={15} /> Export CSV
          </button>
          <button onClick={() => { fetchStats(); fetchMembers() }} className="btn btn-ghost btn-sm p-2" title="Refresh">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statsLoading ? (
          [...Array(6)].map((_, i) => <div key={i} className="card h-20 skeleton" />)
        ) : (
          <>
            <AdminStatCard label="Total Waitlisters" value={stats?.total}        icon={Users}     color="text-accent" />
            <AdminStatCard label="New Today"          value={stats?.today}        icon={TrendingUp} color="text-green" />
            <AdminStatCard label="Last 7 Days"        value={stats?.last7}        icon={Calendar}  color="text-amber" />
            <AdminStatCard label="Last 30 Days"       value={stats?.last30}       icon={Calendar}  color="text-accent" />
            <AdminStatCard label="Contacted"          value={stats?.contacted}    icon={CheckCheck}color="text-green" />
            <AdminStatCard label="Not Contacted"      value={stats?.notContacted} icon={Clock}     color="text-amber" />
          </>
        )}
      </div>

      {/* ── Table Controls ── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint pointer-events-none" />
            <input
              type="search"
              placeholder="Search name, email, skills, company, location…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="input pl-9"
            />
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowFilters(f => !f)}
              className={`btn btn-sm gap-1.5 ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Filter size={13} />
              Filters
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-accent text-white text-[10px] flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <ColumnToggle visible={visibleCols} onChange={toggleCol} />
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <FiltersPanel
            filters={filters}
            onChange={handleFilterChange}
            onClear={() => { setFilters(DEFAULT_FILTERS); setPage(1) }}
          />
        )}

        {/* Bulk actions (visible when selection > 0) */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-accent/10 border border-accent/20 rounded-lg animate-fade-in">
            <span className="text-xs font-medium text-accent">
              {selected.size} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulk('mark_contacted')}
                disabled={bulkLoading}
                className="btn btn-sm btn-primary gap-1"
              >
                <CheckCheck size={12} /> Mark Contacted
              </button>
              <button
                onClick={() => handleBulk('mark_not_contacted')}
                disabled={bulkLoading}
                className="btn btn-sm btn-secondary gap-1"
              >
                <Clock size={12} /> Mark Not Contacted
              </button>
              <button
                onClick={handleExportCsv}
                disabled={bulkLoading}
                className="btn btn-sm btn-secondary gap-1"
              >
                <Download size={12} /> Export Selected
              </button>
              <button
                onClick={() => handleBulk('delete')}
                disabled={bulkLoading}
                className="btn btn-sm bg-red/10 border-red/20 text-red-text hover:bg-red/20 gap-1"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
            <button onClick={() => setSelected(new Set())} className="ml-auto text-text-muted hover:text-text-primary">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-muted">
            {tableLoading ? '—' : `${pagination.total.toLocaleString()} results`}
            {search && <span className="text-accent"> for "{search}"</span>}
          </p>
          {activeFiltersCount > 0 && (
            <button
              onClick={() => { setFilters(DEFAULT_FILTERS); setPage(1) }}
              className="text-xs text-text-muted hover:text-accent transition-colors flex items-center gap-1"
            >
              <X size={11} /> Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-2">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selected.size > 0 && selected.size === members.length}
                    onChange={toggleSelectAll}
                    className="accent-accent"
                  />
                </th>
                {visibleCols.map(col => (
                  <th
                    key={col}
                    onClick={() => handleSort(col)}
                    className="px-3 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider
                               cursor-pointer hover:text-text-primary whitespace-nowrap select-none transition-colors"
                  >
                    <span className="flex items-center gap-1">
                      {COL_LABELS[col]}
                      {sortBy === col ? (
                        sortDir === 'asc' ? <ChevronUp size={12} className="text-accent" /> : <ChevronDown size={12} className="text-accent" />
                      ) : (
                        <ChevronDown size={12} className="text-text-faint opacity-0 group-hover:opacity-100" />
                      )}
                    </span>
                  </th>
                ))}
                <th className="px-3 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {tableLoading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b border-surface-border">
                    <td className="px-4 py-3"><div className="skeleton h-4 w-4 rounded" /></td>
                    {visibleCols.map(c => (
                      <td key={c} className="px-3 py-3">
                        <div className="skeleton h-3 rounded" style={{ width: `${60 + (c.length * 4)}%` }} />
                      </td>
                    ))}
                    <td className="px-3 py-3"><div className="skeleton h-6 w-16 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={visibleCols.length + 2} className="text-center py-16 text-text-muted text-sm">
                    <AlertTriangle size={24} className="mx-auto mb-2 text-text-faint" />
                    No members found
                  </td>
                </tr>
              ) : (
                members.map(m => (
                  <tr
                    key={m._id}
                    className={`border-b border-surface-border hover:bg-surface-2 transition-colors cursor-pointer
                      ${selected.has(m._id) ? 'bg-accent/5' : ''}`}
                  >
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.has(m._id)}
                        onChange={() => toggleSelect(m._id)}
                        className="accent-accent"
                      />
                    </td>
                    {visibleCols.map(col => (
                      <td
                        key={col}
                        className="px-3 py-3 text-sm"
                        onClick={() => setDrawerId(m._id)}
                      >
                        {col === 'full_name' && (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent flex-shrink-0">
                              {m.full_name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-text-primary font-medium whitespace-nowrap">{m.full_name}</span>
                          </div>
                        )}
                        {col === 'email' && (
                          <span className="text-text-secondary text-xs font-mono">{m.email}</span>
                        )}
                        {col === 'phone' && (
                          <span className="text-text-secondary text-xs">{m.phone || '—'}</span>
                        )}
                        {col === 'location' && (
                          <span className="text-text-secondary text-xs whitespace-nowrap">{m.location}</span>
                        )}
                        {col === 'role' && (
                          <span className="badge badge-surface whitespace-nowrap">{m.role}</span>
                        )}
                        {col === 'status' && (
                          <span className={`badge ${STATUS_COLORS[m.status]} capitalize whitespace-nowrap`}>{m.status}</span>
                        )}
                        {col === 'contacted' && (
                          <span className={`badge ${m.contacted ? 'badge-green' : 'badge-surface'}`}>
                            {m.contacted ? '✓ Yes' : '—'}
                          </span>
                        )}
                        {col === 'createdAt' && (
                          <span className="text-text-muted text-xs whitespace-nowrap tabular">
                            {new Date(m.createdAt).toLocaleDateString()}
                          </span>
                        )}
                        {(col === 'github_url' || col === 'linkedin_url' || col === 'portfolio_url') && (
                          m[col] ? (
                            <a
                              href={m[col]}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="text-accent hover:text-accent-hover text-xs transition-colors"
                            >
                              {col === 'github_url' ? 'GitHub ↗' : col === 'linkedin_url' ? 'LinkedIn ↗' : 'Portfolio ↗'}
                            </a>
                          ) : <span className="text-text-faint text-xs">—</span>
                        )}
                        {col === 'company_or_college' && (
                          <span className="text-text-secondary text-xs">{m.company_or_college || '—'}</span>
                        )}
                        {col === 'skills' && (
                          <span className="text-text-secondary text-xs line-clamp-1 max-w-[140px]">
                            {m.skills || '—'}
                          </span>
                        )}
                      </td>
                    ))}

                    {/* Row actions */}
                    <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => { navigator.clipboard.writeText(m.email); toast.success('Email copied!') }}
                          className="p-1.5 rounded text-text-faint hover:text-accent hover:bg-accent/10 transition-all"
                          title="Copy email"
                        >
                          <Mail size={12} />
                        </button>
                        {m.phone && (
                          <button
                            onClick={() => { navigator.clipboard.writeText(m.phone); toast.success('Phone copied!') }}
                            className="p-1.5 rounded text-text-faint hover:text-amber hover:bg-amber/10 transition-all"
                            title="Copy phone"
                          >
                            <Phone size={12} />
                          </button>
                        )}
                        <button
                          onClick={() => setDrawerId(m._id)}
                          className="btn btn-sm btn-ghost gap-1 text-xs"
                        >
                          <Eye size={12} /> View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!tableLoading && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-border">
            <p className="text-xs text-text-muted">
              Page <strong className="text-text-primary">{pagination.page}</strong> of{' '}
              <strong className="text-text-primary">{pagination.pages}</strong>
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!pagination.hasPrev || tableLoading}
                className="btn btn-ghost btn-sm px-2 disabled:opacity-40"
              >
                <ChevronLeft size={15} />
              </button>
              {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                const pg = Math.max(1, Math.min(pagination.pages - 4, pagination.page - 2)) + i
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`btn btn-sm px-3 ${pg === pagination.page ? 'btn-primary' : 'btn-ghost'}`}
                  >
                    {pg}
                  </button>
                )
              })}
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={!pagination.hasNext || tableLoading}
                className="btn btn-ghost btn-sm px-2 disabled:opacity-40"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Profile Drawer */}
      {drawerId && (
        <ProfileDrawer
          memberId={drawerId}
          onClose={() => setDrawerId(null)}
          onUpdate={() => { fetchMembers(); fetchStats() }}
        />
      )}
    </div>
  )
}
