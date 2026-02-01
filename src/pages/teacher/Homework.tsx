import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getStudentsByGroup, createHomework, getHomeworkByStudent } from '@/lib/data'
import { useAuth } from '@/context/AuthContext'
import type { Profile, Homework } from '@/types'
import { BookOpen, Plus, Calendar, User, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TeacherHomework() {
  const { groupId } = useParams<{ groupId: string }>()
  const { user } = useAuth()
  const [students, setStudents] = useState<Profile[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Profile | null>(null)
  const [studentHomework, setStudentHomework] = useState<Homework[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!groupId) return
    getStudentsByGroup(groupId).then(setStudents).finally(() => setLoading(false))
  }, [groupId])

  useEffect(() => {
    if (!selectedStudent) return
    getHomeworkByStudent(selectedStudent.id).then(setStudentHomework)
  }, [selectedStudent])

  const handleCreateHomework = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent || !user?.id) return

    setSubmitting(true)
    try {
      await createHomework(selectedStudent.id, user.id, title.trim(), description.trim(), dueDate)
      toast.success('Uyga vazifa berildi')
      setModal(false)
      setTitle('')
      setDescription('')
      setDueDate('')
      // Refresh homework list
      getHomeworkByStudent(selectedStudent.id).then(setStudentHomework)
    } catch (error) {
      toast.error('Xatolik yuz berdi')
    }
    setSubmitting(false)
  }

  const getStatusIcon = (homework: Homework) => {
    if (homework.is_completed) {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    }
    
    const dueDate = new Date(homework.due_date)
    const now = new Date()
    
    if (dueDate < now) {
      return <AlertCircle className="w-4 h-4 text-red-500" />
    }
    
    return <Clock className="w-4 h-4 text-amber-500" />
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

  // Set default due date to tomorrow
  useEffect(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setDueDate(tomorrow.toISOString().split('T')[0])
  }, [])

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-primary-600 dark:text-primary-400" />
          Uyga vazifalar
        </h1>
        <p className="text-gray-500 dark:text-gray-400">O'quvchilarga uyga vazifa bering va holatini kuzating</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Students List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">O'quvchilar</h2>
            </div>
            <div className="p-2">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent" />
                </div>
              ) : (
                <div className="space-y-1">
                  {students.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => setSelectedStudent(student)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedStudent?.id === student.id
                          ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{student.last_name} {student.first_name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Homework Details */}
        <div className="lg:col-span-2">
          {selectedStudent ? (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedStudent.last_name} {selectedStudent.first_name} - Uyga vazifalar
                  </h2>
                  <button
                    onClick={() => setModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Vazifa berish
                  </button>
                </div>

                <div className="space-y-4">
                  {studentHomework.map((homework) => {
                    const status = getStatusText(homework)
                    return (
                      <div key={homework.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">{homework.title}</h3>
                          <div className={`flex items-center gap-1 text-sm ${status.color}`}>
                            {getStatusIcon(homework)}
                            {status.text}
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{homework.description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3 h-3" />
                          Muddat: {new Date(homework.due_date).toLocaleDateString('uz-UZ')}
                        </div>
                      </div>
                    )
                  })}
                  
                  {studentHomework.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Bu o'quvchiga hali vazifa berilmagan
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">O'quvchini tanlang</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Homework Modal */}
      {modal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {selectedStudent.last_name} {selectedStudent.first_name}ga vazifa berish
            </h2>
            <form onSubmit={handleCreateHomework} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Vazifa nomi
                </label>
                <input
                  type="text"
                  placeholder="Masalan: 5-dars mashqlari"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Vazifa tavsifi
                </label>
                <textarea
                  placeholder="Vazifa haqida batafsil ma'lumot..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bajarish muddati
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium disabled:opacity-50"
                >
                  {submitting ? 'Berilmoqda...' : 'Vazifa berish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}