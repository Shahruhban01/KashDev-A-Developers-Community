import { useState, useRef, useEffect } from 'react'
import { Bell, Check } from 'lucide-react'
import { useNotifications } from '../../hooks/useNotifications'
import { Link } from 'react-router-dom'
import { timeAgo } from '../../utils/helpers'

export default function NotificationBell() {
  const { notifications, unreadCount, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 transition-all">
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-accent rounded-full text-[9px] text-white flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 card border border-surface-border z-50 animate-scale-in overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
            <p className="font-semibold text-sm text-text-primary">Notifications</p>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-accent hover:text-accent-hover transition-colors flex items-center gap-1">
                <Check size={11} /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-surface-border">
            {notifications.length === 0
              ? <div className="px-4 py-8 text-center text-text-muted text-sm">No notifications yet</div>
              : notifications.slice(0, 15).map(n => (
                <Link key={n._id} to={n.link || '#'}
                  onClick={() => setOpen(false)}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-surface-2 transition-all ${!n.isRead ? 'bg-accent-subtle/30' : ''}`}>
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.isRead ? 'transparent' : 'var(--color-accent)' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text-primary leading-snug">{n.title}</p>
                    {n.body && <p className="text-xs text-text-muted mt-0.5 truncate">{n.body}</p>}
                    <p className="text-[10px] text-text-faint mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                </Link>
              ))
            }
          </div>
        </div>
      )}
    </div>
  )
}

