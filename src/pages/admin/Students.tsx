import { useEffect, useState } from 'react'
import { getStudents, getGroupsWithTeacher } from '@/lib/data'
import type { Profile } from '@/types'
import type { Group } from '@/types'
import { Link } from 'react-router-dom'

export default function AdminStudents() {
  const [students, setStudents] = useState<Profile[]>([])
  const [groups, setGroups] = useState<(Group & { teacher?: Profile })[]>([])
  const [loading, setLoading] = useState(true)
  const [filterGroup, setFilterGroup] = useState('')

  useEffect(() => {
    getStudents().then(setStudents)
    getGroupsWithTeacher().then(setGroups)
  }, [])

  useEffect(() => {
    setLoading(false)
  }, [students])

  const filtered = filterGroup
    ? students.filter((s) => s.group_id === filterGroup)
    : students

  const getGroupName = (id: string | null) => groups.find((g) => g.id === id)?.name ?? '—'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Oquvchilar</h1>
        <select
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="">Barcha guruhlar</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">F.I.O</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Email</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Guruh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{s.last_name} {s.first_name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{s.email}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{getGroupName(s.group_id)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400">Oquvchilar yoq</p>
          )}
        </div>
      )}

      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Oquvchilarga login yaratish: <Link to="/admin/create-login" className="text-primary-600 dark:text-primary-400 underline">Login yaratish</Link>
      </p>
    </div>
  )
}
