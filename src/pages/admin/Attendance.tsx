import { useEffect, useState } from 'react'
import { globalDb } from '@/lib/globalDb'
import type { Profile, Attendance } from '@/types'
import { Calendar, X } from 'lucide-react'

export default function AdminAttendance() {
  const [students, setStudents] = useState<Profile[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))

  useEffect(() => {
    loadData()
  }, [selectedMonth])

  async function loadData() {
    setLoading(true)
    const db = await globalDb.loadDatabase()
    const allStudents = db.profiles.filter(p => p.role === 'student')
    
    // Faqat tanlangan oyning davomatlarini olish
    const monthAttendance = db.attendance.filter(a => a.date.startsWith(selectedMonth))
    
    setStudents(allStudents)
    setAttendance(monthAttendance)
    setLoading(false)
  }

  // O'quvchining kelmagan kunlarini olish
  function getAbsentDates(studentId: string): string[] {
    return attendance
      .filter(a => a.student_id === studentId && a.status === 'kelmadi')
      .map(a => a.date)
      .sort()
  }

  // O'quvchining kelgan kunlarini olish
  function getPresentDates(studentId: string): string[] {
    return attendance
      .filter(a => a.student_id === studentId && a.status === 'keldi')
      .map(a => a.date)
      .sort()
  }

  // Statistika
  function getStats(studentId: string) {
    const present = getPresentDates(studentId).length
    const absent = getAbsentDates(studentId).length
    const total = present + absent
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0
    
    return { present, absent, total, percentage }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Davomat Hisoboti</h1>
        </div>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div className="space-y-4">
        {students.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">O'quvchilar yo'q</p>
          </div>
        ) : (
          students.map((student) => {
            const absentDates = getAbsentDates(student.id)
            const stats = getStats(student.id)
            
            return (
              <div
                key={student.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {student.last_name} {student.first_name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{student.email}</p>
                    
                    {/* Statistika */}
                    <div className="flex flex-wrap gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Jami:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{stats.total} kun</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-green-600 dark:text-green-400">Keldi:</span>
                        <span className="font-semibold text-green-700 dark:text-green-300">{stats.present} kun</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-red-600 dark:text-red-400">Kelmadi:</span>
                        <span className="font-semibold text-red-700 dark:text-red-300">{stats.absent} kun</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Foiz:</span>
                        <span className={`font-semibold ${
                          stats.percentage >= 80 
                            ? 'text-green-700 dark:text-green-300' 
                            : stats.percentage >= 60 
                            ? 'text-yellow-700 dark:text-yellow-300' 
                            : 'text-red-700 dark:text-red-300'
                        }`}>
                          {stats.percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Kelmagan kunlar */}
                    {absentDates.length > 0 ? (
                      <div>
                        <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                          <X className="w-4 h-4" />
                          Kelmagan kunlar:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {absentDates.map((date) => (
                            <span
                              key={date}
                              className="px-3 py-1 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-medium"
                            >
                              {new Date(date).toLocaleDateString('uz-UZ', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                        ✅ Barcha kunlarda qatnashgan
                      </p>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="flex flex-col items-center gap-2 min-w-[100px]">
                    <div className="relative w-20 h-20">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="32"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="none"
                          className="text-gray-200 dark:text-gray-700"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="32"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 32}`}
                          strokeDashoffset={`${2 * Math.PI * 32 * (1 - stats.percentage / 100)}`}
                          className={
                            stats.percentage >= 80
                              ? 'text-green-500'
                              : stats.percentage >= 60
                              ? 'text-yellow-500'
                              : 'text-red-500'
                          }
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {stats.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
