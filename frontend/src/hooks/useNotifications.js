import { useState, useEffect } from 'react'
import { useSocket } from './useSocket'
import api from '../services/api'

export function useNotifications() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]     = useState(0)

  const load = async () => {
    try {
      const { data } = await api.get('/notifications')
      setNotifications(data.data)
      setUnreadCount(data.unreadCount)
    } catch {}
  }

  useEffect(() => { load() }, [])

  useSocket('notification:new', (n) => {
    setNotifications(prev => [n, ...prev])
    setUnreadCount(c => c + 1)
  })

  useSocket('notification:allRead', () => setUnreadCount(0))

  const markAllRead = async () => {
    await api.put('/notifications/read-all')
    setUnreadCount(0)
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  return { notifications, unreadCount, markAllRead, reload: load }
}