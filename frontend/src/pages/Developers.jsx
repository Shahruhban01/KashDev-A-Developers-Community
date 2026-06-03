import { useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import DeveloperCard from '../components/ui/DeveloperCard'
import { SkeletonGrid } from '../components/ui/Skeleton'
import { SKILLS, EXPERIENCE_LEVELS } from '../utils/helpers'

export default function Developers() {
  const [search, setSearch] = useState('')
  const [skill, setSkill] = useState('')
  const [experience, setExperience] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const params = {}
  if (search) params.search = search
  if (skill) params.skill = skill
  if (experience) params.experience = experience

  const { data, loading } = useApi('/developers', { params })
  const developers = data?.data || []
  const hasFilters = search || skill || experience

  const clearFilters = () => { setSearch(''); setSkill(''); setExperience('') }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-display text-text-primary mb-1">Developer Directory</h1>
        <p className="text-sm text-text-secondary">
          {data?.pagination?.total || 0} Kashmiri developers and counting
        </p>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" placeholder="Search by name or username..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="input pl-9" />
        </div>
        <button onClick={() => setShowFilters(o => !o)}
          className={`btn ${showFilters ? 'btn-secondary border-accent/40' : 'btn-secondary'} gap-2 flex-shrink-0`}>
          <SlidersHorizontal size={14} /> Filters
          {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
        </button>
        {hasFilters && (
          <button onClick={clearFilters} className="btn btn-ghost gap-1.5 text-text-muted flex-shrink-0">
            <X size={13} /> Clear
          </button>
        )}
      </div>

      {showFilters && (
        <div className="card p-5 mb-6 grid sm:grid-cols-2 gap-4 animate-slide-up">
          <div>
            <label className="label">Filter by Skill</label>
            <select value={skill} onChange={e => setSkill(e.target.value)} className="input">
              <option value="">All Skills</option>
              {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Experience Level</label>
            <select value={experience} onChange={e => setExperience(e.target.value)} className="input">
              <option value="">Any Experience</option>
              {EXPERIENCE_LEVELS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <SkeletonGrid count={9} />
      ) : developers.length === 0 ? (
        <div className="text-center py-20 card">
          <p className="font-medium text-text-primary text-sm mb-1">No developers found</p>
          <p className="text-text-muted text-xs mb-6">
            Try a different name, skill, or remove some filters.
          </p>

          {/* Suggested skills to try */}
          <p className="text-xs text-text-faint uppercase tracking-widest mb-3">Try searching for</p>
          <div className="flex flex-wrap justify-center gap-2 max-w-sm mx-auto">
            {['React', 'Node.js', 'Flutter', 'Python', 'MongoDB', 'PHP'].map(s => (
              <button
                key={s}
                onClick={() => { setSkill(s); setSearch('') }}
                className="tag hover:border-accent hover:text-accent transition-all cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="btn btn-ghost btn-sm mt-5">
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {developers.map(p => <DeveloperCard key={p._id} profile={p} />)}
        </div>
      )}
    </div>
  )
}