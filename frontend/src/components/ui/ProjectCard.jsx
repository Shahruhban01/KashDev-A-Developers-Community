import { Link } from 'react-router-dom'
import { Github, ExternalLink, Heart, Star } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'
import api from '../../services/api'
import Avatar from './Avatar'
import { timeAgo, truncate } from '../../utils/helpers'
import toast from 'react-hot-toast'

export default function ProjectCard({ project, onLikeToggle }) {
  const { user } = useAuth()
  const [likes, setLikes] = useState(project.likesCount || 0)
  const [liked, setLiked] = useState(project.likes?.includes(user?._id))
  const [liking, setLiking] = useState(false)

  const handleLike = async (e) => {
    e.preventDefault()
    if (!user) { toast.error('Login to like projects'); return }
    if (liking) return
    setLiking(true)
    try {
      const { data } = await api.post(`/projects/${project._id}/like`)
      setLiked(data.liked)
      setLikes(data.likesCount)
      onLikeToggle?.()
    } catch { toast.error('Failed to like') } finally { setLiking(false) }
  }

  return (
    <div className="card card-hover p-5 flex flex-col gap-4 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            {project.isFeatured && <Star size={12} className="text-amber fill-amber" />}
            <h3 className="font-semibold text-text-primary text-sm leading-tight">{project.title}</h3>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">{truncate(project.description, 110)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {project.technologies?.slice(0, 5).map(t => (
          <span key={t} className="tag">{t}</span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-surface-border">
        <Link to={`/developers/${project.owner?.username}`}
          className="flex items-center gap-2 text-xs text-text-muted hover:text-text-primary transition-colors">
          <Avatar name={project.owner?.name} src={project.owner?.avatar} size="xs" />
          {project.owner?.name}
          <span className="text-text-faint">· {timeAgo(project.createdAt)}</span>
        </Link>
        <div className="flex items-center gap-2">
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
              className="p-1.5 text-text-muted hover:text-text-primary transition-colors">
              <Github size={14} />
            </a>
          )}
          {project.demoUrl && (
            <a href={project.demoUrl} target="_blank" rel="noopener noreferrer"
              className="p-1.5 text-text-muted hover:text-text-primary transition-colors">
              <ExternalLink size={14} />
            </a>
          )}
          <button onClick={handleLike}
            className={`flex items-center gap-1 p-1.5 rounded-lg text-xs transition-all ${
              liked ? 'text-red-text' : 'text-text-muted hover:text-red-text'
            }`}>
            <Heart size={13} className={liked ? 'fill-current' : ''} />
            {likes}
          </button>
        </div>
      </div>
    </div>
  )
}