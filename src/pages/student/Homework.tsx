import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getHomeworkByStudent, updateHomeworkStatus } from '@/lib/data'
import type { Homework } from '@/types'
import { BookOpen, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function StudentHomework() {
  const { user } = useAuth()
  const [homework, setHomework] = useState<Homework[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    getHomeworkByStudent(user.id).then(setHomework).finally(() => setLoading(false))
  }, [user?.id])

  const handleToggleComplete = async (homeworkId: string, currentStatus: boolean) => {
    try {
      const updated = await updateHomeworkStatus(homeworkId, !currentStatus)
      setHomework(prev => prev.map(h => h.id === homeworkId ? updated : h))
      toast.success(!currentStatus ? 'Vazifa bajarildi deb belgilandi' : 'Vazifa bajarilmagan deb belgilandi')
    } catch (error) {
      toast.error('Xatolik yuz berdi')
    }
  }

  const getStatusIcon = (homework: Homework) => {
    if (homework.is_completed) {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    }
    
    const dueDate = new Date(homework.due_date)
    const now = new Date()
    
    if (dueDate < now) {
      return <AlertCircle className="w-5 h-5 text-red-500" />
    }
    
    return <Clock className="w-5 h-5 text-amber-500" />
  }

  const getStatusText = (homework: Homework) => {
    if (homework.is_completed) {
      return { text: 'Bajarilgan', color: 'text-green-600 dark:text-green-400' }
    }
    
    const dueDate = new Date(homework.due_date)
    const now = new Date()
    
    if (dueDate < now) {
      return { text: 'Muddati o\'tgan', color: 'text-red-600 dark:text-red-400' }
    }
    
    return { text: 'Kutilmoqda', color: 'text-amber-600 dark:text-amber-400' }
  }

  const completedCount = homework.filter(h => h.is_completed).length
  const pendingCount = homework.filter(h => !h.is_completed).length
  const overdueCount = homework.filter(h => !h.is_completed && new Date(h.due_date) < new Date()).length

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-primary-600 dark:text-primary-400" />
          Uyga vazifalar
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Ustoz tomonidan berilgan vazifalar</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/40">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Bajarilgan</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{completedCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Kutilmoqda</p>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{pendingCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/40">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Muddati o'tgan</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">{overdueCount}</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-4">
          {homework.map((item) => {
            const status = getStatusText(item)
            return (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-3 whitespace-pre-wrap">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        Muddat: {new Date(item.due_date).toLocaleDateString('uz-UZ')}
                      </div>
                      <div className={`flex items-center gap-2 ${status.color}`}>
                        {getStatusIcon(item)}
                        {status.text}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleComplete(item.id, item.is_completed)}
                    className={`ml-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      item.is_completed
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        : 'bg-primary-600 hover:bg-primary-700 text-white'
                    }`}
                  >
                    {item.is_completed ? 'Bekor qilish' : 'Bajarildi'}
                  </button>
                </div>
              </div>
            )
          })}
          
          {homework.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">Hali uyga vazifalar yo'q</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Ustoz vazifa berganda bu yerda ko'rishingiz mumkin</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}