import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { globalDb } from '@/lib/globalDb'
import type { Attendance } from '@/types'
import { Calendar, CheckCircle, XCircle } from 'lucide-react'

export default function StudentAttendance() {
  const { user } = useAuth()
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.profile.id) {
      loadAttendance()
    }
  }, [user])

  async function loadAttendance() {
    if (!user?.profile.id) return
    
    setLoading(true)
    const data = await globalDb.getAttendanceByStudent(user.profile.id)
    setAttendance(data)
    setLoading(false)
  }

  // Statistika
  const totalDays = attendance.length
  const presentDays = attendance.filter(a => a.status === 'keldi').length
  const absentDays = attendance.filter(a => a.status === 'kelmadi').length
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Davomat
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Sizning davomat ma'lumotlaringiz
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : (
        <>
          {/* Statistika */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Jami kunlar</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalDays}</p>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/40">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Kelgan</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{presentDays}</p>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/40">
                  <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Kelmagan</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{absentDays}</p>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/40">
                  <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Foiz</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{attendancePercentage}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Davomat ro'yxati */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Davomat tarixi
            </h2>

            {attendance.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  Hali davomat ma'lumotlari yo'q
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {attendance.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                      item.status === 'keldi'
                        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                        : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.status === 'keldi' ? (
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {new Date(item.date).toLocaleDateString('uz-UZ', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(item.date).toLocaleDateString('uz-UZ', { weekday: 'long' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          item.status === 'keldi'
                            ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                            : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                        }`}
                      >
                        {item.status === 'keldi' ? 'Keldi' : 'Kelmadi'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
