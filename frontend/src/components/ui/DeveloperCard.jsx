import { Link } from 'react-router-dom'
import { MapPin, Briefcase, Star, Heart } from 'lucide-react'
import Avatar from './Avatar'
import SkillTag from './SkillTag'
import { truncate } from '../../utils/helpers'
import { formatLocation } from '../../utils/helpers'

export default function DeveloperCard({ profile }) {
  const { user, skills = [], company, experience, openToWork } = profile
  if (!user) return null

  return (
    <Link to={`/developers/${user.username}`}
      className="card card-hover p-5 flex flex-col gap-4 group block animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={user.name} src={user.avatar} size="lg" />
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-text-primary text-sm group-hover:text-white transition-colors">{user.name}</p>
              {user.isFeatured && <Star size={12} className="text-amber fill-amber flex-shrink-0" />}
            </div>
            <p className="text-xs text-text-muted">@{user.username}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {openToWork && <span className="badge badge-green">Open to Work</span>}
          {user.reputation > 0 && (
            <div className="flex items-center gap-1 bg-accent/10 px-2 py-1 rounded text-xs">
              <Heart size={11} className="text-red-500 fill-red-500" />
              <span className="font-medium text-red-500">{user.reputation}</span>
            </div>
          )}
        </div>
      </div>

      {user.bio && <p className="text-xs text-text-secondary leading-relaxed">{truncate(user.bio, 100)}</p>}

      <div className="flex flex-col gap-2">
        {company && (
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <Briefcase size={11} /> {company}
          </div>
        )}
        {formatLocation(user.location) && (
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <MapPin size={11} /> {formatLocation(user.location)}
          </div>
        )}
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skills.slice(0, 5).map(s => <SkillTag key={s} skill={s} />)}
          {skills.length > 5 && <span className="tag">+{skills.length - 5}</span>}
        </div>
      )}
    </Link>
  )
}