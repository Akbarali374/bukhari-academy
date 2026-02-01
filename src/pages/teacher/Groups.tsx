import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getGroupsByTeacher, getStudents } from '@/lib/data'
import type { Group } from '@/types'
import { FolderKanban } from 'lucide-react'

export default function TeacherGroups() {
  const { user } = useAuth()
  const [groups, setGroups] = useState<Group[]>([])
  const [studentsByGroup, setStudentsByGroup] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    getGroupsByTeacher(user.id).then(setGroups)
  }, [user?.id])

  useEffect(() => {
    if (groups.length === 0) {
      setLoading(false)
      return
    }
    Promise.all(
      groups.map((g) =>
        getStudents().then((s) => s.filter((p) => p.group_id === g.id).length)
      )
    ).then((counts) => {
      const map: Record<string, number> = {}
      groups.forEach((g, i) => {
        map[g.id] = counts[i]
      })
      setStudentsByGroup(map)
      setLoading(false)
    })
  }, [groups])

  if (!user) return null

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Mening guruhlarim
      </h1>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => (
            <Link
              key={g.id}
              to={`/teacher/students/${g.id}`}
              className="block p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-500 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400">
                  <FolderKanban className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{g.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {studentsByGroup[g.id] ?? 0} oquvchi
                  </p>
                </div>
              </div>
            </Link>
          ))}
          {groups.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400">Sizda guruhlar yoq</p>
          )}
        </div>
      )}
    </div>
  )
}
