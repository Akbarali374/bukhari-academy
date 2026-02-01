import { useEffect, useState } from 'react'
import { getNews, createNews, deleteNews } from '@/lib/data'
import { useAuth } from '@/context/AuthContext'
import type { News } from '@/types'
import { Plus, Calendar, User, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminNews() {
  const { user } = useAuth()
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleteModal, setDeleteModal] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => getNews().then(setNews).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!user?.id) return
    setSubmitting(true)
    try {
      await createNews(title.trim(), content.trim(), user.id)
      toast.success('Yangilik qo\'shildi')
      setModal(false)
      setTitle('')
      setContent('')
      load()
    } catch (error) {
      toast.error('Xatolik yuz berdi')
    }
    setSubmitting(false)
  }

  async function handleDelete(newsId: string) {
    setDeleting(true)
    try {
      await deleteNews(newsId)
      toast.success('Yangilik o\'chirildi')
      setDeleteModal(null)
      load()
    } catch (error) {
      toast.error('Xatolik yuz berdi')
    }
    setDeleting(false)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Yangiliklar</h1>
        <button
          type="button"
          onClick={() => setModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          Yangilik qo'shish
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-4">
          {news.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex-1">{item.title}</h2>
                <div className="flex items-center gap-2 ml-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {new Date(item.created_at).toLocaleDateString('uz-UZ')}
                  </div>
                  <button
                    onClick={() => setDeleteModal(item.id)}
                    className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4 whitespace-pre-wrap">{item.content}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <User className="w-4 h-4" />
                <span>Admin tomonidan</span>
              </div>
            </div>
          ))}
          {news.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Hali yangiliklar yo'q</p>
            </div>
          )}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Yangilik qo'shish</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sarlavha
                </label>
                <input
                  type="text"
                  placeholder="Yangilik sarlavhasi"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Matn
                </label>
                <textarea
                  placeholder="Yangilik matni..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium disabled:opacity-50"
                >
                  {submitting ? 'Saqlanmoqda...' : 'Qo\'shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Yanglikni o'chirish</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Bu yanglikni o'chirishni xohlaysizmi? Bu amalni bekor qilib bo'lmaydi.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteModal(null)}
                className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteModal)}
                disabled={deleting}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-50"
              >
                {deleting ? 'O\'chirilmoqda...' : 'O\'chirish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}