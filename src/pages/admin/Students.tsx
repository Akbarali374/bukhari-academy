import { useEffect, useState } from 'react'
import { getStudents, getGroupsWithTeacher, deleteProfile } from '@/lib/data'
import type { Profile } from '@/types'
import type { Group } from '@/types'
import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminStudents() {
  const [students, setStudents] = useState<Profile[]>([])
  const [groups, setGroups] = useState<(Group & { teacher?: Profile })[]>([])
  const [loading, setLoading] = useState(true)
  const [filterGroup, setFilterGroup] = useState('')
  const [deleteModal, setDeleteModal] = useState<Profile | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const [studentsData, groupsData] = await Promise.all([
      getStudents(),
      getGroupsWithTeacher()
    ])
    setStudents(studentsData)
    setGroups(groupsData)
    setLoading(false)
  }

  async function handleDelete() {
    if (!deleteModal) return
    
    setDeleting(true)
    try {
      await deleteProfile(deleteModal.id)
      toast.success('O\'quvchi o\'chirildi!', {
        icon: '✅',
        style: {
          background: '#10b981',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 'bold'
        }
      })
      setDeleteModal(null)
      loadData()
    } catch (error) {
      console.error('O\'chirishda xato:', error)
      toast.error('O\'chirishda xato yuz berdi')
    } finally {
      setDeleting(false)
    }
  }

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
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{s.last_name} {s.first_name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{s.email}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{getGroupName(s.group_id)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setDeleteModal(s)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-sm font-medium hover:bg-red-200 dark:hover:bg-red-800/40"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                      O'chirish
                    </button>
                  </td>
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

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">O'quvchini o'chirish</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              <strong>{deleteModal.first_name} {deleteModal.last_name}</strong> ni o'chirishni xohlaysizmi?
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 mb-6">
              ⚠️ Bu amalni bekor qilib bo'lmaydi. Barcha baholar, uyga vazifalar va davomatlar ham o'chiriladi!
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteModal(null)}
                disabled={deleting}
                className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    O'chirilmoqda...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    O'chirish
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
