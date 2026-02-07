import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getStudentsByGroup, getGroups } from '@/lib/data'
import type { Profile } from '@/types'
import type { Group } from '@/types'
import { ArrowLeft, Award, Users, BookOpen } from 'lucide-react'

export default function TeacherStudents() {
  const { groupId } = useParams<{ groupId: string }>()
  const [students, setStudents] = useState<Profile[]>([])
  const [groupName, setGroupName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!groupId) return
    setLoading(true)
    Promise.all([getStudentsByGroup(groupId), getGroups()]).then(([st, g]) => {
      setStudents(st)
      const found = (g as Group[]).find((x) => x.id === groupId)
      setGroupName(found?.name ?? groupId)
      setLoading(false)
    })
  }, [groupId])

  if (!groupId) return <p className="text-gray-500 dark:text-gray-400">Guruh topilmadi</p>

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Link to="/teacher" className="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline mb-2">
            <ArrowLeft className="w-4 h-4" /> Guruhlar
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{groupName}</h1>
          <p className="text-gray-500 dark:text-gray-400">O'quvchilar ro'yxati</p>
        </div>
        <div className="flex gap-2">
          <Link 
            to={`/teacher/attendance/${groupId}`}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium"
          >
            <Users className="w-5 h-5" />
            Davomat
          </Link>
          <Link 
            to={`/teacher/homework/${groupId}`}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium"
          >
            <BookOpen className="w-5 h-5" />
            Uyga vazifalar
          </Link>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent" /></div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">F.I.O</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Email</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{s.last_name} {s.first_name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{s.email}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          to={`/teacher/add-grade/${s.id}`} 
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-sm font-medium hover:bg-primary-200 dark:hover:bg-primary-800/40"
                        >
                          <Award className="w-4 h-4" /> Baho
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
            {students.map((s) => (
              <div key={s.id} className="p-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">F.I.O</p>
                    <p className="text-gray-900 dark:text-white font-medium">{s.last_name} {s.first_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-gray-600 dark:text-gray-300">{s.email}</p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Link 
                      to={`/teacher/add-grade/${s.id}`} 
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-sm font-medium hover:bg-primary-200 dark:hover:bg-primary-800/40"
                    >
                      <Award className="w-4 h-4" /> Baho qo'shish
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {students.length === 0 && <p className="text-center py-8 text-gray-500 dark:text-gray-400">O'quvchilar yo'q</p>}
        </div>
      )}
    </div>
  )
}
