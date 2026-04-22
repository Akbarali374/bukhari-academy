import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getExamsByStudent } from '@/lib/data'

const SEEN_KEY = 'bukhari_seen_exams'

export function useUnreadExams() {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user?.id) return

    const check = async () => {
      const exams = await getExamsByStudent(user.id)
      const seen: string[] = JSON.parse(localStorage.getItem(SEEN_KEY) || '[]')
      const unseen = exams.filter(e => !seen.includes(e.id))
      setUnreadCount(unseen.length)
    }

    check()
    const interval = setInterval(check, 10000) // har 10 soniyada tekshir
    return () => clearInterval(interval)
  }, [user?.id])

  const markAllSeen = async () => {
    if (!user?.id) return
    const exams = await getExamsByStudent(user.id)
    const ids = exams.map(e => e.id)
    localStorage.setItem(SEEN_KEY, JSON.stringify(ids))
    setUnreadCount(0)
  }

  return { unreadCount, markAllSeen }
}