import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Users, Settings, LogIn, LogOut, Pin, Hash,
  Send, Image, Smile, MoreHorizontal, Crown, Shield, Lock
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import { useSocket } from '../hooks/useSocket'
import api from '../services/api'
import Avatar from '../components/ui/Avatar'
import { timeAgo } from '../utils/helpers'
import toast from 'react-hot-toast'

function MemberBadge({ role }) {
  if (role === 'admin') return <Crown size={11} className="text-amber" title="Admin" />
  if (role === 'moderator') return <Shield size={11} className="text-accent" title="Moderator" />
  return null
}

function GroupMessage({ msg, currentUserId }) {
  const isMe = msg.sender?._id === currentUserId
  return (
    <div className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
      {!isMe && <Avatar name={msg.sender?.name} src={msg.sender?.avatar} size="sm" className="flex-shrink-0 mt-1" />}
      <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {!isMe && (
          <span className="text-xs text-text-muted px-1">{msg.sender?.name}</span>
        )}
        <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
          isMe
            ? 'bg-accent text-white rounded-tr-sm'
            : 'bg-surface-2 border border-surface-border text-text-primary rounded-tl-sm'
        }`}>
          {msg.isDeleted ? <span className="italic text-text-faint">Message deleted</span> : msg.content}
        </div>
        <span className="text-[10px] text-text-faint px-1">{timeAgo(msg.createdAt)}</span>
      </div>
    </div>
  )
}

export default function GroupDetail() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data, loading, error } = useApi(`/groups/${slug}`)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isMember, setIsMember] = useState(false)
  const [chatId, setChatId] = useState(null)
  const [tab, setTab] = useState('chat') // 'chat' | 'members' | 'about'
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const { socket } = useSocket()

  useEffect(() => {
    if (!data) return
    const { group, members } = data.data
    setChatId(group.chat)
    const memberIds = members.map(m => m.user?._id)
    setIsMember(user ? memberIds.includes(user._id) : false)
  }, [data, user])

  // Load messages when chatId is known
  useEffect(() => {
    if (!chatId || !isMember) return
    api.get(`/chats/${chatId}/messages`).then(r => {
      setMessages(r.data.data || [])
    }).catch(() => {})
  }, [chatId, isMember])

  // Socket: join chat room + listen
  useEffect(() => {
    if (!socket || !chatId || !isMember) return
    socket.emit('chat:join', { chatId })
    socket.on('message:new', (msg) => {
      if (msg.chat === chatId) setMessages(prev => [...prev, msg])
    })
    socket.on('message:edited', ({ messageId, content }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, content, isEdited: true } : m))
    })
    socket.on('message:deleted', ({ messageId }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, isDeleted: true } : m))
    })
    return () => {
      socket.off('message:new')
      socket.off('message:edited')
      socket.off('message:deleted')
    }
  }, [socket, chatId, isMember])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleJoin = async () => {
    if (!user) { navigate('/login'); return }
    try {
      await api.post(`/groups/${data.data.group._id}/join`)
      setIsMember(true)
      toast.success(`Joined ${data.data.group.name}!`)
    } catch (err) { toast.error(err.message) }
  }

  const handleLeave = async () => {
    try {
      await api.post(`/groups/${data.data.group._id}/leave`)
      setIsMember(false)
      toast.success('Left group')
    } catch (err) { toast.error(err.message) }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || !chatId || sending) return
    setSending(true)
    const tempId = Date.now().toString()
    socket?.emit('message:send', { chatId, content: input.trim(), tempId }, (res) => {
      if (res?.error) toast.error(res.error)
    })
    setInput('')
    setSending(false)
  }

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="card h-96 skeleton" />
    </div>
  )

  if (error || !data) return (
    <div className="max-w-6xl mx-auto px-4 py-20 text-center">
      <p className="text-text-muted">Group not found.</p>
      <Link to="/groups" className="btn btn-ghost btn-sm mt-4">← Back to Groups</Link>
    </div>
  )

  const { group, members } = data.data

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="card p-5 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-subtle border border-accent-muted flex items-center justify-center flex-shrink-0">
            <Hash size={22} className="text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-lg text-text-primary">{group.name}</h1>
              {group.type === 'private' && <Lock size={13} className="text-text-muted" />}
            </div>
            <p className="text-xs text-text-muted">{group.memberCount} members · {group.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isMember ? (
            <button onClick={handleLeave} className="btn btn-secondary btn-sm gap-1.5">
              <LogOut size={13} /> Leave
            </button>
          ) : (
            <button onClick={handleJoin} className="btn btn-primary btn-sm gap-1.5">
              <LogIn size={13} /> Join Group
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      {group.description && (
        <p className="text-sm text-text-secondary px-1 mb-4">{group.description}</p>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-surface-border pb-0">
        {['chat', 'members', 'about'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all capitalize ${
              tab === t
                ? 'text-text-primary border-b-2 border-accent -mb-px bg-surface-1'
                : 'text-text-muted hover:text-text-primary'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* Chat Tab */}
      {tab === 'chat' && (
        <div className="card flex flex-col" style={{ height: '60vh' }}>
          {!isMember ? (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <Hash size={32} className="text-text-faint mx-auto mb-3" />
                <p className="text-text-secondary text-sm mb-4">Join this group to see and send messages.</p>
                <button onClick={handleJoin} className="btn btn-primary gap-2">
                  <LogIn size={14} /> Join Group
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-thin">
                {messages.length === 0 && (
                  <div className="flex-1 flex items-center justify-center text-text-faint text-sm">
                    No messages yet. Start the conversation!
                  </div>
                )}
                {messages.map(msg => (
                  <GroupMessage key={msg._id} msg={msg} currentUserId={user?._id} />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-surface-border p-3">
                <form onSubmit={sendMessage} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={`Message #${group.name}…`}
                    className="input flex-1 text-sm"
                  />
                  <button type="submit" disabled={!input.trim() || sending}
                    className="btn btn-primary p-2.5 flex-shrink-0 disabled:opacity-40">
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}

      {/* Members Tab */}
      {tab === 'members' && (
        <div className="card divide-y divide-surface-border">
          {members.map(member => (
            <Link key={member._id} to={`/developers/${member.user?.username}`}
              className="flex items-center gap-3 p-4 hover:bg-surface-2 transition-all">
              <Avatar name={member.user?.name} src={member.user?.avatar} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-text-primary">{member.user?.name}</span>
                  <MemberBadge role={member.role} />
                </div>
                <span className="text-xs text-text-muted">@{member.user?.username}</span>
              </div>
              <span className="text-xs text-text-faint capitalize">{member.role}</span>
            </Link>
          ))}
        </div>
      )}

      {/* About Tab */}
      {tab === 'about' && (
        <div className="card p-6 space-y-4">
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-1">About</p>
            <p className="text-sm text-text-primary">{group.description || 'No description.'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-1">Category</p>
            <p className="text-sm text-text-primary capitalize">{group.category}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-1">Created by</p>
            <Link to={`/developers/${group.createdBy?.username}`}
              className="flex items-center gap-2 mt-1 hover:opacity-80 transition-opacity w-fit">
              <Avatar name={group.createdBy?.name} src={group.createdBy?.avatar} size="sm" />
              <span className="text-sm text-text-primary">{group.createdBy?.name}</span>
            </Link>
          </div>
          {group.tags?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-2">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {group.tags.map(t => <span key={t} className="tag">{t}</span>)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}