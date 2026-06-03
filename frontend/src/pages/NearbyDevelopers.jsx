import { useState } from 'react'
import { MapPin, Users } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import DeveloperCard from '../components/ui/DeveloperCard'
import { SkeletonGrid } from '../components/ui/Skeleton'

const DISTRICTS = [
  'Srinagar','Baramulla','Anantnag','Pulwama','Kupwara','Shopian',
  'Kulgam','Bandipora','Ganderbal','Budgam','Jammu',
]

export default function NearbyDevelopers() {
  const [district, setDistrict] = useState('Srinagar')

  const { data: snapData }  = useApi(`/location/districts/${district}`)
  const { data, loading }   = useApi('/location/nearby', { params: { district } })
  const developers = data?.data || []
  const snap       = snapData?.data

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-1">Geographic</p>
        <h1 className="text-2xl font-bold font-display text-text-primary">Developers Near You</h1>
        <p className="text-sm text-text-secondary mt-1">Find developers in your district</p>
      </div>

      {/* District picker */}
      <div className="flex flex-wrap gap-2 mb-8">
        {DISTRICTS.map(d => (
          <button key={d} onClick={() => setDistrict(d)}
            className={`btn btn-sm ${district === d ? 'btn-primary' : 'btn-secondary'}`}>
            {d}
          </button>
        ))}
      </div>

      {/* District snapshot */}
      {snap && (
        <div className="card p-5 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-xl font-bold font-display tabular text-text-primary">{snap.total}</p>
            <p className="text-xs text-text-muted">Total Developers</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold font-display tabular text-text-primary">{snap.students}</p>
            <p className="text-xs text-text-muted">Students</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-text-muted mb-2">Top Skills in {district}</p>
            <div className="flex flex-wrap gap-1.5">
              {snap.topSkills?.slice(0, 5).map(({ skill, count }) => (
                <span key={skill} className="tag">
                  {skill} <span className="text-text-faint ml-1">×{count}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Developer grid */}
      {loading
        ? <SkeletonGrid count={6} />
        : developers.length === 0
          ? (
            <div className="text-center py-20 card">
              <MapPin size={32} className="text-text-faint mx-auto mb-3" />
              <p className="text-text-muted text-sm">No developers found in {district}.</p>
              <p className="text-xs text-text-faint mt-1">Be the first to add your location!</p>
            </div>
          )
          : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {developers.map(({ user, profile }) => (
                profile ? <DeveloperCard key={user._id} profile={{ ...profile, user }} />
                  : null
              ))}
            </div>
          )
      }
    </div>
  )
}