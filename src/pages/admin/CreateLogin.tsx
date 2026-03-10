import { useEffect, useState } from 'react'
import { getGroupsWithTeacher, createStudent } from '@/lib/data'
import type { Group } from '@/types'
import { UserPlus, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminCreateLogin() {
  const [groups, setGroups] = useState<(Group & { teacher?: unknown })[]>([])
  const [groupId, setGroupId] = useState('')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getGroupsWithTeacher().then(setGroups)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!groupId) {
      toast.error('Guruhni tanlang')
      return
    }
    
    setSubmitting(true)
    const result = await createStudent(email.trim(), firstName.trim(), lastName.trim(), groupId, password)
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
    toast.success(`✅ O'quvchi muvaffaqiyatli qo'shildi!\n📧 Email: ${email}\n🔑 Parol: ${password}`, {
      duration: 5000,
      style: {
        background: '#10b981',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 'bold'
      }
    })
    
    setEmail('')
    setFirstName('')
    setLastName('')
    setPassword('')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">O'quvchilarga login yaratish</h1>

      <div className="max-w-md bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="group-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Guruh</label>
            <select
              id="group-select"
              name="groupId"
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
            <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Familiya</label>
            <input
              id="last-name"
              name="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div>
            <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ism</label>
            <input
              id="first-name"
              name="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div>
            <label htmlFor="email-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email (Gmail — login)</label>
            <input
              id="email-input"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="oquvchi@gmail.com"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div>
            <label htmlFor="password-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parol</label>
            <div className="relative">
              <input
                id="password-input"
                name="password"
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
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
