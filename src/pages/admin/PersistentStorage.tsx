import { useState, useEffect } from 'react'
import { persistentStorage } from '@/lib/persistentStorage'
import { Database, Github, Save, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminPersistentStorage() {
  const [gistId, setGistId] = useState('')
  const [githubToken, setGithubToken] = useState('')
  const [isConfigured, setIsConfigured] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setIsConfigured(persistentStorage.isConfigured())
  }, [])

  async function handleSave() {
    if (!gistId.trim() || !githubToken.trim()) {
      toast.error('Barcha maydonlarni to\'ldiring!')
      return
    }

    setSaving(true)
    try {
      persistentStorage.setConfig(gistId.trim(), githubToken.trim())
      setIsConfigured(true)
      toast.success('Sozlamalar saqlandi! Endi ma\'lumotlar butun umrga saqlanadi!', {
        duration: 5000,
        icon: '✅',
        style: {
          background: '#10b981',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 'bold'
        }
      })
    } catch (error) {
      toast.error('Xatolik yuz berdi')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Database className="w-7 h-7 text-primary-600" />
          Doimiy saqlash
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Ma'lumotlarni butun umrga saqlash uchun GitHub Gist sozlang
        </p>
      </div>

      {isConfigured && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">GitHub Gist sozlangan! Ma'lumotlar butun umrga saqlanadi.</span>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Github className="w-5 h-5" />
          GitHub Gist sozlamalari
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Gist ID
            </label>
            <input
              type="text"
              value={gistId}
              onChange={(e) => setGistId(e.target.value)}
              placeholder="a1b2c3d4e5f6g7h8i9j0"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              GitHub Gist ID (masalan: a1b2c3d4e5f6g7h8i9j0)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              GitHub Token
            </label>
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              GitHub Personal Access Token (gist ruxsati bilan)
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Saqlanmoqda...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Saqlash
              </>
            )}
          </button>
        </div>
      </div>

      {/* Yo'riqnoma */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          📖 Qanday sozlash?
        </h3>
        <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li className="flex gap-2">
            <span className="font-bold">1.</span>
            <span>GitHub.com ga kiring</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">2.</span>
            <span>Yangi Gist yarating: <a href="https://gist.github.com" target="_blank" rel="noopener noreferrer" className="underline">gist.github.com</a></span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">3.</span>
            <span>Fayl nomi: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">bukhari-academy-db.json</code></span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">4.</span>
            <span>Mazmun: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">{"{}"}</code></span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">5.</span>
            <span>"Create secret gist" tugmasini bosing</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">6.</span>
            <span>URL'dan Gist ID ni ko'chiring (oxirgi qism)</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">7.</span>
            <span>Settings → Developer settings → Personal access tokens → Generate new token</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">8.</span>
            <span>"gist" ruxsatini belgilang va token yarating</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">9.</span>
            <span>Token'ni ko'chiring va yuqoridagi maydonlarga kiriting</span>
          </li>
        </ol>
      </div>
    </div>
  )
}
