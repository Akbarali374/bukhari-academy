import { useEffect, useState } from 'react'
import { getProfiles, getPassword, updateProfile } from '@/lib/data'
import type { Profile } from '@/types'
import { Key, Eye, EyeOff } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AdminLogins() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set())
  const [passwords, setPasswords] = useState<Record<string, string>>({})

  // Edit modal state
  const [editProfile, setEditProfile] = useState<Profile | null>(null)
  const [editFirstName, setEditFirstName] = useState('')
  const [editLastName, setEditLastName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editLoading, setEditLoading] = useState(false)

  useEffect(() => {
    getProfiles()
      .then(async (p) => {
        const nonAdminProfiles = p.filter((x) => x.role !== 'admin')
        setProfiles(nonAdminProfiles)
        
        // Load passwords for all profiles
        const passwordMap: Record<string, string> = {}
        for (const profile of nonAdminProfiles) {
          passwordMap[profile.id] = await getPassword(profile.id)
        }
        setPasswords(passwordMap)
      })
      .finally(() => setLoading(false))
  }, [])

  const togglePasswordVisibility = (profileId: string) => {
    const newVisible = new Set(visiblePasswords)
    if (newVisible.has(profileId)) {
      newVisible.delete(profileId)
    } else {
      newVisible.add(profileId)
    }
    setVisiblePasswords(newVisible)
  }

  function openEditModal(profile: Profile) {
    setEditProfile(profile)
    setEditFirstName(profile.first_name)
    setEditLastName(profile.last_name)
    setEditEmail(profile.email)
  }

  async function handleEditSave() {
    if (!editProfile) return
    setEditLoading(true)
    const res = await updateProfile(editProfile.id, {
      first_name: editFirstName,
      last_name: editLastName,
      email: editEmail
    })
    setEditLoading(false)
    if ('error' in res) {
      alert(res.error)
      return
    }
    setEditProfile(null)
    // Reload profiles
    setLoading(true)
    getProfiles()
      .then(async (p) => {
        const nonAdminProfiles = p.filter((x) => x.role !== 'admin')
        setProfiles(nonAdminProfiles)
        const passwordMap: Record<string, string> = {}
        for (const profile of nonAdminProfiles) {
          passwordMap[profile.id] = await getPassword(profile.id)
        }
        setPasswords(passwordMap)
      })
      .finally(() => setLoading(false))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Loginlar royxati</h1>

      {/* Edit modal */}
      {editProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Tahrirlash</h2>
            <form onSubmit={e => { e.preventDefault(); handleEditSave(); }} className="space-y-3">
              <input type="text" value={editLastName} onChange={e => setEditLastName(e.target.value)} placeholder="Familiya" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
              <input type="text" value={editFirstName} onChange={e => setEditFirstName(e.target.value)} placeholder="Ism" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
              <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditProfile(null)} className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Bekor qilish</button>
                <button type="submit" disabled={editLoading} className="flex-1 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium disabled:opacity-50">{editLoading ? 'Saqlanmoqda...' : 'Saqlash'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Rol</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">F.I.O</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Email (login)</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Parol</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Tahrirlash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                        p.role === 'teacher'
                          ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        <Key className="w-3 h-3" />
                        {p.role === 'teacher' ? 'Ustoz' : 'O\'quvchi'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{p.last_name} {p.first_name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 font-mono">{p.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-gray-900 dark:text-white">
                          {visiblePasswords.has(p.id) ? passwords[p.id] : '••••••••'}
                        </span>
                        <button
                          onClick={() => togglePasswordVisibility(p.id)}
                          className="p-1 rounded text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          title={visiblePasswords.has(p.id) ? 'Parolni yashirish' : 'Parolni ko\'rsatish'}
                        >
                          {visiblePasswords.has(p.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openEditModal(p)}
                        className="px-3 py-1 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-sm"
                      >
                        Tahrirlash
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
            {profiles.map((p) => (
              <div key={p.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                      p.role === 'teacher'
                        ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                      <Key className="w-3 h-3" />
                      {p.role === 'teacher' ? 'Ustoz' : 'O\'quvchi'}
                    </span>
                    <button
                      onClick={() => openEditModal(p)}
                      className="px-3 py-1 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-sm"
                    >
                      Tahrirlash
                    </button>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">F.I.O</p>
                    <p className="text-gray-900 dark:text-white font-medium">{p.last_name} {p.first_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email (login)</p>
                    <p className="text-gray-600 dark:text-gray-300 font-mono">{p.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Parol</p>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-gray-900 dark:text-white">
                        {visiblePasswords.has(p.id) ? passwords[p.id] : '••••••••'}
                      </span>
                      <button
                        onClick={() => togglePasswordVisibility(p.id)}
                        className="p-1 rounded text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        title={visiblePasswords.has(p.id) ? 'Parolni yashirish' : 'Parolni ko\'rsatish'}
                      >
                        {visiblePasswords.has(p.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {profiles.length === 0 && (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400">Loginlar yo'q</p>
          )}
        </div>
      )}

      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Yangi login: <Link to="/admin/create-login" className="text-primary-600 dark:text-primary-400 underline">Login yaratish</Link>
      </p>
    </div>
  )
}
