import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Send, Search, Check, CheckCheck, Circle,
  MoreHorizontal, Smile, Paperclip, ArrowLeft,
  MessageSquare, Clock, X, Reply, Edit3, Trash2, UserPlus, Maximize2, Minimize2
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../hooks/useSocket'
import api from '../services/api'
import Avatar from '../components/ui/Avatar'
import { timeAgo } from '../utils/helpers'
import toast from 'react-hot-toast'

// ─── Sidebar Chat Item ────────────────────────────────────────────────────────
function ChatItem({ chat, active, onClick, currentUserId }) {
  const other = chat.participants?.find(p => p._id !== currentUserId)
  const name = chat.type === 'group' ? chat.group?.name : other?.name
  const avatar = chat.type === 'group' ? chat.group?.avatar : other?.avatar
  const lastMsg = chat.lastMessage

  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 transition-all text-left ${
        active ? 'bg-accent/10 border-r-2 border-accent' : 'hover:bg-surface-2'
      }`}>
      <div className="relative flex-shrink-0">
        <Avatar name={name} src={avatar} size="md" />
        {other?.isOnline && (
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green border-2 border-surface-0" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-sm font-medium text-text-primary truncate">{name}</span>
          {lastMsg && <span className="text-[10px] text-text-faint flex-shrink-0">{timeAgo(lastMsg.createdAt)}</span>}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-text-muted truncate">
            {lastMsg?.isDeleted ? <em>Message deleted</em> : lastMsg?.content || 'No messages yet'}
          </p>
          {chat.unreadCount > 0 && (
            <span className="flex-shrink-0 w-4 h-4 rounded-full bg-accent text-white text-[10px] flex items-center justify-center font-bold">
              {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

// ─── Single Message Bubble ────────────────────────────────────────────────────
function MessageBubble({ msg, isMe, onReply, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const REACTIONS = ['❤️', '👍', '😂', '🔥', '👏', '😮']

  return (
    <div className={`group flex gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
      {!isMe && <Avatar name={msg.sender?.name} src={msg.sender?.avatar} size="sm" className="flex-shrink-0 mt-1" />}
      <div className={`max-w-[68%] flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
        {/* Reply preview */}
        {msg.replyTo && (
          <div className={`text-[11px] px-2.5 py-1 rounded-lg border-l-2 border-accent bg-surface-3 text-text-muted max-w-full truncate`}>
            ↩ {msg.replyTo.sender?.name}: {msg.replyTo.content}
          </div>
        )}

        <div className="flex items-end gap-1.5">
          {isMe && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mb-1">
              <button onClick={() => onEdit(msg)} className="p-1 hover:bg-surface-3 rounded text-text-faint hover:text-text-primary">
                <Edit3 size={11} />
              </button>
              <button onClick={() => onDelete(msg._id)} className="p-1 hover:bg-surface-3 rounded text-text-faint hover:text-red-text">
                <Trash2 size={11} />
              </button>
            </div>
          )}

          <div className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed relative ${
            isMe
              ? 'bg-accent text-white rounded-tr-sm'
              : 'bg-surface-2 border border-surface-border text-text-primary rounded-tl-sm'
          }`}>
            {msg.isDeleted
              ? <span className="italic opacity-60 text-xs">Message deleted</span>
              : msg.content
            }
            {msg.isEdited && !msg.isDeleted && (
              <span className="text-[10px] opacity-60 ml-1">(edited)</span>
            )}
          </div>

          {!isMe && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mb-1">
              <button onClick={() => onReply(msg)} className="p-1 hover:bg-surface-3 rounded text-text-faint hover:text-text-primary">
                <Reply size={11} />
              </button>
            </div>
          )}
        </div>

        {/* Reactions */}
        {msg.reactions?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {Object.entries(
              msg.reactions.reduce((acc, r) => {
                acc[r.emoji] = (acc[r.emoji] || 0) + 1
                return acc
              }, {})
            ).map(([emoji, count]) => (
              <span key={emoji} className="text-xs bg-surface-3 border border-surface-border rounded-full px-1.5 py-0.5">
                {emoji} {count}
              </span>
            ))}
          </div>
        )}

        <div className={`flex items-center gap-1 text-[10px] text-text-faint ${isMe ? 'flex-row-reverse' : ''}`}>
          <span>{timeAgo(msg.createdAt)}</span>
          {isMe && (
            msg.readBy?.length > 1
              ? <CheckCheck size={11} className="text-accent" />
              : msg.deliveredTo?.length > 1
                ? <CheckCheck size={11} />
                : <Check size={11} />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────
function TypingIndicator({ typers }) {
  if (!typers.length) return null
  return (
    <div className="flex items-center gap-2 px-4 py-1">
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-xs text-text-muted">{typers[0].user?.name} is typing…</span>
    </div>
  )
}

// ─── Message Request Banner ───────────────────────────────────────────────────
function RequestBanner({ request, chatId, onAccept, onReject }) {
  const [loading, setLoading] = useState(false)
  const handle = async (action) => {
    setLoading(true)
    try {
      await api.put(`/chats/requests/${request._id}`, { action })
      action === 'accept' ? onAccept() : onReject()
    } catch { toast.error('Failed') } finally { setLoading(false) }
  }

  return (
    <div className="bg-surface-2 border border-surface-border rounded-xl p-4 mx-4 my-3 text-center">
      <p className="text-sm text-text-secondary mb-1">
        <strong className="text-text-primary">{request.sender?.name}</strong> wants to message you
      </p>
      {request.initialMessage && (
        <p className="text-xs text-text-muted italic mb-3">"{request.initialMessage}"</p>
      )}
      <div className="flex gap-2 justify-center">
        <button onClick={() => handle('accept')} disabled={loading} className="btn btn-primary btn-sm">Accept</button>
        <button onClick={() => handle('reject')} disabled={loading} className="btn btn-secondary btn-sm">Reject</button>
        <button onClick={() => handle('ignore')} disabled={loading} className="btn btn-ghost btn-sm">Ignore</button>
      </div>
    </div>
  )
}

// ─── Main Messages Page ────────────────────────────────────────────────────────
export default function Messages() {
  const { chatId: routeChatId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { socket } = useSocket()

  const [chats, setChats] = useState([])
  const [activeChatId, setActiveChatId] = useState(routeChatId || null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [typers, setTypers] = useState([])
  const [replyTo, setReplyTo] = useState(null)
  const [editMsg, setEditMsg] = useState(null)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [requests, setRequests] = useState([])
  const [showRequests, setShowRequests] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState(new Set())
  const [isFullscreen, setIsFullscreen] = useState(false)
  const messagesEndRef = useRef(null)
  const typingTimer = useRef(null)
  const inputRef = useRef(null)

  const activeChat = chats.find(c => c._id === activeChatId)
  const otherUser = activeChat?.participants?.find(p => p._id !== user?._id)

  // Load chats
  const loadChats = useCallback(async () => {
    try {
      const { data } = await api.get('/chats')
      setChats(data.data || [])
    } catch {}
  }, [])

  // Load message requests
  const loadRequests = useCallback(async () => {
    try {
      const { data } = await api.get('/chats/requests')
      setRequests(data.data || [])
    } catch {}
  }, [])

  useEffect(() => {
    if (user) { loadChats(); loadRequests() }
  }, [user, loadChats, loadRequests])

  // Load messages for active chat
  useEffect(() => {
    if (!activeChatId) return
    setLoadingMsgs(true)
    setMessages([])
    api.get(`/chats/${activeChatId}/messages`)
      .then(r => setMessages(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoadingMsgs(false))
  }, [activeChatId])

  // Socket events
  useEffect(() => {
    if (!socket || !user) return

    socket.on('message:new', (msg) => {
      if (msg.chat === activeChatId) {
        setMessages(prev => [...prev, msg])
        socket.emit('message:read', { chatId: msg.chat, messageIds: [msg._id] })
      }
      loadChats()
    })

    socket.on('message:edited', ({ messageId, content }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, content, isEdited: true } : m))
    })

    socket.on('message:deleted', ({ messageId, deleteFor }) => {
      if (deleteFor === 'everyone') {
        setMessages(prev => prev.map(m => m._id === messageId ? { ...m, isDeleted: true, content: '' } : m))
      } else {
        setMessages(prev => prev.filter(m => m._id !== messageId))
      }
    })

    socket.on('message:read_receipt', ({ messageIds, readerId }) => {
      setMessages(prev => prev.map(m =>
        messageIds.includes(m._id) ? { ...m, readBy: [...(m.readBy || []), readerId] } : m
      ))
    })

    socket.on('message:reaction', ({ messageId, reactions }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, reactions } : m))
    })

    socket.on('typing:start', ({ chatId, userId, user: typingUser }) => {
      if (chatId === activeChatId && userId !== user._id) {
        setTypers(prev => [...prev.filter(t => t.userId !== userId), { userId, user: typingUser }])
      }
    })

    socket.on('typing:stop', ({ chatId, userId }) => {
      if (chatId === activeChatId) {
        setTypers(prev => prev.filter(t => t.userId !== userId))
      }
    })

    socket.on('notification:new', (notif) => {
      if (notif.type === 'message_request') {
        loadRequests()
      }
    })

    socket.on('user:online', ({ userId }) => setOnlineUsers(prev => new Set([...prev, userId])))
    socket.on('user:offline', ({ userId }) => setOnlineUsers(prev => { const s = new Set(prev); s.delete(userId); return s }))

    return () => {
      socket.off('message:new')
      socket.off('message:edited')
      socket.off('message:deleted')
      socket.off('message:read_receipt')
      socket.off('message:reaction')
      socket.off('typing:start')
      socket.off('typing:stop')
      socket.off('notification:new')
      socket.off('user:online')
      socket.off('user:offline')
    }
  }, [socket, activeChatId, user, loadRequests])

  // Join active chat room
  useEffect(() => {
    if (socket && activeChatId) socket.emit('chat:join', { chatId: activeChatId })
  }, [socket, activeChatId])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typers])

  const handleTyping = () => {
    if (!socket || !activeChatId) return
    socket.emit('typing:start', { chatId: activeChatId })
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      socket.emit('typing:stop', { chatId: activeChatId })
    }, 1500)
  }

  const sendMessage = async (e) => {
    e?.preventDefault()
    const content = editMsg ? editMsg.newContent : input.trim()
    if (!content || !activeChatId) return

    if (editMsg) {
      socket?.emit('message:edit', { messageId: editMsg._id, content }, () => {})
      setEditMsg(null)
      return
    }

    socket?.emit('message:send', {
      chatId: activeChatId,
      content,
      replyTo: replyTo?._id || null,
      tempId: Date.now().toString(),
    }, (res) => {
      if (res?.error) toast.error(res.error)
    })
    setInput('')
    setReplyTo(null)
    socket?.emit('typing:stop', { chatId: activeChatId })
  }

  const handleDelete = (messageId) => {
    socket?.emit('message:delete', { messageId, deleteFor: 'everyone' })
  }

  const selectChat = (chatId) => {
    setActiveChatId(chatId)
    navigate(`/messages/${chatId}`, { replace: true })
    setTypers([])
    setReplyTo(null)
    setEditMsg(null)
  }

  const isOtherOnline = otherUser && onlineUsers.has(otherUser._id)

  if (!user) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <MessageSquare size={40} className="text-text-faint mx-auto mb-3" />
        <p className="text-text-muted text-sm mb-4">Login to access messages</p>
        <Link to="/login" className="btn btn-primary">Login</Link>
      </div>
    </div>
  )

  // Fullscreen chat view
  if (isFullscreen && activeChatId) {
    return (
      <div className="fixed inset-0 z-50 bg-surface-0 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-border bg-surface-0">
          <button className="sm:hidden btn btn-ghost p-1" onClick={() => setIsFullscreen(false)}>
            <ArrowLeft size={16} />
          </button>
          {otherUser && (
            <div className="relative flex-shrink-0">
              <Avatar name={otherUser.name} src={otherUser.avatar} size="md" />
              {isOtherOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green border-2 border-surface-0" />
              )}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-text-primary">{otherUser?.name || 'Chat'}</p>
            <p className="text-xs text-text-muted">
              {isOtherOnline ? 'Online' : otherUser?.lastSeen ? `Last seen ${timeAgo(otherUser.lastSeen)}` : 'Offline'}
            </p>
          </div>
          <Link to={`/developers/${otherUser?.username}`} className="btn btn-ghost btn-sm hidden sm:inline-flex">
            View Profile
          </Link>
          <button
            onClick={() => setIsFullscreen(false)}
            className="btn btn-ghost p-2"
            title="Exit fullscreen"
          >
            <Minimize2 size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-thin">
          {loadingMsgs ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {messages.map(msg => (
                <MessageBubble
                  key={msg._id}
                  msg={msg}
                  isMe={msg.sender?._id === user._id}
                  onReply={setReplyTo}
                  onEdit={(m) => setEditMsg({ ...m, newContent: m.content })}
                  onDelete={handleDelete}
                />
              ))}
              <TypingIndicator typers={typers} />
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Reply / Edit banner */}
        {(replyTo || editMsg) && (
          <div className="border-t border-surface-border px-4 py-2 flex items-center gap-2 bg-surface-1">
            <div className="flex-1 min-w-0">
              {replyTo && (
                <p className="text-xs text-text-muted truncate">
                  <Reply size={11} className="inline mr-1" />
                  Replying to <strong>{replyTo.sender?.name}</strong>: {replyTo.content}
                </p>
              )}
              {editMsg && (
                <p className="text-xs text-text-muted">
                  <Edit3 size={11} className="inline mr-1" />
                  Editing message
                </p>
              )}
            </div>
            <button onClick={() => { setReplyTo(null); setEditMsg(null) }}
              className="text-text-faint hover:text-text-primary p-1">
              <X size={13} />
            </button>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-surface-border p-3 bg-surface-0">
          <form onSubmit={sendMessage} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={editMsg ? editMsg.newContent : input}
              onChange={e => {
                editMsg
                  ? setEditMsg(prev => ({ ...prev, newContent: e.target.value }))
                  : setInput(e.target.value)
                handleTyping()
              }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              placeholder="Type a message…"
              className="input flex-1 text-sm py-2"
            />
            <button type="submit"
              disabled={!(editMsg ? editMsg.newContent.trim() : input.trim())}
              className="btn btn-primary p-2.5 flex-shrink-0 disabled:opacity-40">
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4">
      <div className="card flex overflow-hidden" style={{ height: 'calc(100vh - 120px)', minHeight: '500px' }}>
        {/* ── Sidebar ── */}
        <div className={`flex flex-col border-r border-surface-border bg-surface-0 ${activeChatId ? 'hidden sm:flex w-72 flex-shrink-0' : 'flex w-full sm:w-72 sm:flex-shrink-0'}`}>
          {/* Sidebar header */}
          <div className="p-4 border-b border-surface-border flex items-center justify-between">
            <h2 className="font-display font-bold text-text-primary">Messages</h2>
            {requests.length > 0 && (
              <button onClick={() => setShowRequests(s => !s)}
                className="flex items-center gap-1.5 text-xs text-accent hover:underline">
                <UserPlus size={13} /> {requests.length} requests
              </button>
            )}
          </div>

          {/* Requests panel */}
          {showRequests && requests.length > 0 && (
            <div className="border-b border-surface-border divide-y divide-surface-border">
              {requests.map(req => (
                <div key={req._id} className="p-3 flex items-center gap-2.5">
                  <Avatar name={req.sender?.name} src={req.sender?.avatar} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text-primary truncate">{req.sender?.name}</p>
                    {req.initialMessage && <p className="text-[10px] text-text-muted truncate italic">"{req.initialMessage}"</p>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={async () => {
                      try {
                        const { data } = await api.put(`/chats/requests/${req._id}`, { action: 'accept' })
                        setRequests(prev => prev.filter(r => r._id !== req._id))
                        await loadChats()
                        if (data.data?._id) selectChat(data.data._id)
                        toast.success('Request accepted!')
                      } catch { toast.error('Failed') }
                    }} className="btn btn-primary btn-sm py-0.5 text-xs">Accept</button>
                    <button onClick={async () => {
                      await api.put(`/chats/requests/${req._id}`, { action: 'reject' })
                      setRequests(prev => prev.filter(r => r._id !== req._id))
                    }} className="btn btn-ghost btn-sm py-0.5 text-xs text-text-muted">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Chat list */}
          <div className="flex-1 overflow-y-auto">
            {chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <MessageSquare size={28} className="text-text-faint mb-2" />
                <p className="text-xs text-text-muted">No conversations yet.<br />Visit a developer profile to start chatting.</p>
              </div>
            ) : (
              chats.map(chat => (
                <ChatItem key={chat._id} chat={chat}
                  active={chat._id === activeChatId}
                  onClick={() => selectChat(chat._id)}
                  currentUserId={user._id} />
              ))
            )}
          </div>
        </div>

        {/* ── Chat Panel ── */}
        {activeChatId ? (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-border bg-surface-0">
              <button className="sm:hidden btn btn-ghost p-1" onClick={() => { setActiveChatId(null); navigate('/messages') }}>
                <ArrowLeft size={16} />
              </button>
              {otherUser && (
                <div className="relative flex-shrink-0">
                  <Avatar name={otherUser.name} src={otherUser.avatar} size="md" />
                  {isOtherOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green border-2 border-surface-0" />
                  )}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-text-primary">{otherUser?.name || 'Group Chat'}</p>
                <p className="text-xs text-text-muted">
                  {isOtherOnline ? 'Online' : otherUser?.lastSeen ? `Last seen ${timeAgo(otherUser.lastSeen)}` : 'Offline'}
                </p>
              </div>
              <Link to={`/developers/${otherUser?.username}`} className="btn btn-ghost btn-sm hidden sm:inline-flex">
                View Profile
              </Link>
              <button
                onClick={() => setIsFullscreen(true)}
                className="btn btn-ghost btn-sm p-2"
                title="Open fullscreen"
              >
                <Maximize2 size={14} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-thin">
              {loadingMsgs ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {messages.map(msg => (
                    <MessageBubble
                      key={msg._id}
                      msg={msg}
                      isMe={msg.sender?._id === user._id}
                      onReply={setReplyTo}
                      onEdit={(m) => setEditMsg({ ...m, newContent: m.content })}
                      onDelete={handleDelete}
                    />
                  ))}
                  <TypingIndicator typers={typers} />
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Reply / Edit banner */}
            {(replyTo || editMsg) && (
              <div className="border-t border-surface-border px-4 py-2 flex items-center gap-2 bg-surface-1">
                <div className="flex-1 min-w-0">
                  {replyTo && (
                    <p className="text-xs text-text-muted truncate">
                      <Reply size={11} className="inline mr-1" />
                      Replying to <strong>{replyTo.sender?.name}</strong>: {replyTo.content}
                    </p>
                  )}
                  {editMsg && (
                    <p className="text-xs text-text-muted">
                      <Edit3 size={11} className="inline mr-1" />
                      Editing message
                    </p>
                  )}
                </div>
                <button onClick={() => { setReplyTo(null); setEditMsg(null) }}
                  className="text-text-faint hover:text-text-primary p-1">
                  <X size={13} />
                </button>
              </div>
            )}

            {/* Input */}
            <div className="border-t border-surface-border p-3 bg-surface-0">
              <form onSubmit={sendMessage} className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={editMsg ? editMsg.newContent : input}
                  onChange={e => {
                    editMsg
                      ? setEditMsg(prev => ({ ...prev, newContent: e.target.value }))
                      : setInput(e.target.value)
                    handleTyping()
                  }}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                  placeholder="Type a message…"
                  className="input flex-1 text-sm py-2"
                />
                <button type="submit"
                  disabled={!(editMsg ? editMsg.newContent.trim() : input.trim())}
                  className="btn btn-primary p-2.5 flex-shrink-0 disabled:opacity-40">
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="hidden sm:flex flex-1 items-center justify-center text-center p-8 flex-col gap-3">
            <MessageSquare size={40} className="text-text-faint" />
            <p className="text-text-secondary text-sm">Select a conversation to start messaging</p>
            <Link to="/developers" className="btn btn-secondary btn-sm">Browse Developers</Link>
          </div>
        )}
      </div>
    </div>
  )
}