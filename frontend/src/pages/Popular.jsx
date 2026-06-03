import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Heart, Star, Zap, MessageSquare, TrendingUp } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import Avatar from '../components/ui/Avatar'

const CATEGORIES = [
  { key: 'reputation', label: 'Most Loved',   icon: Heart },
  { key: 'followers',  label: 'Most Followed', icon: Star },
]

function LeaderboardRow({ rank, user, category }) {
  const medals = ['🥇', '🥈', '🥉']
  const metric = category === 'followers'
    ? { value: user.followersCount || 0, label: 'followers' }
    : { value: user.reputation || 0, label: 'reputation' }

  return (
    <Link to={`/developers/${user.username}`}
      className="flex items-center gap-4 p-4 hover:bg-surface-2 transition-all rounded-xl">
      <div className="w-8 text-center flex-shrink-0">
        {rank <= 3
          ? <span className="text-lg">{medals[rank - 1]}</span>
          : <span className="text-sm font-bold text-text-faint tabular">{rank}</span>
        }
      </div>
      <Avatar name={user.name} src={user.avatar} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-text-primary truncate">{user.name}</p>
          {user.isFeatured && <Star size={11} className="text-amber fill-amber flex-shrink-0" />}
          {user.isVerified && <span className="badge badge-accent text-[10px] px-1.5 py-0">✓</span>}
        </div>
        <p className="text-xs text-text-muted truncate">@{user.username}</p>
        {user.bio && <p className="text-xs text-text-faint truncate mt-0.5">{user.bio}</p>}
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-text-primary tabular">{metric.value}</p>
        <p className="text-[10px] text-text-faint">{metric.label}</p>
      </div>
    </Link>
  )
}

export default function Popular() {
  const [category, setCategory] = useState('reputation')
  const { data, loading } = useApi('/social/leaderboard', { params: { category } })
  const users = data?.data || []

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-2xl bg-amber-muted border border-amber/20 flex items-center justify-center mx-auto mb-4">
          <TrendingUp size={28} className="text-amber" />
        </div>
        <h1 className="text-3xl font-bold font-display text-text-primary mb-2">Popular Developers</h1>
        <p className="text-sm text-text-secondary">The most appreciated members of the KashDev community</p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 justify-center flex-wrap">
        {CATEGORIES.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setCategory(key)}
            className={`btn btn-sm gap-1.5 ${category === key ? 'btn-primary' : 'btn-secondary'}`}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="card divide-y divide-surface-border overflow-hidden">
        {loading ? (
          Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className="skeleton w-8 h-5 rounded" />
              <div className="skeleton w-9 h-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-32 rounded" />
                <div className="skeleton h-2.5 w-20 rounded" />
              </div>
            </div>
          ))
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-muted text-sm">No data yet.</p>
          </div>
        ) : (
          users.map((u, i) => <LeaderboardRow key={u._id} rank={i + 1} user={u} category={category} />)
        )}
      </div>
    </div>
  )
}
