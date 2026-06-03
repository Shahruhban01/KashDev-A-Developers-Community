import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'

let socketInstance = null

export function useSocket() {
  const { token } = useAuth()
  const [connected, setConnected] = useState(false)
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    if (!token) {
      if (socketInstance) { socketInstance.disconnect(); socketInstance = null }
      setSocket(null)
      return
    }

    if (!socketInstance) {
      socketInstance = io(import.meta.env.VITE_API_URL || 'https://kashdev-a-developers-community.onrender.com', {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      })
    }

    socketInstance.on('connect', () => setConnected(true))
    socketInstance.on('disconnect', () => setConnected(false))

    setSocket(socketInstance)

    return () => {
      // Don't disconnect on unmount — keep alive across page navigation
      socketInstance?.off('connect')
      socketInstance?.off('disconnect')
    }
  }, [token])

  return { socket, connected }
}