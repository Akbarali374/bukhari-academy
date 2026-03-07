import { useEffect, useState } from 'react'
import { globalDb } from '@/lib/globalDb'
import type { Profile } from '@/types'
import { GraduationCap } from 'lucide-react'

export default function TeacherAllStudents() {
  const [students, setStudents] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStudents()
  }, [])

  async function loadStudents() {
    setLoading(true)
    const db = await globalDb.loadDatabase()
    const allStudents = db.profiles.filter(p => p.role === 'student')
    setStudents(allStudents)
    setLoading(false)
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
        <GraduationCap className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Barcha O'quvchilar</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">F.I.O</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3 text-gray-900 dark:text-white">
                    {student.last_name} {student.first_name}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{student.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
          {students.map((student) => (
            <div key={student.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30">
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">F.I.O</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {student.last_name} {student.first_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-gray-600 dark:text-gray-300">{student.email}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {students.length === 0 && (
          <p className="text-center py-8 text-gray-500 dark:text-gray-400">O'quvchilar yo'q</p>
        )}
      </div>
    </div>
  )
}
