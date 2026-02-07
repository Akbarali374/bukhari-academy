import { useEffect, useState } from 'react'
import { getTeachers, createTeacher } from '@/lib/data'
import type { Profile } from '@/types'
import { UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = () => getTeachers().then(setTeachers).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const result = await createTeacher(email.trim(), firstName.trim(), lastName.trim(), password)
    setSubmitting(false)
    
    if ('error' in result) {
      // Email allaqachon mavjud bo'lsa
      if (result.error.includes('email') || result.error.includes('allaqachon') || result.error.includes('mavjud')) {
        toast.error(`❌ Bu email allaqachon mavjud: ${email}`, {
          duration: 4000,
          style: {
            background: '#ef4444',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 'bold'
          }
        })
      } else {
        toast.error(result.error)
      }
      return
    }
    
    // Muvaffaqiyatli yaratildi
    toast.success(`✅ Ustoz muvaffaqiyatli qo'shildi!\n📧 Email: ${email}\n🔑 Parol: ${password}`, {
      duration: 5000,
      style: {
        background: '#10b981',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 'bold'
      }
    })
    
    setModal(false)
    setEmail('')
    setFirstName('')
    setLastName('')
    setPassword('')
    load()
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ustozlar</h1>
        <button
          type="button"
          onClick={() => setModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium w-full sm:w-auto"
        >
          <UserPlus className="w-5 h-5" />
          Ustoz qoshish
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : (
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
                {teachers.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{t.last_name} {t.first_name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{t.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
            {teachers.map((t) => (
              <div key={t.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">F.I.O</p>
                    <p className="text-gray-900 dark:text-white font-medium">{t.last_name} {t.first_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-gray-600 dark:text-gray-300">{t.email}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {teachers.length === 0 && (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400">Ustozlar yoq</p>
          )}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Ustoz qoshish</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                type="text"
                placeholder="Familiya"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
              <input
                type="text"
                placeholder="Ism"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
              <input
                type="email"
                placeholder="Email (Gmail)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
              <input
                type="password"
                placeholder="Parol"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
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
                  {submitting ? 'Saqlanmoqda...' : 'Qoshish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
