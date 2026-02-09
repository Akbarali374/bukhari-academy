import { useState, useEffect } from 'react'
import { getNews } from '@/lib/data'

export function useUnreadNews() {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadUnreadCount()
    
    // Har 10 soniyada yangilanish
    const interval = setInterval(loadUnreadCount, 10000)
    
    return () => clearInterval(interval)
  }, [])

  async function loadUnreadCount() {
    try {
      const news = await getNews()
      const readNewsIds = getReadNewsIds()
      const unread = news.filter(n => !readNewsIds.includes(n.id))
      setUnreadCount(unread.length)
    } catch (error) {
      console.error('Yangiliklar sonini yuklashda xato:', error)
    }
  }

  function getReadNewsIds(): string[] {
    try {
      const stored = localStorage.getItem('bukhari_read_news')
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      return []
    }
  }

  function markAsRead(newsId: string) {
    try {
      const readIds = getReadNewsIds()
      if (!readIds.includes(newsId)) {
        readIds.push(newsId)
        localStorage.setItem('bukhari_read_news', JSON.stringify(readIds))
        loadUnreadCount()
      }
    } catch (error) {
      console.error('Yangilikni o\'qilgan deb belgilashda xato:', error)
    }
  }

  function markAllAsRead(newsIds: string[]) {
    try {
      const readIds = getReadNewsIds()
      const newReadIds = [...new Set([...readIds, ...newsIds])]
      localStorage.setItem('bukhari_read_news', JSON.stringify(newReadIds))
      loadUnreadCount()
    } catch (error) {
      console.error('Barcha yangilikni o\'qilgan deb belgilashda xato:', error)
    }
  }

  return {
    unreadCount,
    markAsRead,
    markAllAsRead,
    refresh: loadUnreadCount
  }
}
