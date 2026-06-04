import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BarChart2, TrendingUp, Users, ArrowLeft, RefreshCw,
  Loader2, Calendar, MapPin, Briefcase,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getWaitlistAnalytics, getWaitlistStats } from '../../services/waitlistService'

// ─── Chart Components ─────────────────────────────────────────────────────────

function BarRow({ label, value, max, color = 'bg-accent', total }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  const share = total > 0 ? ((value / total) * 100).toFixed(1) : '0'

  return (
    <div className="flex items-center gap-3 group">
      <span className="text-xs text-text-secondary w-32 flex-shrink-0 truncate" title={label}>
        {label}
      </span>
      <div className="flex-1 bg-surface-3 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs font-bold tabular text-text-primary w-8 text-right">{value}</span>
        <span className="text-[10px] text-text-faint w-10 text-right hidden sm:block">{share}%</span>
      </div>
    </div>
  )
}

function DailyChart({ data, label = 'Signups' }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-text-faint text-sm">
        No data for this period
      </div>
    )
  }

  const max = Math.max(...data.map(d => d.count), 1)

  return (
    <div className="flex items-end gap-1 h-40 w-full overflow-x-auto">
      {data.map((d, i) => {
        const h = Math.max(2, Math.round((d.count / max) * 100))
        const dateLabel = d._id
          ? `${d._id.month}/${d._id.day}`
          : `${i + 1}`
        return (
          <div key={i} className="flex-1 min-w-[20px] flex flex-col items-center gap-1 group relative">
            {/* Tooltip */}
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100
                            bg-surface-4 border border-surface-border text-[10px] text-text-primary
                            px-2 py-1 rounded whitespace-nowrap pointer-events-none z-10 transition-opacity">
              {d.count} {label}
              {d._id && <div className="text-text-faint">{d._id.year}/{d._id.month}/{d._id.day}</div>}
            </div>
            <div
              className="w-full bg-accent rounded-t-sm transition-all duration-500 group-hover:bg-accent-hover cursor-pointer"
              style={{ height: `${h}%` }}
            />
            {data.length <= 15 && (
              <span className="text-[9px] text-text-faint rotate-45 origin-left hidden sm:block">
                {dateLabel}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function StatMini({ label, value, icon: Icon, color = 'text-accent' }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <Icon size={16} className={color} />
      <div>
        <p className="text-xl font-bold font-display tabular text-text-primary">{value ?? '—'}</p>
        <p className="text-[11px] text-text-muted">{label}</p>
      </div>
    </div>
  )
}

// ─── Main Analytics Page ──────────────────────────────────────────────────────

const PERIOD_OPTIONS = [
  { label: '7 Days',  value: 7 },
  { label: '30 Days', value: 30 },
  { label: '90 Days', value: 90 },
]

export default function WaitlistAnalytics() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [period, setPeriod] = useState(30)
  const [analytics, setAnalytics] = useState(null)
  const [stats, setStats]         = useState(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    if (!authLoading) {
      if (!user) navigate('/login')
      else if (user.role !== 'admin') navigate('/')
    }
  }, [user, authLoading, navigate])

  const fetchData = useCallback(() => {
    setLoading(true)
    Promise.all([
      getWaitlistAnalytics({ days: period }),
      getWaitlistStats(),
    ])
      .then(([anaRes, statsRes]) => {
        setAnalytics(anaRes.data.data)
        setStats(statsRes.data.data)
      })
      .finally(() => setLoading(false))
  }, [period])

  useEffect(() => { fetchData() }, [fetchData])

  const byRole     = analytics?.byRole     || []
  const byLocation = analytics?.byLocation || []
  const byStatus   = analytics?.byStatus   || []
  const daily      = analytics?.dailyGrowth || []

  const maxRole     = Math.max(...byRole.map(r => r.count), 1)
  const maxLocation = Math.max(...byLocation.map(l => l.count), 1)
  const maxStatus   = Math.max(...byStatus.map(s => s.count), 1)
  const totalRole   = byRole.reduce((s, r) => s + r.count, 0)
  const totalLoc    = byLocation.reduce((s, l) => s + l.count, 0)

  if (authLoading || (!user || user.role !== 'admin')) return null

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/admin/waitlist" className="text-text-muted hover:text-text-primary transition-colors">
              <ArrowLeft size={15} />
            </Link>
            <p className="text-xs text-text-muted">Admin / Waitlist</p>
            <span className="text-text-faint">/</span>
            <p className="text-xs text-text-primary font-medium">Analytics</p>
          </div>
          <h1 className="text-2xl font-bold font-display text-text-primary">Waitlist Analytics</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Signup trends and demographic breakdown
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Period toggle */}
          <div className="flex items-center gap-1 bg-surface-3 rounded-lg p-0.5 border border-surface-border">
            {PERIOD_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={`px-3 py-1.5 text-xs rounded-md transition-all font-medium ${
                  period === opt.value
                    ? 'bg-accent text-white'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button onClick={fetchData} className="btn btn-ghost btn-sm p-2" title="Refresh">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* ── KPI Row ── */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="card h-16 skeleton" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatMini label="Total Waitlisters" value={stats?.total}        icon={Users}     color="text-accent" />
          <StatMini label="New Today"          value={stats?.today}        icon={TrendingUp} color="text-green" />
          <StatMini label={`Last ${period}d`}  value={stats?.last30}       icon={Calendar}  color="text-amber" />
          <StatMini label="Contacted"          value={stats?.contacted}    icon={Briefcase} color="text-green" />
        </div>
      )}

      {/* ── Daily Growth Chart ── */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-green" />
            <h2 className="font-semibold text-text-primary">Signup Growth</h2>
            <span className="text-xs text-text-muted">— last {period} days</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-accent" />
            <span className="text-xs text-text-muted">Daily signups</span>
          </div>
        </div>

        {loading ? (
          <div className="h-40 skeleton rounded-lg" />
        ) : (
          <DailyChart data={daily} label="signups" />
        )}

        {/* Summary row */}
        {!loading && daily.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-surface-border">
            <div className="text-center">
              <p className="text-lg font-bold tabular text-text-primary">
                {daily.reduce((s, d) => s + d.count, 0)}
              </p>
              <p className="text-xs text-text-muted">Total in Period</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold tabular text-text-primary">
                {(daily.reduce((s, d) => s + d.count, 0) / Math.max(daily.length, 1)).toFixed(1)}
              </p>
              <p className="text-xs text-text-muted">Avg per Day</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold tabular text-text-primary">
                {Math.max(...daily.map(d => d.count), 0)}
              </p>
              <p className="text-xs text-text-muted">Peak Day</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Breakdown Charts ── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* By Role */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-5">
            <Briefcase size={15} className="text-accent" />
            <h3 className="font-semibold text-text-primary text-sm">By Role</h3>
            <span className="ml-auto text-xs text-text-muted tabular">{totalRole} total</span>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-4 rounded" />)}
            </div>
          ) : byRole.length === 0 ? (
            <p className="text-xs text-text-faint text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-3">
              {byRole.map(({ _id, count }) => (
                <BarRow key={_id} label={_id} value={count} max={maxRole} total={totalRole} color="bg-accent" />
              ))}
            </div>
          )}
        </div>

        {/* By District / Location */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-5">
            <MapPin size={15} className="text-amber" />
            <h3 className="font-semibold text-text-primary text-sm">By Location</h3>
            <span className="ml-auto text-xs text-text-muted tabular">{totalLoc} total</span>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-4 rounded" />)}
            </div>
          ) : byLocation.length === 0 ? (
            <p className="text-xs text-text-faint text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-3">
              {byLocation.slice(0, 12).map(({ _id, count }) => (
                <BarRow key={_id} label={_id || 'Unknown'} value={count} max={maxLocation} total={totalLoc} color="bg-amber" />
              ))}
            </div>
          )}
        </div>

        {/* By Status */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-5">
            <BarChart2 size={15} className="text-green" />
            <h3 className="font-semibold text-text-primary text-sm">By Status</h3>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-4 rounded" />)}
            </div>
          ) : byStatus.length === 0 ? (
            <p className="text-xs text-text-faint text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-3">
              {byStatus.map(({ _id, count }) => {
                const colorMap = {
                  new: 'bg-accent', reviewed: 'bg-amber', approved: 'bg-green',
                  rejected: 'bg-red', contacted: 'bg-surface-5',
                }
                return (
                  <BarRow
                    key={_id}
                    label={_id}
                    value={count}
                    max={maxStatus}
                    total={stats?.total || 1}
                    color={colorMap[_id] || 'bg-accent'}
                  />
                )
              })}
            </div>
          )}

          {/* Status legend */}
          {!loading && byStatus.length > 0 && (
            <div className="mt-5 pt-4 border-t border-surface-border">
              <div className="grid grid-cols-2 gap-2">
                {byStatus.map(({ _id, count }) => (
                  <div key={_id} className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                    <span className="text-[11px] text-text-muted capitalize">{_id}:</span>
                    <span className="text-[11px] font-semibold text-text-primary tabular">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Navigation back ── */}
      <div className="flex items-center justify-center pt-4">
        <Link to="/admin/waitlist" className="btn btn-secondary btn-md gap-2">
          <ArrowLeft size={14} /> Back to Waitlist Management
        </Link>
      </div>
    </div>
  )
}
