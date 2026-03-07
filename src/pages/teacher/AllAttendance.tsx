import { useEffect, useState } from 'react'
import { globalDb } from '@/lib/globalDb'
import type { Profile, Attendance } from '@/types'
import { Calendar, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TeacherAllAttendance() {
  const [students, setStudents] = useState<Profile[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [selectedDate])

  async function loadData() {
    setLoading(true)
    const db = await globalDb.loadDatabase()
    const allStudents = db.profiles.filter(p => p.role === 'student')
    const todayAttendance = db.attendance.filter(a => a.date === selectedDate)
    
    setStudents(allStudents)
    setAttendance(todayAttendance)
    setLoading(false)
  }

  async function markAttendance(studentId: string, status: 'keldi' | 'kelmadi') {
    setSaving(true)
    try {
      const teacherId = localStorage.getItem('userId') || ''
      await globalDb.markAttendance(studentId, teacherId, selectedDate, status)
      await loadData()
      toast.success('Davomat belgilandi')
    } catch (error) {
      toast.error('Xatolik yuz berdi')
    }
    setSaving(false)
  }

  function getStudentStatus(studentId: string): 'keldi' | 'kelmadi' | null {
    const record = attendance.find(a => a.student_id === studentId)
    return record ? record.status : null
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Davomat</h1>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">O'quvchi</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Holat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {students.map((student) => {
                const status = getStudentStatus(student.id)
                return (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                      {student.last_name} {student.first_name}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => markAttendance(student.id, 'keldi')}
                          disabled={saving}
                          className={`p-2 rounded-lg transition-colors ${
                            status === 'keldi'
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-green-100 dark:hover:bg-green-900'
                          }`}
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => markAttendance(student.id, 'kelmadi')}
                          disabled={saving}
                          className={`p-2 rounded-lg transition-colors ${
                            status === 'kelmadi'
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900'
                          }`}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
          {students.map((student) => {
            const status = getStudentStatus(student.id)
            return (
              <div key={student.id} className="p-4">
                <p className="text-gray-900 dark:text-white font-medium mb-3">
                  {student.last_name} {student.first_name}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => markAttendance(student.id, 'keldi')}
                    disabled={saving}
                    className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      status === 'keldi'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <Check className="w-5 h-5" />
                    Keldi
                  </button>
                  <button
                    onClick={() => markAttendance(student.id, 'kelmadi')}
                    disabled={saving}
                    className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      status === 'kelmadi'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <X className="w-5 h-5" />
                    Kelmadi
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {students.length === 0 && (
          <p className="text-center py-8 text-gray-500 dark:text-gray-400">O'quvchilar yo'q</p>
        )}
      </div>
    </div>
  )
}
