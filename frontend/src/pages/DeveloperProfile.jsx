import { useParams, Link } from 'react-router-dom'
import { Github, Linkedin, Globe, MapPin, Briefcase, Eye, Star, Trophy, ExternalLink } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import Avatar from '../components/ui/Avatar'
import ProjectCard from '../components/ui/ProjectCard'
import { SkeletonLine } from '../components/ui/Skeleton'
import { formatLocation } from '../utils/helpers'

export default function DeveloperProfile() {
  const { username } = useParams()
  const { data, loading, error } = useApi(`/developers/${username}`)

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <SkeletonLine h="10" w="48" /><SkeletonLine h="4" w="64" /><SkeletonLine h="4" w="full" />
    </div>
  )
  if (error || !data) return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
      <p className="text-text-muted">Developer not found.</p>
      <Link to="/developers" className="btn btn-ghost btn-sm mt-4">← Back to Developers</Link>
    </div>
  )

  const { user, profile, projects } = data.data

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6 animate-fade-in">
      {/* Profile Card */}
      <div className="card overflow-hidden">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-accent-subtle via-surface-3 to-surface-2 border-b border-surface-border" />

        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 mb-5">
            <Avatar name={user.name} src={user.avatar} size="2xl" className="-mt-4 ring-4 ring-surface-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold font-display text-text-primary">{user.name}</h1>
                {user.isVerified && <span className="badge badge-accent">Verified</span>}
                {user.isFeatured && <Star size={14} className="text-amber fill-amber" />}
                {profile?.openToWork && <span className="badge badge-green">Open to Work</span>}
              </div>
              <p className="text-sm text-text-muted">@{user.username}</p>
            </div>
            <div className="flex items-center gap-2">
              {profile?.github && (
                <a href={profile.github} target="_blank" rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm gap-1.5"><Github size={13} /> GitHub</a>
              )}
              {profile?.linkedin && (
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm gap-1.5"><Linkedin size={13} /> LinkedIn</a>
              )}
              {profile?.portfolio && (
                <a href={profile.portfolio} target="_blank" rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm gap-1.5"><Globe size={13} /> Portfolio</a>
              )}
            </div>
          </div>

          {user.bio && <p className="text-sm text-text-secondary mb-5 max-w-2xl leading-relaxed">{user.bio}</p>}

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-text-muted mb-5">
            {formatLocation(user.location) && <span className="flex items-center gap-1.5"><MapPin size={11} />{formatLocation(user.location)}</span>}
            {profile?.company && <span className="flex items-center gap-1.5"><Briefcase size={11} />{profile.jobTitle ? `${profile.jobTitle} at ${profile.company}` : profile.company}</span>}
            {profile?.experience && <span className="flex items-center gap-1.5"><Eye size={11} />{profile.experience} experience</span>}
            {profile?.profileViews > 0 && <span className="flex items-center gap-1.5 text-text-faint"><Eye size={11} />{profile.profileViews} views</span>}
          </div>

          {profile?.skills?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-2">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map(s => <span key={s} className="tag">{s}</span>)}
              </div>
            </div>
          )}

          {profile?.hallOfFameCategory && (
            <div className="mt-4 flex items-center gap-2 text-amber-text text-xs font-medium">
              <Trophy size={13} /> Hall of Fame — {profile.hallOfFameCategory.replace('-', ' ')}
            </div>
          )}

          {profile?.achievements?.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-2">Achievements</p>
              <ul className="space-y-1">
                {profile.achievements.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                    <Star size={11} className="text-amber mt-0.5 flex-shrink-0" /> {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Projects */}
      {projects?.length > 0 && (
        <div>
          <h2 className="text-lg font-bold font-display text-text-primary mb-4">Projects</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {projects.map(p => <ProjectCard key={p._id} project={p} />)}
          </div>
        </div>
      )}
    </div>
  )
}