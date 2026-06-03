import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  Github, Linkedin, Globe, MapPin, Briefcase,
  Eye, Star, Trophy, MessageSquare, Heart, UserPlus, Users
} from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import Avatar from '../components/ui/Avatar'
import ProjectCard from '../components/ui/ProjectCard'
import { SkeletonLine } from '../components/ui/Skeleton'
import { formatLocation } from '../utils/helpers'
import toast from 'react-hot-toast'
import './DeveloperProfile.css'

export default function DeveloperProfile() {
  const { username } = useParams()
  const navigate = useNavigate()
  const { user: authUser } = useAuth()
  const { data, loading, error } = useApi(`/developers/${username}`)
  const [isLiked, setIsLiked] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [isLiking, setIsLiking] = useState(false)
  const [admirers, setAdmirers] = useState([])
  const [floatingHearts, setFloatingHearts] = useState([])

  const user = data?.data?.user
  const profile = data?.data?.profile
  const projects = data?.data?.projects

  useEffect(() => {
    if (!user) return
    setFollowersCount(user.followersCount || 0)
    setFollowingCount(user.followingCount || 0)

    const checkLikeStatus = async () => {
      try {
        const { data: res } = await api.get(`/profile-likes/${user._id}`)
        setIsLiked(res.data?.liked || false)
        setLikeCount(res.data?.count || 0)
        setAdmirers(res.data?.recentAdmirers || [])
      } catch {}
    }
    const checkFollowStatus = async () => {
      if (!authUser) return
      try {
        const { data: res } = await api.get(`/follow/${user._id}/status`)
        setIsFollowing(res.data?.following ?? res.following ?? false)
        setFollowersCount(res.data?.followersCount ?? user.followersCount ?? 0)
        setFollowingCount(res.data?.followingCount ?? user.followingCount ?? 0)
      } catch {}
    }
    checkLikeStatus()
    checkFollowStatus()
  }, [user?._id, authUser?._id])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <SkeletonLine h="10" w="48" />
        <SkeletonLine h="4" w="64" />
        <SkeletonLine h="4" w="full" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-text-muted">Developer not found.</p>
        <Link to="/developers" className="btn btn-ghost btn-sm mt-4">
          ← Back to Developers
        </Link>
      </div>
    )
  }

  const handleLike = async () => {
    if (!authUser) {
      navigate('/login')
      return
    }

    setIsLiking(true)
    try {
      const { data: res } = await api.post(`/profile-likes/${user._id}`)
      const wasLiked = isLiked
      const newLiked = res.data?.liked

      setIsLiked(newLiked)
      setLikeCount(prev => newLiked ? prev + 1 : Math.max(0, prev - 1))

      if (newLiked && !wasLiked) {
        // Add floating hearts animation
        const heart = { id: Date.now(), left: Math.random() * 80 + 10 }
        setFloatingHearts(prev => [...prev, heart])
        setTimeout(() => {
          setFloatingHearts(prev => prev.filter(h => h.id !== heart.id))
        }, 800)

        toast.success('❤️ Liked!', { duration: 1500 })
        // Refresh admirers list
        try {
          const { data: likeRes } = await api.get(`/profile-likes/${user._id}`)
          setAdmirers(likeRes.data?.recentAdmirers || [])
        } catch {}
      } else if (!newLiked && wasLiked) {
        toast('Unliked', { duration: 1500 })
      }
    } catch (err) {
      toast.error('Failed to like profile')
    } finally {
      setIsLiking(false)
    }
  }

  const handleFollow = async () => {
    if (!authUser) {
      navigate('/login')
      return
    }
    try {
      const { data: res } = await api.post(`/follow/${user._id}`)
      const nextFollowing = res.data?.following ?? res.following ?? false
      setIsFollowing(nextFollowing)
      setFollowersCount(res.data?.followersCount ?? (nextFollowing ? followersCount + 1 : Math.max(0, followersCount - 1)))
      setFollowingCount(res.data?.followingCount ?? followingCount)
      toast.success(nextFollowing ? 'Following!' : 'Unfollowed!')
    } catch (err) {
      toast.error('Failed to follow')
    }
  }

  const handleMessage = async () => {
    if (!authUser) {
      navigate('/login')
      return
    }

    try {
      const { data: res } = await api.post('/chats/requests', {
        receiverId: user._id,
        initialMessage: `Hi ${user.name}, I'd love to connect!`,
      })

      navigate('/messages')
      toast.success('Message request sent!')
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to send message')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6 animate-fade-in relative">
      {/* Floating Hearts Container */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {floatingHearts.map(heart => (
          <div
            key={heart.id}
            className="fixed animate-floating-heart text-red-500"
            style={{
              left: `${heart.left}%`,
              bottom: '20%',
              fontSize: '2rem',
              pointerEvents: 'none',
            }}
          >
            ❤️
          </div>
        ))}
      </div>
      <div className="card overflow-hidden">
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
              <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
                <span className="flex items-center gap-1">
                  <Users size={11} /> {followersCount} follower{followersCount === 1 ? '' : 's'}
                </span>
                <span>{followingCount} following</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {profile?.github && (
                <a href={profile.github} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm gap-1.5">
                  <Github size={13} /> GitHub
                </a>
              )}
              {profile?.linkedin && (
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm gap-1.5">
                  <Linkedin size={13} /> LinkedIn
                </a>
              )}
              {profile?.portfolio && (
                <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm gap-1.5">
                  <Globe size={13} /> Portfolio
                </a>
              )}
              {authUser?._id !== user._id && (
                <>
                  <button
                    onClick={handleLike}
                    disabled={isLiking}
                    className={`btn btn-sm gap-1.5 relative transition-all ${isLiked ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    <span className={`inline-block transition-transform ${isLiking ? 'scale-125' : 'scale-100'}`}>
                      <Heart
                        size={13}
                        fill={isLiked ? 'currentColor' : 'none'}
                        className={isLiking && isLiked ? 'animate-like-pulse' : ''}
                      />
                    </span>
                    <span className="font-medium">{likeCount > 0 ? likeCount : 'Like'}</span>
                  </button>
                  <button onClick={handleFollow} className={`btn btn-sm gap-1.5 ${isFollowing ? 'btn-primary' : 'btn-secondary'}`}>
                    <UserPlus size={13} /> {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </>
              )}
            </div>

            {authUser?._id !== user._id && (
              <button onClick={handleMessage} className="btn btn-primary btn-sm gap-1.5">
                <MessageSquare size={13} /> Message
              </button>
            )}
          </div>

          {user.bio && <p className="text-sm text-text-secondary mb-5 max-w-2xl leading-relaxed">{user.bio}</p>}

          {likeCount > 0 && (
            <div className="mb-5 p-3 bg-accent/5 border border-accent/20 rounded-lg animate-slide-in-like likes-section">
              <div className="flex items-center gap-2 mb-2">
                <Heart size={14} className="text-red-500 fill-red-500" />
                <p className="text-xs font-semibold text-text-primary">{likeCount} like{likeCount !== 1 ? 's' : ''}</p>
              </div>
              {admirers.length > 0 && (
                <div className="flex items-center gap-2">
                  <p className="text-xs text-text-muted">Liked by</p>
                  <div className="flex -space-x-1.5">
                    {admirers.slice(0, 3).map(admirer => (
                      <Link
                        key={admirer._id}
                        to={`/developers/${admirer.username}`}
                        title={admirer.name}
                        className="w-5 h-5 rounded-full border border-surface-border hover:scale-110 transition-transform"
                      >
                        <Avatar name={admirer.name} src={admirer.avatar} size="sm" />
                      </Link>
                    ))}
                  </div>
                  {admirers.length > 3 && <p className="text-xs text-text-muted">+{admirers.length - 3} more</p>}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-text-muted mb-5">
            {formatLocation(user.location) && (
              <span className="flex items-center gap-1.5">
                <MapPin size={11} />{formatLocation(user.location)}
              </span>
            )}
            {profile?.company && (
              <span className="flex items-center gap-1.5">
                <Briefcase size={11} />
                {profile.jobTitle ? `${profile.jobTitle} at ${profile.company}` : profile.company}
              </span>
            )}
            {profile?.experience && (
              <span className="flex items-center gap-1.5">
                <Eye size={11} />{profile.experience} experience
              </span>
            )}
            {profile?.profileViews > 0 && (
              <span className="flex items-center gap-1.5 text-text-faint">
                <Eye size={11} />{profile.profileViews} views
              </span>
            )}
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
