import { useEffect, useState } from 'react'
import { getGroupsWithTeacher, createStudent } from '@/lib/data'
import type { Group } from '@/types'
import { UserPlus, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminCreateLogin() {
  const [groups, setGroups] = useState<(Group & { teacher?: unknown })[]>([])
  const [groupId, setGroupId] = useState('')
  const [username, setUsername] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getGroupsWithTeacher().then(setGroups)
  }, [])

  // Username ni email formatiga o'tkazish
  function toEmail(input: string): string {
    const trimmed = input.trim().toLowerCase()
    if (trimmed.includes('@')) return trimmed
    return `${trimmed}@bukhari.uz`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!groupId) {
      toast.error('Guruhni tanlang')
      return
    }
    if (!username.trim()) {
      toast.error('Login kiriting')
      return
    }

    const email = toEmail(username)
    setSubmitting(true)
    const result = await createStudent(email, firstName.trim(), lastName.trim(), groupId, password)
    setSubmitting(false)

    if ('error' in result) {
      if (result.error.includes('email') || result.error.includes('allaqachon') || result.error.includes('mavjud')) {
        toast.error(`Bu login allaqachon mavjud: ${username}`, { duration: 4000 })
      } else {
        toast.error(result.error)
      }
      return
    }

    toast.success(
      `O'quvchi qo'shildi!\nLogin: ${username}\nParol: ${password}`,
      { duration: 6000 }
    )

    setUsername('')
    setFirstName('')
    setLastName('')
    setPassword('')
    setGroupId('')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">O'quvchilarga login yaratish</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Login uchun @ belgisi shart emas. Masalan: <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">sanobarhon</span> yoki <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">ali123</span>
      </p>

      <div className="max-w-md bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Guruh</label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              <option value="">Tanlang</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Familiya</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ism</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Login <span className="text-gray-400 font-normal">(@ shart emas)</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="masalan: sanobarhon yoki ali123"
              autoCapitalize="none"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
            {username && !username.includes('@') && (
              <p className="text-xs text-gray-400 mt-1">
                Kirish uchun: <span className="font-mono">{username.trim().toLowerCase()}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parol</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Parolni kiriting"
                className="w-full px-4 py-2 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium disabled:opacity-50"
          >
            <UserPlus className="w-5 h-5" />
            {submitting ? 'Yaratilmoqda...' : 'Login yaratish'}
          </button>
        </form>
      </div>
    </div>
  )
}
