import { useEffect, useState } from 'react'
import { globalDb } from '@/lib/globalDb'
import type { Homework, Profile } from '@/types'
import { BookOpen } from 'lucide-react'

export default function TeacherAllHomework() {
  const [homework, setHomework] = useState<Homework[]>([])
  const [students, setStudents] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const db = await globalDb.loadDatabase()
    setHomework(db.homework)
    setStudents(db.profiles.filter(p => p.role === 'student'))
    setLoading(false)
  }

  function getStudentName(studentId: string): string {
    const student = students.find(s => s.id === studentId)
    return student ? `${student.last_name} ${student.first_name}` : 'Noma\'lum'
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Uyga Vazifalar</h1>
      </div>

      <div className="space-y-4">
        {homework.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">Uyga vazifalar yo'q</p>
          </div>
        ) : (
          homework.map((hw) => (
            <div
              key={hw.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {hw.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">{hw.description}</p>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      O'quvchi: <span className="font-medium">{getStudentName(hw.student_id)}</span>
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      Muddat: <span className="font-medium">{new Date(hw.due_date).toLocaleDateString('uz-UZ')}</span>
                    </span>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                    hw.status === 'completed'
                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                      : hw.status === 'pending'
                      ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                      : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                  }`}
                >
                  {hw.status === 'completed' ? 'Bajarildi' : hw.status === 'pending' ? 'Kutilmoqda' : 'Kech qoldi'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
