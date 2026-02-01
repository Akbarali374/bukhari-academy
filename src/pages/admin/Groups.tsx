import { useEffect, useState } from 'react'
import { getGroupsWithTeacher, getTeachers, createGroup } from '@/lib/data'
import type { Group, Profile } from '@/types'
import { FolderPlus } from 'lucide-react'
import toast from 'react-hot-toast'

type GroupWithTeacher = Group & { teacher?: Profile; students_count?: number }

export default function AdminGroups() {
  const [groups, setGroups] = useState<GroupWithTeacher[]>([])
  const [teachers, setTeachers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [name, setName] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = () => getGroupsWithTeacher().then(setGroups).finally(() => setLoading(false))
  useEffect(() => { load() }, [])
  useEffect(() => { getTeachers().then(setTeachers) }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!teacherId) { toast.error('Ustozni tanlang'); return }
    setSubmitting(true)
    try {
      await createGroup(name.trim(), teacherId)
      toast.success('Guruh yaratildi')
      setModal(false)
      setName('')
      setTeacherId('')
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Xatolik')
    }
    setSubmitting(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Guruhlar</h1>
        <button type="button" onClick={() => setModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium">
          <FolderPlus className="w-5 h-5" /> Guruh yaratish
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent" /></div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Guruh nomi</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Ustoz</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Oquvchilar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {groups.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{g.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{g.teacher ? g.teacher.last_name + ' ' + g.teacher.first_name : '—'}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{g.students_count ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {groups.length === 0 && <p className="text-center py-8 text-gray-500 dark:text-gray-400">Guruhlar yoq</p>}
        </div>
      )}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Guruh yaratish</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <input type="text" placeholder="Guruh nomi" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
              <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
                <option value="">Ustozni tanlang</option>
                {teachers.map((t) => <option key={t.id} value={t.id}>{t.last_name} {t.first_name}</option>)}
              </select>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setModal(false)} className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Bekor qilish</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium disabled:opacity-50">{submitting ? 'Saqlanmoqda...' : 'Yaratish'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
