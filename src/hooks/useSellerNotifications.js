import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getAllNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  deleteNotification,
} from '../services/sellerService'

export function useSellerNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    try {
      setLoading(true)
      const data = await getAllNotifications(user.id)
      setNotifications(data)
    } catch (err) {
      console.warn('[notifications] load failed:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    load()
    // Refresh every 30s in the background
    const t = setInterval(() => {
      load()
    }, 30000)
    return () => clearInterval(t)
  }, [load])

  const unreadCount = notifications.filter(
    (n) => !n.read && !n.derived
  ).length

  async function markAllRead() {
    if (!user) return
    try {
      await markAllNotificationsRead(user.id)
      await load()
    } catch (err) {
      console.warn(err)
    }
  }

  async function markRead(id) {
    if (!user) return
    try {
      await markNotificationRead(user.id, id)
      await load()
    } catch (err) {
      console.warn(err)
    }
  }

  async function remove(id) {
    if (!user) return
    try {
      await deleteNotification(user.id, id)
      await load()
    } catch (err) {
      console.warn(err)
    }
  }

  return {
    notifications,
    loading,
    unreadCount,
    reload: load,
    markAllRead,
    markRead,
    remove,
  }
}